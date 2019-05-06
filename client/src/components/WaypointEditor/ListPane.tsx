import React, { useCallback, useContext, useMemo } from 'react'
import { WaypointEditorTemplate } from '.'
import { AppStateContext } from '../../context/AppStateContext'
import { useInputField } from '../../hooks/useInputField'
import { useMedia } from '../../hooks/useMedia'
import { routeInformation } from '../../redux/selectors'
import { createWaypointFromAddress } from '../../redux/util'
import { isValidAddress } from '../../redux/validator'
import { WaypointList } from '../WaypointList'

export const ListPane = () => {
    const {
        value: newWaypointFieldValue,
        setValue: setNewWaypointFieldValue,
        changeHandler: handleNewWaypointFieldChange,
        keyPressHandler: handleNewWaypointFieldKeyPress,
    } = useInputField('', () => isValidAddress(newWaypointFieldValue) && addNewWaypoint())

    const { state, dispatch } = useContext(AppStateContext)
    const {
        waypoints: { list: waypoints },
    } = state

    const compactMode = useMedia('(max-width: 800px)')

    const currentRouteInformation = useMemo(() => routeInformation(state), [state])

    const hideEditorPane = useCallback(() => dispatch({ type: 'HIDE_EDITOR_PANE' }), [])

    const reverseWaypoints = useCallback(() => dispatch({ type: 'REVERSE_WAYPOINTS' }), [])
    const addNewWaypoint = useCallback(() => {
        dispatch({ type: 'ADD_WAYPOINT', waypoint: createWaypointFromAddress(newWaypointFieldValue) })
        setNewWaypointFieldValue('')
    }, [newWaypointFieldValue])

    const generatePdf = useCallback(async () => {
        dispatch({ type: 'CLEAR_ERROR' })

        const response = await fetch('pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ waypoints: waypoints.map(w => w.address) }),
        })

        if (!response.ok) {
            dispatch({
                type: 'ERROR_OCCURED',
                error: new Error(`Failed to generate PDF (ERROR: '${await response.text()}')`),
            })
            return
        }

        const url = window.URL.createObjectURL(await response.blob())

        const a = document.createElement('a')
        document.body.appendChild(a)
        a.href = url
        a.style.display = 'none'
        a.download = 'waypoints.pdf'
        a.click()
        a.remove()
    }, [waypoints])

    const shareWaypoints = useCallback(async () => {
        try {
            await (navigator as INavigator).share({
                title: 'Waypoints PDF',
                text: waypoints.map(w => w.address).join('\n'),
            })
        } catch (e) {
            if (e instanceof Error && e.name !== 'AbortError') {
                dispatch({
                    type: 'ERROR_OCCURED',
                    error: new Error(`Share failed: ${e.message}`),
                })
            }
        }
    }, [waypoints])

    return (
        <WaypointEditorTemplate
            body={
                <>
                    {currentRouteInformation.status === 'FAILED' && (
                        <div className="alert alert-danger" role="alert">
                            Route could not be found
                        </div>
                    )}
                    {waypoints.length === 0 && (
                        <div className="alert alert-info" role="alert">
                            Enter an address to begin
                        </div>
                    )}
                    {waypoints.length === 1 && (
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
                            <i className="fas fa-fw fa-plus" />
                        </button>
                    </div>
                </>
            }
            footer={
                <>
                    <button className="btn btn-primary" onClick={generatePdf} disabled={waypoints.length === 0}>
                        <i className="fas fa-fw fa-file-pdf" /> Generate PDF
                    </button>
                    <button className="btn btn-primary" onClick={reverseWaypoints} disabled={waypoints.length < 2}>
                        <i className="fas fa-fw fa-exchange-alt" /> Reverse
                    </button>
                    {(navigator as INavigator).share && (
                        <button className="btn btn-primary" onClick={shareWaypoints} disabled={waypoints.length === 0}>
                            <i className="fas fa-fw fa-share" /> Share
                        </button>
                    )}
                    {compactMode && (
                        <button className="btn btn-primary" onClick={hideEditorPane}>
                            <i className="fas fa-fw fa-window-maximize" /> Hide Editor
                        </button>
                    )}
                </>
            }
        />
    )
}
