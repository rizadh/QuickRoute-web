import copyToClipboard from 'copy-text-to-clipboard'
import { chunk } from 'lodash'
import { stringify } from 'query-string'
import React, { useContext, useMemo, useState } from 'react'
import Textarea from 'react-textarea-autosize'
import { appVersion } from '..'
import { AppStateContext } from '../context/AppStateContext'
import { EditorVisibilityContext } from '../context/EditorVisibilityContext'
import { createAndReplaceWaypoints, createWaypoint, reverseWaypoints } from '../redux/actions'
import { routeInformation } from '../redux/selectors'
import { isValidAddress, parseAddress } from '../redux/validator'
import { WaypointList } from './WaypointList'

enum EditorMode {
    Regular,
    Bulk,
    Import,
    Importing,
    ShowUrls,
    Optimizer,
    Optimizing,
}

export const WaypointEditor = () => {
    const [editorMode, setEditorMode] = useState<EditorMode>(EditorMode.Regular)
    const [errorMessage, setErrorMessage] = useState('')
    const [bulkEditFieldValue, setBulkEditFieldValue] = useState('')
    const [newWaypointFieldValue, setNewWaypointFieldValue] = useState('')
    const [driverNumberFieldValue, setDriverNumberFieldValue] = useState('')
    const [startPointFieldValue, setStartPointFieldValue] = useState('')
    const [endPointFieldValue, setEndPointFieldValue] = useState('')
    const { state, dispatch } = useContext(AppStateContext)
    const currentRouteInformation = useMemo(() => routeInformation(state), [state])

    // Regular Functions

    const canAddNewWaypoint = () => {
        return isValidAddress(newWaypointFieldValue)
    }

    const addNewWaypoint = () => {
        dispatch(createWaypoint(newWaypointFieldValue))
        setNewWaypointFieldValue('')
    }

    const handleNewWaypointFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewWaypointFieldValue(e.currentTarget.value)
    }

    const handleNewWaypointFieldKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isValidAddress(newWaypointFieldValue)) {
            addNewWaypoint()
        }
    }

    // Bulk Edit Functions

    const beginBulkEdit = () => {
        setEditorMode(EditorMode.Bulk)
        setErrorMessage('')
        setBulkEditFieldValue(state.waypoints.map(w => w.address).join('\n'))
    }

    const commitBulkEdit = () => {
        const waypoints = bulkEditFieldValue
            .split('\n')
            .filter(isValidAddress)
            .map(parseAddress)

        dispatch(createAndReplaceWaypoints(waypoints))

        setEditorMode(EditorMode.Regular)
        setErrorMessage('')
    }

    const cancelBulkEdit = () => {
        setEditorMode(EditorMode.Regular)
        setErrorMessage('')
    }

    const handleBulkEditFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setBulkEditFieldValue(e.currentTarget.value)
    }

    const handleBulkEditFieldKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.shiftKey) commitBulkEdit()
    }

    // Import Functions

    const beginImportMode = () => {
        setEditorMode(EditorMode.Import)
        setErrorMessage('')
    }

    const executeImport = async () => {
        setEditorMode(EditorMode.Importing)
        setErrorMessage('')

        type FetchedWaypoint = { address: string; city: string; postalCode: string }
        type WaypointsResponse = {
            date: string;
            driverNumber: string;
            waypoints: {
                dispatched: ReadonlyArray<FetchedWaypoint>;
                inprogress: ReadonlyArray<FetchedWaypoint>;
            };
        }

        const url = '/waypoints/' + driverNumberFieldValue
        const httpResponse = await fetch(url)
        if (!httpResponse.ok) {
            setEditorMode(EditorMode.Regular)
            setErrorMessage(
                `Failed to import waypoints for driver ${driverNumberFieldValue} ` +
                    `(ERROR: '${await httpResponse.text()}')`,
            )
            return
        }
        const jsonResponse = await httpResponse.text()
        const response = JSON.parse(jsonResponse) as WaypointsResponse
        const waypoints = [...response.waypoints.dispatched, ...response.waypoints.inprogress]
        const addresses = waypoints.map(w => `${w.address} ${w.postalCode}`)
        dispatch(createAndReplaceWaypoints(addresses))

        setEditorMode(EditorMode.Regular)
        setErrorMessage('')
    }

    const cancelImportMode = () => {
        setEditorMode(EditorMode.Regular)
        setErrorMessage('')
    }

    const handleDriverNumberFieldKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') executeImport()
    }

    const handleDriverNumberFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDriverNumberFieldValue(e.currentTarget.value)
    }

    // URLs Functions

    const showUrls = () => {
        setEditorMode(EditorMode.ShowUrls)
        setErrorMessage('')
    }

    const hideUrls = () => {
        setEditorMode(EditorMode.Regular)
        setErrorMessage('')
    }

    const openUrl = (index: number) => () => {
        window.open(navigationUrls()[index])
    }

    const openAllUrls = () => {
        navigationUrls().forEach(url => window.open(url))
    }

    const copyUrl = (index: number) => () => {
        copyToClipboard(navigationUrls()[index])
    }

    const copyAllUrls = () => {
        copyToClipboard(navigationUrls().join('\n'))
    }

    const navigationUrls = () => {
        return chunk(state.waypoints, 10)
            .map(waypoints => waypoints.map(w => w.address))
            .map(addresses => {
                const destination = addresses.pop()
                const parameters = {
                    api: 1,
                    destination,
                    travelmode: 'driving',
                    waypoints: addresses.length > 0 ? addresses.join('|') : undefined,
                }

                return 'https://www.google.com/maps/dir/?' + stringify(parameters)
            })
    }

    // PDF Functions

    const generatePdf = async () => {
        const response = await fetch('/pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ waypoints: state.waypoints.map(w => w.address) }),
        })

        if (!response.ok) {
            setEditorMode(EditorMode.Regular)
            setErrorMessage(`Failed to generate PDF (ERROR: '${await response.text()}')`)
            return
        }

        const url = window.URL.createObjectURL(await response.blob())

        const a = document.createElement('a')
        a.href = url
        a.style.display = 'none'
        document.body.appendChild(a)
        a.download = 'waypoints.pdf'
        a.click()
        a.remove()

        window.URL.revokeObjectURL(url)
    }

    // Optimizer Functions

    const showOptimizer = () => {
        setEditorMode(EditorMode.Optimizer)
        setErrorMessage('')
    }

    const hideOptimizer = () => {
        setEditorMode(EditorMode.Regular)
        setErrorMessage('')
    }

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
        setEditorMode(EditorMode.Optimizing)
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
                setEditorMode(EditorMode.Regular)
                setErrorMessage(`Failed to optimize route (ERROR: '${await response.text()}')`)
                return
            }

            const jsonResponse: IOptimizeResponse = await response.json()
            const optimalOrdering = startPoint ? jsonResponse.result.slice(1, -1).map(i => i - 1) : jsonResponse.result

            dispatch(createAndReplaceWaypoints(optimalOrdering.map(i => state.waypoints[i].address)))

            setEditorMode(EditorMode.Regular)
            setErrorMessage('')
        } catch (e) {
            setEditorMode(EditorMode.Regular)
            setErrorMessage(`Failed to optimize route (ERROR: '${e}')`)
        }
    }

    // Content Helper Functions

    const headerTitle = (): string => {
        switch (editorMode) {
            case EditorMode.Regular:
                return 'Waypoints'
            case EditorMode.Bulk:
                return 'Bulk Edit'
            case EditorMode.Import:
            case EditorMode.Importing:
                return 'Import Waypoints'
            case EditorMode.ShowUrls:
                return 'Show Links'
            case EditorMode.Optimizer:
            case EditorMode.Optimizing:
                return 'Optimizer'
        }
    }

    const bodyItems = (): JSX.Element | JSX.Element[] => {
        switch (editorMode) {
            case EditorMode.Regular:
                return (
                    <>
                        {currentRouteInformation.status === 'FAILED' && (
                            <div className="alert alert-danger" role="alert">
                                Route could not be found
                            </div>
                        )}
                        {state.waypoints.length === 0 && (
                            <div className="alert alert-info" role="alert">
                                Enter an address to begin
                            </div>
                        )}
                        {state.waypoints.length === 1 && (
                            <div className="alert alert-info" role="alert">
                                Enter another address to show route information
                            </div>
                        )}
                        <WaypointList />
                        <div className="input-row">
                            <input
                                type="text"
                                placeholder="New waypoint"
                                value={newWaypointFieldValue}
                                onChange={handleNewWaypointFieldChange}
                                onKeyPress={handleNewWaypointFieldKeyPress}
                                autoFocus={true}
                            />
                            <button onClick={addNewWaypoint} disabled={!canAddNewWaypoint} className="btn btn-primary">
                                <i className="fas fa-plus" />
                            </button>
                        </div>
                    </>
                )
            case EditorMode.Bulk:
                return (
                    <>
                        <div className="alert alert-info" role="alert">
                            Enter one address per line
                        </div>
                        <div className="input-row">
                            <Textarea
                                minRows={3}
                                onChange={handleBulkEditFieldChange}
                                onKeyPress={handleBulkEditFieldKeyPress}
                                value={bulkEditFieldValue}
                                autoFocus={true}
                            />
                        </div>
                    </>
                )
            case EditorMode.Import:
            case EditorMode.Importing:
                return (
                    <>
                        <div className="alert alert-info" role="alert">
                            Waypoints are imported from Atripco
                        </div>
                        <div className="input-row">
                            <input
                                type="text"
                                placeholder="Driver number"
                                value={driverNumberFieldValue}
                                onChange={handleDriverNumberFieldChange}
                                onKeyPress={handleDriverNumberFieldKeyPress}
                                disabled={editorMode === EditorMode.Importing}
                                autoFocus={true}
                            />
                        </div>
                    </>
                )
            case EditorMode.ShowUrls:
                return navigationUrls().map((url, index) => (
                    <div key={url} className="input-row">
                        <input type="text" value={url} readOnly={true} />
                        <button onClick={copyUrl(index)} className="btn btn-primary">
                            <i className="far fa-clipboard" />
                        </button>
                        <button onClick={openUrl(index)} className="btn btn-primary">
                            <i className="fas fa-external-link-alt" />
                        </button>
                    </div>
                ))
            case EditorMode.Optimizer:
            case EditorMode.Optimizing:
                return (
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
                                disabled={editorMode === EditorMode.Optimizing}
                                autoFocus={true}
                            />
                        </div>
                        <div className="input-row">
                            <input
                                type="text"
                                placeholder={`End Point (default: ${defaultEndPoint()})`}
                                value={endPointFieldValue}
                                onChange={handleEndPointFieldChange}
                                disabled={editorMode === EditorMode.Optimizing}
                            />
                        </div>
                    </>
                )
        }
    }

    const footerItems = (): JSX.Element => {
        switch (editorMode) {
            case EditorMode.Regular:
                return (
                    <>
                        <button className="btn btn-primary" onClick={beginBulkEdit}>
                            <i className="fas fa-list-alt" /> Bulk Edit
                        </button>
                        <button className="btn btn-primary" onClick={beginImportMode}>
                            <i className="fas fa-cloud-download-alt" /> Import Waypoints
                        </button>
                        <button className="btn btn-primary" onClick={showUrls} disabled={state.waypoints.length === 0}>
                            <i className="fas fa-link" /> Show Links
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={generatePdf}
                            disabled={state.waypoints.length === 0}
                        >
                            <i className="fas fa-file-pdf" /> Generate PDF
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => dispatch(reverseWaypoints())}
                            disabled={state.waypoints.length < 2}
                        >
                            <i className="fas fa-exchange-alt" /> Reverse
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={showOptimizer}
                            disabled={state.waypoints.length < 3}
                        >
                            <i className="fas fa-star" /> Optimize
                        </button>
                        <EditorVisibilityContext.Consumer>
                            {context => (
                                <button className="btn btn-primary" onClick={context.hideEditor}>
                                    <i className="far fa-window-maximize" /> Hide Editor
                                </button>
                            )}
                        </EditorVisibilityContext.Consumer>
                    </>
                )
            case EditorMode.Bulk:
                return (
                    <>
                        <button className="btn btn-primary" onClick={commitBulkEdit}>
                            <i className="fas fa-save" /> Save
                        </button>
                        <button className="btn btn-secondary" onClick={cancelBulkEdit}>
                            <i className="fas fa-chevron-left" /> Back
                        </button>
                    </>
                )
            case EditorMode.Import:
                return (
                    <>
                        <button className="btn btn-primary" onClick={executeImport}>
                            <i className="fas fa-cloud-download-alt" /> Import
                        </button>
                        <button className="btn btn-secondary" onClick={cancelImportMode}>
                            <i className="fas fa-chevron-left" /> Back
                        </button>
                    </>
                )
            case EditorMode.Importing:
                return (
                    <>
                        <button className="btn btn-primary" disabled={true}>
                            <i className="fas fa-spin fa-circle-notch" /> Importing
                        </button>
                    </>
                )
            case EditorMode.ShowUrls:
                return (
                    <>
                        <button className="btn btn-primary" onClick={openAllUrls}>
                            <i className="fas fa-external-link-alt" /> Open All
                        </button>
                        <button className="btn btn-primary" onClick={copyAllUrls}>
                            <i className="far fa-clipboard" /> Copy All
                        </button>
                        <button className="btn btn-secondary" onClick={hideUrls}>
                            <i className="fas fa-chevron-left" /> Back
                        </button>
                    </>
                )
            case EditorMode.Optimizer:
                return (
                    <>
                        <button className="btn btn-primary" onClick={optimizeDistance}>
                            <i className="fas fa-ruler-combined" /> Optimize Distance
                        </button>
                        <button className="btn btn-primary" onClick={optimizeTime}>
                            <i className="fas fa-clock" /> Optimize Time
                        </button>
                        <button className="btn btn-secondary" onClick={hideOptimizer}>
                            <i className="fas fa-chevron-left" /> Back
                        </button>
                    </>
                )
            case EditorMode.Optimizing:
                return (
                    <>
                        <button className="btn btn-primary" disabled={true}>
                            <i className="fas fa-spin fa-circle-notch" /> Optimizing (this may take a while)
                        </button>
                    </>
                )
        }
    }

    return (
        <div id="waypoint-editor">
            <div id="waypoint-editor-header">
                <div id="app-title">
                    Route Planner {appVersion} by <a href="https://github.com/rizadh">@rizadh</a>
                </div>
                <div id="waypoint-editor-title">{headerTitle()}</div>
            </div>
            <div>
                {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
                    </div>
                )}
                {bodyItems()}
            </div>
            <div id="waypoint-editor-footer">{footerItems()}</div>
        </div>
    )
}
