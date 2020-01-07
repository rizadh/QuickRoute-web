import { saveAs } from 'file-saver'
import isMobileFn from 'ismobilejs'
import React, { useCallback, useContext, useMemo } from 'react'
import { WaypointEditorTemplate } from '.'
import { apiPrefix } from '../..'
import { AppStateContext } from '../../context/AppStateContext'
import { useCompactMode } from '../../hooks/useCompactMode'
import { useInputField } from '../../hooks/useInputField'
import { routeInformation } from '../../redux/selectors'
import { createWaypointFromAddress } from '../../redux/util/createWaypointFromAddress'
import { isValidAddress } from '../../redux/validator'
import { Button } from '../Button'
import { WaypointList } from '../WaypointList'

export const WaypointsPane = () => {
    const {
        value: newWaypointFieldValue,
        setValue: setNewWaypointFieldValue,
        changeHandler: handleNewWaypointFieldChange,
        keyPressHandler: handleNewWaypointFieldKeyPress,
    } = useInputField('', () => isValidAddress(newWaypointFieldValue) && addNewWaypoint())

    const { state, dispatch } = useContext(AppStateContext)
    const compactMode = useCompactMode()
    const { waypoints } = state

    const currentRouteInformation = useMemo(() => routeInformation(state), [state])

    const reverseWaypoints = useCallback(() => dispatch({ type: 'REVERSE_WAYPOINTS' }), [])

    const addNewWaypoint = useCallback(() => {
        dispatch({ type: 'ADD_WAYPOINT', waypoint: createWaypointFromAddress(newWaypointFieldValue) })
        setNewWaypointFieldValue('')
    }, [newWaypointFieldValue])

    const deleteSelectedWaypoints = useCallback(() => dispatch({ type: 'DELETE_SELECTED_WAYPOINTS' }), [])

    const deselectAllWaypoints = useCallback(() => dispatch({ type: 'DESELECT_ALL_WAYPOINTS' }), [])

    const generatePdf = useCallback(async () => {
        dispatch({ type: 'CLEAR_ERROR' })

        const response = await fetch(apiPrefix + 'pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ waypoints: waypoints.map(w => w.address) }),
        })

        if (!response.ok) {
            dispatch({
                type: 'ERROR_OCCURRED',
                error: new Error(`Failed to generate PDF (ERROR: '${await response.text()}')`),
            })
            return
        }

        saveAs(await response.blob(), 'waypoints.pdf')
    }, [waypoints])

    const shareWaypoints = useCallback(async () => {
        const searchParams = new URLSearchParams()
        searchParams.set('waypoints', JSON.stringify(waypoints.map(w => w.address)))

        try {
            await (navigator as INavigator).share({
                url: location.origin + location.pathname + '?' + searchParams.toString(),
            })
        } catch (e) {
            if (e instanceof Error && e.name !== 'AbortError') {
                dispatch({
                    type: 'ERROR_OCCURRED',
                    error: new Error(`Share failed: ${e.message}`),
                })
            }
        }
    }, [waypoints])

    const isMobileDevice = isMobileFn().any

    const body = (
        <>
            {currentRouteInformation.status === 'FAILED' && (
                <div className="text text-danger" role="alert">
                    One or more waypoints could not be routed
                </div>
            )}
            {waypoints.length === 0 && (
                <div className="text text-secondary" role="alert">
                    Enter an address to begin
                </div>
            )}
            {waypoints.length === 1 && (
                <div className="text text-secondary" role="alert">
                    Enter another address to show route information
                </div>
            )}
            <WaypointList />
        </>
    )

    const selectedWaypointsCount = waypoints.filter(waypoint => waypoint.selected).length

    const footer =
        selectedWaypointsCount > 0 ? (
            <>
                <Button type="danger" onClick={deleteSelectedWaypoints}>
                    <i className="fas fa-fw fa-trash" /> Delete {selectedWaypointsCount}{' '}
                    {selectedWaypointsCount > 1 ? 'Waypoints' : 'Waypoint'}
                </Button>
                <Button type="primary" onClick={deselectAllWaypoints}>
                    <i className="fas fa-fw fa-ban" /> Cancel
                </Button>
            </>
        ) : (
            <>
                <div className="input-row">
                    <input
                        type="text"
                        placeholder="New waypoint"
                        value={newWaypointFieldValue}
                        onChange={handleNewWaypointFieldChange}
                        onKeyPress={handleNewWaypointFieldKeyPress}
                        autoFocus={!isMobileDevice}
                    />
                    <Button
                        title="Add waypoint"
                        onClick={addNewWaypoint}
                        disabled={!isValidAddress(newWaypointFieldValue)}
                        type="primary"
                    >
                        <i className="fas fa-fw fa-plus" />
                    </Button>
                </div>
                <Button type="primary" onClick={generatePdf} disabled={waypoints.length === 0}>
                    <i className={'fas fa-fw fa-' + (compactMode ? 'download' : 'file-pdf')} />
                    {compactMode ? ' PDF' : ' Save PDF'}
                </Button>
                <Button type="primary" onClick={reverseWaypoints} disabled={waypoints.length < 2}>
                    <i className="fas fa-fw fa-exchange-alt" /> Reverse
                </Button>
                {(navigator as INavigator).share && (
                    <Button type="primary" onClick={shareWaypoints} disabled={waypoints.length === 0}>
                        <i className="fas fa-fw fa-share" /> Share
                    </Button>
                )}
            </>
        )

    return <WaypointEditorTemplate body={body} footer={footer} />
}
