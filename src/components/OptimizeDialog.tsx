import isMobileFn from 'ismobilejs'
import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { OptimizationParameter } from '../generated/graphql'
import { useInput } from '../hooks/useInput'
import { AppAction } from '../redux/actionTypes'
import { AppState } from '../redux/state'
import { Alert, DangerAlert, WarningAlert } from './common/Alert'
import { Button, Variant } from './common/Button'
import { Input } from './common/Input'
import { InputRow } from './common/InputRow'
import { PopupDialog } from './common/PopupDialog'

export const OptimizeDialog = () => {
    const isMobileDevice = isMobileFn().any

    const waypoints = useSelector((state: AppState) => state.waypoints)
    const optimizationInProgress = useSelector((state: AppState) => state.optimizationInProgress)
    const insufficientWaypoints = waypoints.length < 3
    const { value: startPointFieldValue, props: startPointFieldProps } = useInput()
    const { value: endPointFieldValue, props: endPointFieldProps } = useInput()
    const defaultStartPoint = () => startPoint || waypoints[0].address
    const defaultEndPoint = () => endPoint || waypoints[waypoints.length - 1].address
    const startPoint = (startPointFieldValue || endPointFieldValue).trim()
    const endPoint = (endPointFieldValue || startPointFieldValue).trim()

    const dispatch: Dispatch<AppAction> = useDispatch()
    const hideDialog = useCallback(() => {
        cancelOptimize()
        dispatch({ type: 'HIDE_OPTIMIZE_DIALOG' })
    }, [])
    const optimizeDistance = useCallback(
        () =>
            dispatch({
                type: 'OPTIMIZE_ROUTE',
                optimizationParameter: OptimizationParameter.Distance,
                startPoint,
                endPoint,
            }),
        [startPoint, endPoint],
    )
    const optimizeTime = useCallback(
        () =>
            dispatch({
                type: 'OPTIMIZE_ROUTE',
                optimizationParameter: OptimizationParameter.Time,
                startPoint,
                endPoint,
            }),
        [startPoint, endPoint],
    )
    const cancelOptimize = useCallback(
        () =>
            dispatch({
                type: 'OPTIMIZE_ROUTE_CANCEL',
                startPoint,
                endPoint,
            }),
        [startPoint, endPoint],
    )

    const footer = optimizationInProgress ? (
        <>
            <Button variant={Variant.Primary} disabled={true}>
                <i className="fas fa-fw fa-spin fa-circle-notch" /> Optimizing
            </Button>
            <Button variant={Variant.Danger} onClick={cancelOptimize}>
                <i className="fas fa-ban" /> Cancel
            </Button>
        </>
    ) : (
        <>
            <Button variant={Variant.Primary} onClick={optimizeDistance} disabled={insufficientWaypoints}>
                <i className="fas fa-fw fa-ruler-vertical" /> Optimize Distance
            </Button>
            <Button variant={Variant.Primary} onClick={optimizeTime} disabled={insufficientWaypoints}>
                <i className="fas fa-fw fa-stopwatch" /> Optimize Time
            </Button>
        </>
    )

    return (
        <PopupDialog title="Optimize Route" footer={footer} onClose={hideDialog}>
            {insufficientWaypoints ? (
                <WarningAlert>Add three or more waypoints to optimize routes</WarningAlert>
            ) : (
                <>
                    <Alert>
                        Find optimal route from start point to end point passing through all intermediate waypoints
                    </Alert>
                    <DangerAlert>
                        NOTE FROM THE DEVELOPER (19/MAR/2020): Due to a large volume of optimization requests performed
                        recently, QuickRoute has fallen back to a slower optimization strategy. Optimizations will be
                        noticeably slower, especially when optimizing more than 30 waypoints. The regular service is
                        expect to return shortly after April 2, 2020.
                    </DangerAlert>
                    <InputRow>
                        <Input
                            type="text"
                            placeholder={`Start Point (${defaultStartPoint()})`}
                            {...startPointFieldProps}
                            disabled={optimizationInProgress}
                            autoFocus={!isMobileDevice}
                        />
                    </InputRow>
                    <InputRow>
                        <Input
                            type="text"
                            placeholder={`End Point (${defaultEndPoint()})`}
                            {...endPointFieldProps}
                            disabled={optimizationInProgress}
                        />
                    </InputRow>
                </>
            )}
        </PopupDialog>
    )
}
