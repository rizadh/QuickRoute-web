import React, { useCallback, useContext, useMemo, useState } from 'react'
import { AppStateContext } from '../../context/AppStateContext'
import { EditorVisibilityContext } from '../../context/EditorVisibilityContext'
import { createWaypoint, reverseWaypoints as reverseWaypointsCreator } from '../../redux/actions'
import { routeInformation } from '../../redux/selectors'
import { isValidAddress } from '../../redux/validator'
import { EditorPane, WaypointEditorContext, WaypointEditorTemplate } from '../WaypointEditor'
import { WaypointList } from '../WaypointList'

export const ListPane = () => {
    const [errorMessage, setErrorMessage] = useState('')
    const [newWaypointFieldValue, setNewWaypointFieldValue] = useState('')
    const { state, dispatch } = useContext(AppStateContext)
    const { hideEditor } = useContext(EditorVisibilityContext)
    const setEditorMode = useContext(WaypointEditorContext)
    const currentRouteInformation = useMemo(() => routeInformation(state), [state])
    const setEditorModeBulk = useCallback(() => setEditorMode(EditorPane.BulkEdit), [setEditorMode])
    const setEditorModeOptimizer = useCallback(() => setEditorMode(EditorPane.Optimizer), [setEditorMode])
    const setEditorModeShowUrls = useCallback(() => setEditorMode(EditorPane.Urls), [setEditorMode])
    const setEditorModeImport = useCallback(() => setEditorMode(EditorPane.Import), [setEditorMode])
    const reverseWaypoints = useCallback(() => dispatch(reverseWaypointsCreator()), [dispatch])

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

    const generatePdf = async () => {
        const response = await fetch('/pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ waypoints: state.waypoints.map(w => w.address) }),
        })

        if (!response.ok) {
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

    return (
        <WaypointEditorTemplate
            title="Waypoints"
            errorMessage={errorMessage}
            body={
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
                        <button
                            onClick={addNewWaypoint}
                            disabled={!isValidAddress(newWaypointFieldValue)}
                            className="btn btn-primary"
                        >
                            <i className="fas fa-plus" />
                        </button>
                    </div>
                </>
            }
            footer={
                <>
                    <button className="btn btn-primary" onClick={setEditorModeBulk}>
                        <i className="fas fa-list-alt" /> Bulk Edit
                    </button>
                    <button className="btn btn-primary" onClick={setEditorModeImport}>
                        <i className="fas fa-cloud-download-alt" /> Import Waypoints
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={setEditorModeShowUrls}
                        disabled={state.waypoints.length === 0}
                    >
                        <i className="fas fa-link" /> Show Links
                    </button>
                    <button className="btn btn-primary" onClick={generatePdf} disabled={state.waypoints.length === 0}>
                        <i className="fas fa-file-pdf" /> Generate PDF
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={reverseWaypoints}
                        disabled={state.waypoints.length < 2}
                    >
                        <i className="fas fa-exchange-alt" /> Reverse
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={setEditorModeOptimizer}
                        disabled={state.waypoints.length < 3}
                    >
                        <i className="fas fa-star" /> Optimize
                    </button>
                    <button className="btn btn-primary" onClick={hideEditor}>
                        <i className="far fa-window-maximize" /> Hide Editor
                    </button>
                </>
            }
        />
    )
}
