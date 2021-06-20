import isMobileFn from 'ismobilejs'
import React, { Dispatch, useCallback } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useInput } from '../../../hooks/useInput'
import { AppAction } from '../../../redux/actionTypes'
import { routeInformation } from '../../../redux/selectors'
import { AppState } from '../../../redux/state'
import { createWaypointFromAddress } from '../../../redux/util/createWaypointFromAddress'
import { isValidAddress } from '../../../redux/validator'
import { Alert } from '../../common/Alert'
import { DangerAlert } from '../../common/Alert'
import { Button, Variant } from '../../common/Button'
import { Input } from '../../common/Input'
import { InputRow } from '../../common/InputRow'
import { Body, Footer } from '../Editor'
import { WaypointList } from './WaypointList'
import persistanceManager from '../../../redux/util/PersistanceManager'
import { Link } from '../../common/Link'

export const WaypointsPane = () => {
    const waypoints = useSelector((state: AppState) => state.waypoints)
    const currentRouteInformation = useSelector(routeInformation, shallowEqual)
    const dispatch: Dispatch<AppAction> = useDispatch()

    const waypointField = useInput({
        predicate: isValidAddress,
        onCommit: useCallback(
            (waypoint: string) => {
                dispatch({ type: 'ADD_WAYPOINT', waypoint: createWaypointFromAddress(waypoint) })
            },
            [dispatch],
        ),
        resetAfterCommit: true,
    })
    const addWaypoint = useCallback(() => {
        waypointField.commitValue()
        waypointField.resetValue()
    }, [waypointField])

    const reverseWaypoints = useCallback(() => dispatch({ type: 'REVERSE_WAYPOINTS' }), [dispatch])
    const deleteSelectedWaypoints = useCallback(() => dispatch({ type: 'DELETE_SELECTED_WAYPOINTS' }), [dispatch])
    const deselectAllWaypoints = useCallback(() => dispatch({ type: 'DESELECT_ALL_WAYPOINTS' }), [dispatch])

    const shareWaypoints = useCallback(async () => {
        const searchParams = new URLSearchParams()
        searchParams.set('waypoints', waypoints.map(w => w.address).join(','))

        try {
            await navigator.share({
                url: location.origin + location.pathname + '?' + searchParams.toString(),
            })
        } catch (e) {
            if (e instanceof Error && e.name !== 'AbortError') {
                dispatch({
                    type: 'ERROR_OCCURRED',
                    error: `Share failed: ${e.message}`,
                })
            }
        }
    }, [dispatch, waypoints])

    const isMobileDevice = isMobileFn().any

    const selectedWaypointsCount = waypoints.filter(waypoint => waypoint.selected).length

    const persistedAddresses = persistanceManager.getAddresses()
    const restoreWaypoints = useCallback(() => {
        if (!persistedAddresses) return

        dispatch({
            type: 'REPLACE_WAYPOINTS',
            waypoints: persistedAddresses.map(createWaypointFromAddress),
        })
    }, [dispatch, persistedAddresses])

    return (
        <>
            <Body>
                {currentRouteInformation.status === 'FAILED' && (
                    <DangerAlert>One or more waypoints could not be routed</DangerAlert>
                )}
                {waypoints.length === 0 && (
                    <Alert>
                        Add a waypoint to begin
                        {persistedAddresses && persistedAddresses.length > 1 ? (
                            <>
                                {' '}
                                or{' '}
                                <Link href="#" onClick={restoreWaypoints}>
                                    click here to restore {persistedAddresses.length} waypoints
                                </Link>
                            </>
                        ) : null}
                    </Alert>
                )}
                {waypoints.length === 1 && <Alert>Add another waypoint to show route information</Alert>}
                <WaypointList />
            </Body>
            <Footer>
                {selectedWaypointsCount > 0 ? (
                    <>
                        <Button variant={Variant.Danger} onClick={deleteSelectedWaypoints}>
                            <i className="fas fa-fw fa-trash" /> Delete {selectedWaypointsCount}{' '}
                            {selectedWaypointsCount > 1 ? 'Waypoints' : 'Waypoint'}
                        </Button>
                        <Button variant={Variant.Primary} onClick={deselectAllWaypoints}>
                            <i className="fas fa-fw fa-ban" /> Cancel
                        </Button>
                    </>
                ) : (
                    <>
                        <InputRow>
                            <Input
                                type="text"
                                placeholder="New waypoint"
                                {...waypointField.props}
                                autoFocus={!isMobileDevice}
                            />
                            <Button
                                variant={Variant.Primary}
                                title="Add waypoint"
                                onClick={addWaypoint}
                                disabled={!waypointField.valueIsValid}
                            >
                                <i className="fas fa-fw fa-plus" />
                            </Button>
                        </InputRow>
                        <Button variant={Variant.Primary} onClick={reverseWaypoints} disabled={waypoints.length < 2}>
                            <i className="fas fa-fw fa-exchange-alt" /> Reverse
                        </Button>
                        {/* TODO: Cleanup this navigator.share usage when possible */}
                        {(navigator.share as Navigator['share']) && (
                            <Button
                                variant={Variant.Primary}
                                onClick={shareWaypoints}
                                disabled={waypoints.length === 0}
                            >
                                <i className="fas fa-fw fa-share" /> Share
                            </Button>
                        )}
                    </>
                )}
            </Footer>
        </>
    )
}
