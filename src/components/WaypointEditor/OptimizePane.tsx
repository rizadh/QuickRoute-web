import isMobileFn from 'ismobilejs'
import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WaypointEditorTemplate } from '.'
import { useCompactMode } from '../../hooks/useCompactMode'
import { useInput } from '../../hooks/useInput'
import { AppAction, OptimizationParameter } from '../../redux/actionTypes'
import { AppState } from '../../redux/state'
import { Button } from '../Button'

export const OptimizePane = () => {
    const waypoints = useSelector((state: AppState) => state.waypoints)
    const optimizationInProgress = useSelector((state: AppState) => state.optimizationInProgress)
    const dispatch: Dispatch<AppAction> = useDispatch()
    const compactMode = useCompactMode()

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

    const body = insufficientWaypoints ? (
        <div className="text text-warning" role="alert">
            Add three or more waypoints to optimize routes
        </div>
    ) : (
        <>
            <div className="text text-secondary" role="alert">
                Optimal route from start point to end point through all waypoints will be found
            </div>
            <div className="text text-secondary" role="alert">
                If left unspecified, route will be found from first to last waypoint
            </div>
            <div className="input-row">
                <input
                    type="text"
                    placeholder={`Start Point (${defaultStartPoint()})`}
                    {...startPointFieldProps}
                    disabled={optimizationInProgress}
                    autoFocus={!isMobileDevice}
                />
            </div>
            <div className="input-row">
                <input
                    type="text"
                    placeholder={`End Point (${defaultEndPoint()})`}
                    {...endPointFieldProps}
                    disabled={optimizationInProgress}
                />
            </div>
        </>
    )

    const footer = optimizationInProgress ? (
        <>
            <Button theme="primary" disabled={true}>
                <i className="fas fa-fw fa-spin fa-circle-notch" />
                {!compactMode && ' Optimizing'}
            </Button>
            <Button theme="danger" onClick={cancelOptimize}>
                <i className="fas fa-ban" /> Cancel
            </Button>
        </>
    ) : (
        <>
            <Button theme="primary" onClick={optimizeDistance} disabled={insufficientWaypoints}>
                <i className="fas fa-fw fa-ruler-combined" />
                {compactMode ? ' Distance' : ' Optimize Distance'}
            </Button>
            <Button theme="primary" onClick={optimizeTime} disabled={insufficientWaypoints}>
                <i className="fas fa-fw fa-clock" />
                {compactMode ? ' Time' : ' Optimize Time'}
            </Button>
        </>
    )

    return <WaypointEditorTemplate body={body} footer={footer} />
}
