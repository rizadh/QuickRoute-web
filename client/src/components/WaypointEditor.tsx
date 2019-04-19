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

type EditorMode = 'REGULAR' | 'BULK' | 'IMPORT' | 'IMPORTING' | 'SHOW_URLS' | 'OPTIMIZER' | 'OPTIMIZING'

export const WaypointEditor = () => {
    const [editorMode, setEditorMode] = useState<EditorMode>('REGULAR')
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
        setEditorMode('BULK')
        setErrorMessage('')
        setBulkEditFieldValue(state.waypoints.map(w => w.address).join('\n'))
    }

    const commitBulkEdit = () => {
        const waypoints = bulkEditFieldValue
            .split('\n')
            .filter(isValidAddress)
            .map(parseAddress)

        dispatch(createAndReplaceWaypoints(waypoints))

        setEditorMode('REGULAR')
        setErrorMessage('')
    }

    const cancelBulkEdit = () => {
        setEditorMode('REGULAR')
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
        setEditorMode('IMPORT')
        setErrorMessage('')
    }

    const executeImport = async () => {
        setEditorMode('IMPORTING')
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
            setEditorMode('REGULAR')
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

        setEditorMode('REGULAR')
        setErrorMessage('')
    }

    const cancelImportMode = () => {
        setEditorMode('REGULAR')
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
        setEditorMode('SHOW_URLS')
        setErrorMessage('')
    }

    const hideUrls = () => {
        setEditorMode('REGULAR')
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
            setEditorMode('REGULAR')
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
        setEditorMode('OPTIMIZER')
        setErrorMessage('')
    }

    const hideOptimizer = () => {
        setEditorMode('REGULAR')
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
        setEditorMode('OPTIMIZING')
        setErrorMessage('')

        const startPoint = startPointFieldValue || endPointFieldValue
        const endPoint = endPointFieldValue || startPointFieldValue

        let waypoints: string[]
        if (startPoint) {
            waypoints = [startPoint, ...state.waypoints.map(w => w.address), endPoint]
        } else waypoints = state.waypoints.map(w => w.address)

        try {
            const costMatrix = await getCostMatrix(waypoints, optimizationParameter)

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
                setEditorMode('REGULAR')
                setErrorMessage(`Failed to optimize route (ERROR: '${await response.text()}')`)
                return
            }

            const jsonResponse: IOptimizeResponse = await response.json()
            const optimalOrdering = startPoint ? jsonResponse.result.slice(1, -1).map(i => i - 1) : jsonResponse.result

            dispatch(createAndReplaceWaypoints(optimalOrdering.map(i => state.waypoints[i].address)))

            setEditorMode('REGULAR')
            setErrorMessage('')
        } catch (e) {
            setEditorMode('REGULAR')
            setErrorMessage(`Failed to optimize route (ERROR: '${e}')`)
        }
    }

    async function getCostMatrix(waypoints: string[], optimizationParameter: 'DISTANCE' | 'TIME'): Promise<number[][]> {
        const geocoder = new mapkit.Geocoder({ getsUserLocation: true })
        const directions = new mapkit.Directions()

        return await Promise.all(
            waypoints.map(
                async waypointA =>
                    await Promise.all(
                        waypoints.map(
                            waypointB =>
                                new Promise<number>(async (resolve, reject) => {
                                    if (waypointA === waypointB) return resolve(0)

                                    let placeA: mapkit.Place
                                    let placeB: mapkit.Place

                                    const fetchedPlaceA = state.fetchedPlaces.get(waypointA)

                                    if (fetchedPlaceA && fetchedPlaceA.status === 'SUCCESS') {
                                        placeA = fetchedPlaceA.result
                                    } else {
                                        placeA = await new Promise((resolvePlace, rejectPlace) => {
                                            geocoder.lookup(waypointA, (error, data) => {
                                                if (error) return rejectPlace(error)

                                                const place = data.results[0]
                                                if (!place) {
                                                    return rejectPlace(new Error(`Place '${waypointA}' not found`))
                                                }

                                                resolvePlace(place)
                                            })
                                        })
                                    }

                                    const fetchedPlaceB = state.fetchedPlaces.get(waypointB)

                                    if (fetchedPlaceB && fetchedPlaceB.status === 'SUCCESS') {
                                        placeB = fetchedPlaceB.result
                                    } else {
                                        placeB = await new Promise((resolvePlace, rejectPlace) => {
                                            geocoder.lookup(waypointB, (error, data) => {
                                                if (error) return rejectPlace(error)

                                                const place = data.results[0]
                                                if (!place) {
                                                    return rejectPlace(new Error(`Place '${waypointB}' not found`))
                                                }

                                                resolvePlace(place)
                                            })
                                        })
                                    }

                                    directions.route({ origin: placeA, destination: placeB }, (error, data) => {
                                        if (error) return reject(error)

                                        const route = data.routes[0]

                                        if (!route) {
                                            return reject(
                                                new Error(
                                                    `No routes returned: ` +
                                                        `origin = '${waypointA}', destination = '${waypointB}'`,
                                                ),
                                            )
                                        }

                                        switch (optimizationParameter) {
                                            case 'DISTANCE':
                                                return resolve(route.distance)
                                            case 'TIME':
                                                return resolve(route.expectedTravelTime)
                                        }
                                    })
                                }),
                        ),
                    ),
            ),
        )
    }

    // Content Helper Functions

    const headerTitle = (): string => {
        switch (editorMode) {
            case 'REGULAR':
                return 'Waypoints'
            case 'BULK':
                return 'Bulk Edit'
            case 'IMPORT':
            case 'IMPORTING':
                return 'Import Waypoints'
            case 'SHOW_URLS':
                return 'Show Links'
            case 'OPTIMIZER':
            case 'OPTIMIZING':
                return 'Optimizer'
        }
    }

    const bodyItems = (): JSX.Element | JSX.Element[] => {
        switch (editorMode) {
            case 'REGULAR':
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
            case 'BULK':
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
            case 'IMPORT':
            case 'IMPORTING':
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
                                disabled={editorMode === 'IMPORTING'}
                                autoFocus={true}
                            />
                        </div>
                    </>
                )
            case 'SHOW_URLS':
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
            case 'OPTIMIZER':
            case 'OPTIMIZING':
                return (
                    <>
                        <div className="alert alert-info" role="alert">
                            Note that the route found will be the most optimal route from start point to end point
                            passing through all waypoints along the way.
                        </div>
                        <div className="input-row">
                            <input
                                type="text"
                                placeholder={`Start Point (default: ${defaultStartPoint})`}
                                value={startPointFieldValue}
                                onChange={handleStartPointFieldChange}
                                disabled={editorMode === 'OPTIMIZING'}
                                autoFocus={true}
                            />
                        </div>
                        <div className="input-row">
                            <input
                                type="text"
                                placeholder={`End Point (default: ${defaultEndPoint})`}
                                value={endPointFieldValue}
                                onChange={handleEndPointFieldChange}
                                disabled={editorMode === 'OPTIMIZING'}
                            />
                        </div>
                    </>
                )
        }
    }

    const footerItems = (): JSX.Element => {
        switch (editorMode) {
            case 'REGULAR':
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
            case 'BULK':
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
            case 'IMPORT':
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
            case 'IMPORTING':
                return (
                    <>
                        <button className="btn btn-primary" disabled={true}>
                            <i className="fas fa-spin fa-circle-notch" /> Importing
                        </button>
                    </>
                )
            case 'SHOW_URLS':
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
            case 'OPTIMIZER':
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
            case 'OPTIMIZING':
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
