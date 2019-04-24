import React, { useCallback, useContext, useState } from 'react'
import { AppStateContext } from '../../context/AppStateContext'
import { useInputField } from '../../hooks/useInputField'
import { createWaypointFromAddress, replaceWaypoints, setEditorPane } from '../../redux/actions'
import { EditorPane } from '../../redux/state'
import { WaypointEditorTemplate } from '../WaypointEditor'

enum OptimizationParameter {
    Time = 'time',
    Distance = 'distance',
}

const geocoder = new mapkit.Geocoder({ getsUserLocation: true })
const directions = new mapkit.Directions()

const lookupPromise = (place: string) =>
    new Promise<mapkit.GeocodeResponse>((resolve, reject) => {
        geocoder.lookup(place, (error, data) => (error ? reject(error) : resolve(data)))
    })
const routePromise = (request: mapkit.DirectionsRequest) =>
    new Promise<mapkit.DirectionsResponse>(async (resolve, reject) => {
        directions.route(request, (error, data) => (error ? reject(error) : resolve(data)))
    })

export const OptimizerPane = () => {
    const {
        state: { waypoints, fetchedPlaces, fetchedRoutes },
        dispatch,
    } = useContext(AppStateContext)

    const [optimizationInProgress, setOptimizationInProgress] = useState(false)
    const { value: startPointFieldValue, setValue: setStartPointFieldValue } = useInputField('', () => undefined)
    const { value: endPointFieldValue, setValue: setEndPointFieldValue } = useInputField('', () => undefined)

    const handleStartPointFieldChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => setStartPointFieldValue(e.currentTarget.value),
        [],
    )
    const handleEndPointFieldChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEndPointFieldValue(e.currentTarget.value)
    }, [])

    const optimizeDistance = useCallback(() => optimize(OptimizationParameter.Distance), [optimize])
    const optimizeTime = useCallback(() => optimize(OptimizationParameter.Time), [optimize])

    const insufficientWaypoints = waypoints.length < 3

    const defaultStartPoint = () => endPointFieldValue || waypoints[0].address
    const defaultEndPoint = () => endPointFieldValue || startPointFieldValue || waypoints[waypoints.length - 1].address

    async function fetchPlace(waypoint: string) {
        const fetchedPlace = fetchedPlaces.get(waypoint)

        if (fetchedPlace && fetchedPlace.status === 'SUCCESS') return fetchedPlace.result

        const response = await lookupPromise(waypoint)

        const place = response.results[0]
        if (!place) {
            throw new Error(`Place '${waypoint}' not found`)
        }

        return place
    }

    const getRoute = async (waypointA: string, waypointB: string) => {
        const routesFromWaypointA = fetchedRoutes.get(waypointA)
        if (routesFromWaypointA) {
            const fetchedRoute = routesFromWaypointA.get(waypointB)
            if (fetchedRoute && fetchedRoute.status === 'SUCCESS') return fetchedRoute.result
        }

        const placeA = await fetchPlace(waypointA)
        const placeB = await fetchPlace(waypointB)

        const response = await routePromise({ origin: placeA, destination: placeB })
        const route = response.routes[0]

        if (!route) {
            throw new Error(`No routes returned: origin = '${waypointA}', destination = '${waypointB}'`)
        }

        return route
    }

    async function getCost(waypointA: string, waypointB: string, optimizationParameter: OptimizationParameter) {
        if (waypointA === waypointB) return 0

        const route = await getRoute(waypointA, waypointB)

        switch (optimizationParameter) {
            case OptimizationParameter.Distance:
                return route.distance
            case OptimizationParameter.Time:
                return route.expectedTravelTime
        }
    }

    const startPoint = startPointFieldValue || endPointFieldValue
    const endPoint = endPointFieldValue || startPointFieldValue

    async function optimize(optimizationParameter: OptimizationParameter) {
        setOptimizationInProgress(true)
        dispatch({ type: 'CLEAR_ERROR' })

        let optimizationWaypoints: string[]
        if (startPoint) {
            optimizationWaypoints = [startPoint, ...waypoints.map(w => w.address), endPoint]
        } else optimizationWaypoints = waypoints.map(w => w.address)

        try {
            const costMatrix = await Promise.all(
                optimizationWaypoints.map(
                    async waypointA =>
                        await Promise.all(
                            optimizationWaypoints.map(waypointB => getCost(waypointA, waypointB, optimizationParameter)),
                        ),
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
                dispatch({
                    type: 'ERROR_OCCURED',
                    error: new Error(`Failed to optimize route (ERROR: '${await response.text()}')`),
                })
                return
            }

            const jsonResponse: IOptimizeResponse = await response.json()
            const optimalOrdering = startPoint ? jsonResponse.result.slice(1, -1).map(i => i - 1) : jsonResponse.result

            dispatch(replaceWaypoints(optimalOrdering.map(i => waypoints[i].address).map(createWaypointFromAddress)))
            dispatch(setEditorPane(EditorPane.List))
        } catch (e) {
            dispatch({
                type: 'ERROR_OCCURED',
                error: new Error(`Failed to optimize route (ERROR: '${await e}')`),
            })
        }
    }

    return (
        <WaypointEditorTemplate
            body={
                insufficientWaypoints ? (
                    <div className="alert alert-warning" role="alert">
                        Add three or more waypoints to optimize routes
                    </div>
                ) : (
                    <>
                        <div className="alert alert-info" role="alert">
                            Note that the route found will be the most optimal route from start point to end point
                            passing through all waypoints along the way.
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
                )
            }
            footer={
                optimizationInProgress ? (
                    <>
                        <button className="btn btn-primary" disabled={true}>
                            <i className="fas fa-fw fa-spin fa-circle-notch" /> Optimizing (this may take a while)
                        </button>
                    </>
                ) : (
                    <>
                        <button className="btn btn-primary" onClick={optimizeDistance} disabled={insufficientWaypoints}>
                            <i className="fas fa-fw fa-ruler-combined" /> Optimize Distance
                        </button>
                        <button className="btn btn-primary" onClick={optimizeTime} disabled={insufficientWaypoints}>
                            <i className="fas fa-fw fa-clock" /> Optimize Time
                        </button>
                    </>
                )
            }
        />
    )
}
