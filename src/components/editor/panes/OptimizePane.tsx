import isMobileFn from 'ismobilejs'
import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { OptimizationParameter } from '../../../generated/graphql'
import { useInput } from '../../../hooks/useInput'
import { AppAction } from '../../../redux/actionTypes'
import { AppState } from '../../../redux/state'
import { Alert, WarningAlert } from '../../common/Alert'
import { Button, Variant } from '../../common/Button'
import { Input } from '../../common/Input'
import { InputRow } from '../../common/InputRow'
import { Body, Footer } from '../Editor'

export const OptimizePane = () => {
    const waypoints = useSelector((state: AppState) => state.waypoints)
    const optimizationInProgress = useSelector((state: AppState) => state.optimizationInProgress)
    const dispatch: Dispatch<AppAction> = useDispatch()

    const { value: startPointFieldValue, props: startPointFieldProps } = useInput()
    const { value: endPointFieldValue, props: endPointFieldProps } = useInput()

    const startPoint = (startPointFieldValue || endPointFieldValue).trim()
    const endPoint = (endPointFieldValue || startPointFieldValue).trim()

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

    const insufficientWaypoints = waypoints.length < 3

    const defaultStartPoint = () => startPoint || waypoints[0].address
    const defaultEndPoint = () => endPoint || waypoints[waypoints.length - 1].address

    const isMobileDevice = isMobileFn().any

    return (
        <>
            <Body>
                {insufficientWaypoints ? (
                    <WarningAlert>Add three or more waypoints to optimize routes</WarningAlert>
                ) : (
                    <>
                        <Alert>
                            Find optimal route from start point to end point passing through all intermediate waypoints
                        </Alert>
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
            </Body>

            <Footer>
                {optimizationInProgress ? (
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
                )}
            </Footer>
        </>
    )
}
