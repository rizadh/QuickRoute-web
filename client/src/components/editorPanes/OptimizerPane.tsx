import React, { useCallback, useContext, useState } from 'react'
import { AppStateContext } from '../../context/AppStateContext'
import { createAndReplaceWaypoints } from '../../redux/actions'
import { EditorPane, WaypointEditorContext, WaypointEditorTemplate } from '../WaypointEditor'

export const OptimizerPane = () => {
    const { state, dispatch } = useContext(AppStateContext)
    const setEditorMode = useContext(WaypointEditorContext)
    const [errorMessage, setErrorMessage] = useState('')
    const [startPointFieldValue, setStartPointFieldValue] = useState('')
    const [endPointFieldValue, setEndPointFieldValue] = useState('')
    const setEditorModeWaypointList = useCallback(() => setEditorMode(EditorPane.List), [setEditorMode])
    const [optimizationInProgress, setOptimizationInProgress] = useState(false)

    const defaultStartPoint = () => {
        return endPointFieldValue || state.waypoints[0].address
    }

    const defaultEndPoint = () => {
        return startPointFieldValue || state.waypoints[state.waypoints.length - 1].address
    }

    const handleStartPointFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartPointFieldValue(e.currentTarget.value)
    }

    const handleEndPointFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndPointFieldValue(e.currentTarget.value)
    }

    const optimizeTime = () => optimize('TIME')
    const optimizeDistance = () => optimize('DISTANCE')

    const optimize = async (optimizationParameter: 'TIME' | 'DISTANCE') => {
        setOptimizationInProgress(true)
        setErrorMessage('')

        const geocoder = new mapkit.Geocoder({ getsUserLocation: true })
        const directions = new mapkit.Directions()

        const lookupPromise = (place: string) =>
            new Promise<mapkit.GeocodeResponse>((resolve, reject) => {
                geocoder.lookup(place, (error, data) => (error ? reject(error) : resolve(data)))
            })
        const fetchPlace = async (waypoint: string) => {
            const fetchedPlace = state.fetchedPlaces.get(waypoint)

            if (fetchedPlace && fetchedPlace.status === 'SUCCESS') {
                return fetchedPlace.result
            } else {
                const response = await lookupPromise(waypoint)

                const place = response.results[0]
                if (!place) {
                    throw new Error(`Place '${waypoint}' not found`)
                }

                return place
            }
        }
        const routePromise = (request: mapkit.DirectionsRequest) =>
            new Promise<mapkit.DirectionsResponse>(async (resolve, reject) => {
                directions.route(request, (error, data) => (error ? reject(error) : resolve(data)))
            })
        const getRoute = async (waypointA: string, waypointB: string) => {
            const placeA = await fetchPlace(waypointA)
            const placeB = await fetchPlace(waypointB)

            const response = await routePromise({ origin: placeA, destination: placeB })
            const route = response.routes[0]

            if (!route) {
                throw new Error(`No routes returned: origin = '${waypointA}', destination = '${waypointB}'`)
            }

            return route
        }
        const getCost = async (waypointA: string, waypointB: string) => {
            if (waypointA === waypointB) return 0

            const route = await getRoute(waypointA, waypointB)

            switch (optimizationParameter) {
                case 'DISTANCE':
                    return route.distance
                case 'TIME':
                    return route.expectedTravelTime
            }
        }

        const startPoint = startPointFieldValue || endPointFieldValue
        const endPoint = endPointFieldValue || startPointFieldValue

        let waypoints: string[]
        if (startPoint) {
            waypoints = [startPoint, ...state.waypoints.map(w => w.address), endPoint]
        } else waypoints = state.waypoints.map(w => w.address)

        try {
            const costMatrix = await Promise.all(
                waypoints.map(
                    async waypointA => await Promise.all(waypoints.map(waypointB => getCost(waypointA, waypointB))),
                ),
            )

            const response = await fetch('/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ costMatrix }),
            })

            interface IOptimizeResponse {
                result: number[]
            }

            if (!response.ok) {
                setEditorMode(EditorPane.List)
                setErrorMessage(`Failed to optimize route (ERROR: '${await response.text()}')`)
                return
            }

            const jsonResponse: IOptimizeResponse = await response.json()
            const optimalOrdering = startPoint ? jsonResponse.result.slice(1, -1).map(i => i - 1) : jsonResponse.result

            dispatch(createAndReplaceWaypoints(optimalOrdering.map(i => state.waypoints[i].address)))

            setEditorMode(EditorPane.List)
            setErrorMessage('')
        } catch (e) {
            setEditorMode(EditorPane.List)
            setErrorMessage(`Failed to optimize route (ERROR: '${e}')`)
        }
    }

    return (
        <WaypointEditorTemplate
            title="Optimizer"
            errorMessage={errorMessage}
            body={
                <>
                    <div className="alert alert-info" role="alert">
                        Note that the route found will be the most optimal route from start point to end point passing
                        through all waypoints along the way.
                    </div>
                    <div className="input-row">
                        <input
                            type="text"
                            placeholder={`Start Point (default: ${defaultStartPoint()})`}
                            value={startPointFieldValue}
                            onChange={handleStartPointFieldChange}
                            disabled={optimizationInProgress}
                            autoFocus={true}
                        />
                    </div>
                    <div className="input-row">
                        <input
                            type="text"
                            placeholder={`End Point (default: ${defaultEndPoint()})`}
                            value={endPointFieldValue}
                            onChange={handleEndPointFieldChange}
                            disabled={optimizationInProgress}
                        />
                    </div>
                </>
            }
            footer={
                optimizationInProgress ? (
                    <>
                        <button className="btn btn-primary" disabled={true}>
                            <i className="fas fa-spin fa-circle-notch" /> Optimizing (this may take a while)
                        </button>
                    </>
                ) : (
                    <>
                        <button className="btn btn-primary" onClick={optimizeDistance}>
                            <i className="fas fa-ruler-combined" /> Optimize Distance
                        </button>
                        <button className="btn btn-primary" onClick={optimizeTime}>
                            <i className="fas fa-clock" /> Optimize Time
                        </button>
                        <button className="btn btn-secondary" onClick={setEditorModeWaypointList}>
                            <i className="fas fa-chevron-left" /> Back
                        </button>
                    </>
                )
            }
        />
    )
}
