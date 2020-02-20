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
import { DangerButton, PrimaryButton } from '../../common/Button'
import { Input } from '../../common/Input'
import { InputRow } from '../../common/InputRow'
import { WaypointEditorTemplate } from '../WaypointEditor'
import { WaypointList } from './WaypointList'

export const WaypointsPane = () => (
    <WaypointEditorTemplate body={<WaypointsPaneBody />} footer={<WaypointsPaneFooter />} />
)

export const WaypointsPaneBody = () => {
    const waypointCount = useSelector((state: AppState) => state.waypoints.length)
    const currentRouteInformation = useSelector(routeInformation, shallowEqual)

    return (
        <>
            {currentRouteInformation.status === 'FAILED' && (
                <DangerAlert>One or more waypoints could not be routed</DangerAlert>
            )}
            {waypointCount === 0 && <Alert>Enter an address to begin</Alert>}
            {waypointCount === 1 && <Alert>Enter another address to show route information</Alert>}
            <WaypointList />
        </>
    )
}

export const WaypointsPaneFooter = () => {
    const { props: waypointFieldProps, commitValue: addWaypoint, valueIsValid: waypointIsValid } = useInput({
        predicate: isValidAddress,
        onCommit: useCallback((waypoint: string) => {
            dispatch({ type: 'ADD_WAYPOINT', waypoint: createWaypointFromAddress(waypoint) })
            return true
        }, []),
        resetAfterCommit: true,
    })

    const waypoints = useSelector((state: AppState) => state.waypoints)
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
        searchParams.set('waypoints', JSON.stringify(waypoints.map(w => w.address)))

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

    return selectedWaypointsCount > 0 ? (
        <>
            <DangerButton onClick={deleteSelectedWaypoints}>
                <i className="fas fa-fw fa-trash" /> Delete {selectedWaypointsCount}{' '}
                {selectedWaypointsCount > 1 ? 'Waypoints' : 'Waypoint'}
            </DangerButton>
            <PrimaryButton onClick={deselectAllWaypoints}>
                <i className="fas fa-fw fa-ban" /> Cancel
            </PrimaryButton>
        </>
    ) : (
        <>
            <InputRow>
                <Input type="text" placeholder="New waypoint" {...waypointFieldProps} autoFocus={!isMobileDevice} />
                <PrimaryButton title="Add waypoint" onClick={addWaypoint} disabled={!waypointIsValid}>
                    <i className="fas fa-fw fa-plus" />
                </PrimaryButton>
            </InputRow>
            <PrimaryButton onClick={generatePdf} disabled={waypoints.length === 0}>
                <i className={'fas fa-fw fa-file-download'} /> Save PDF
            </PrimaryButton>
            <PrimaryButton onClick={reverseWaypoints} disabled={waypoints.length < 2}>
                <i className="fas fa-fw fa-exchange-alt" /> Reverse
            </PrimaryButton>
            {(navigator as INavigator).share && (
                <PrimaryButton onClick={shareWaypoints} disabled={waypoints.length === 0}>
                    <i className="fas fa-fw fa-share" /> Share
                </PrimaryButton>
            )}
        </>
    )
}
