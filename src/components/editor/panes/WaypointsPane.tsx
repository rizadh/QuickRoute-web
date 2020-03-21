import b64toblob from 'b64-to-blob'
import { saveAs } from 'file-saver'
import isMobileFn from 'ismobilejs'
import React, { Dispatch, useCallback } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { apolloClient } from '../../..'
import { GeneratePdfQuery, GeneratePdfQueryVariables } from '../../../generated/graphql'
import { useInput } from '../../../hooks/useInput'
import { GeneratePDF } from '../../../queries'
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

export const WaypointsPane = () => {
    const waypoints = useSelector((state: AppState) => state.waypoints)
    const currentRouteInformation = useSelector(routeInformation, shallowEqual)

    const { props: waypointFieldProps, commitValue: addWaypoint, valueIsValid: waypointIsValid } = useInput({
        predicate: isValidAddress,
        onCommit: useCallback((waypoint: string) => {
            dispatch({ type: 'ADD_WAYPOINT', waypoint: createWaypointFromAddress(waypoint) })
            return true
        }, []),
        resetAfterCommit: true,
    })

    const dispatch: Dispatch<AppAction> = useDispatch()
    const reverseWaypoints = useCallback(() => dispatch({ type: 'REVERSE_WAYPOINTS' }), [])
    const deleteSelectedWaypoints = useCallback(() => dispatch({ type: 'DELETE_SELECTED_WAYPOINTS' }), [])
    const deselectAllWaypoints = useCallback(() => dispatch({ type: 'DESELECT_ALL_WAYPOINTS' }), [])

    const generatePdf = useCallback(async () => {
        dispatch({ type: 'CLEAR_ERROR' })

        try {
            const response = await apolloClient.query<GeneratePdfQuery, GeneratePdfQueryVariables>({
                query: GeneratePDF,
                variables: { waypoints: waypoints.map(w => w.address) },
            })

            saveAs(b64toblob(response.data.pdf), 'waypoints.pdf')
        } catch (error) {
            dispatch({
                type: 'ERROR_OCCURRED',
                error: `Failed to generate PDF (ERROR: '${error}')`,
            })
        }
    }, [waypoints])

    const shareWaypoints = useCallback(async () => {
        const searchParams = new URLSearchParams()
        searchParams.set('waypoints', waypoints.map(w => w.address).join(','))

        try {
            await (navigator as INavigator).share({
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
    }, [waypoints])

    const isMobileDevice = isMobileFn().any

    const selectedWaypointsCount = waypoints.filter(waypoint => waypoint.selected).length

    return (
        <>
            <Body>
                {currentRouteInformation.status === 'FAILED' && (
                    <DangerAlert>One or more waypoints could not be routed</DangerAlert>
                )}
                {waypoints.length === 0 && <Alert>Add a waypoint to begin</Alert>}
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
                                {...waypointFieldProps}
                                autoFocus={!isMobileDevice}
                            />
                            <Button
                                variant={Variant.Primary}
                                title="Add waypoint"
                                onClick={addWaypoint}
                                disabled={!waypointIsValid}
                            >
                                <i className="fas fa-fw fa-plus" />
                            </Button>
                        </InputRow>
                        <Button variant={Variant.Primary} onClick={generatePdf} disabled={waypoints.length === 0}>
                            <i className={'fas fa-fw fa-file-download'} /> Save PDF
                        </Button>
                        <Button variant={Variant.Primary} onClick={reverseWaypoints} disabled={waypoints.length < 2}>
                            <i className="fas fa-fw fa-exchange-alt" /> Reverse
                        </Button>
                        {(navigator as INavigator).share && (
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
