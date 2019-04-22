import React, { useCallback, useContext, useMemo, useState } from 'react'
import { AppStateContext } from '../../context/AppStateContext'
import { useInputField } from '../../hooks/useInputField'
import { createWaypoint, reverseWaypoints as reverseWaypointsActionCreator, setEditorPane } from '../../redux/actions'
import { routeInformation } from '../../redux/selectors'
import { EditorPane } from '../../redux/state'
import { isValidAddress } from '../../redux/validator'
import { WaypointEditorTemplate } from '../WaypointEditor'
import { WaypointList } from '../WaypointList'

export const ListPane = () => {
    const [errorMessage, setErrorMessage] = useState('')
    const {
        value: newWaypointFieldValue,
        setValue: setNewWaypointFieldValue,
        changeHandler: handleNewWaypointFieldChange,
        keyPressHandler: handleNewWaypointFieldKeyPress,
    } = useInputField('', () => isValidAddress(newWaypointFieldValue) && addNewWaypoint())

    const { state, dispatch } = useContext(AppStateContext)

    const currentRouteInformation = useMemo(() => routeInformation(state), [state])

    const setEditorPaneBulk = useCallback(() => dispatch(setEditorPane(EditorPane.BulkEdit)), [])
    const setEditorPaneOptimizer = useCallback(() => dispatch(setEditorPane(EditorPane.Optimizer)), [])
    const setEditorPaneShowUrls = useCallback(() => dispatch(setEditorPane(EditorPane.Urls)), [])
    const setEditorPaneImport = useCallback(() => dispatch(setEditorPane(EditorPane.Import)), [])
    const setEditorPaneNone = useCallback(() => dispatch(setEditorPane()), [])

    const reverseWaypoints = useCallback(() => dispatch(reverseWaypointsActionCreator()), [])
    const addNewWaypoint = useCallback(() => {
        dispatch(createWaypoint(newWaypointFieldValue))
        setNewWaypointFieldValue('')
    }, [newWaypointFieldValue])

    const generatePdf = useCallback(async () => {
        setErrorMessage('')

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
    }, [state])

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
                    <button className="btn btn-primary" onClick={setEditorPaneBulk}>
                        <i className="fas fa-list-alt" /> Bulk Edit
                    </button>
                    <button className="btn btn-primary" onClick={setEditorPaneImport}>
                        <i className="fas fa-cloud-download-alt" /> Import Waypoints
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={setEditorPaneShowUrls}
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
                        onClick={setEditorPaneOptimizer}
                        disabled={state.waypoints.length < 3}
                    >
                        <i className="fas fa-star" /> Optimize
                    </button>
                    <button className="hide-editor-button btn btn-primary" onClick={setEditorPaneNone}>
                        <i className="far fa-window-maximize" /> Hide Editor
                    </button>
                </>
            }
        />
    )
}
