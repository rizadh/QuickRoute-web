import React, { useCallback, useContext } from 'react'
import { WaypointEditorTemplate } from '.'
import { AppStateContext } from '../../context/AppStateContext'
import { useCompactMode } from '../../hooks/useCompactMode'
import { useInputField } from '../../hooks/useInputField'
import { OptimizationParameter } from '../../redux/actionTypes'
import { preventFocus } from '../util/preventFocus'
import isMobileFn from 'ismobilejs'

export const OptimizePane = () => {
    const {
        state: {
            waypoints: { list: waypoints },
            optimizationInProgress,
        },
        dispatch,
    } = useContext(AppStateContext)
    const compactMode = useCompactMode()

    const { value: startPointFieldValue, setValue: setStartPointFieldValue } = useInputField('', () => undefined)
    const { value: endPointFieldValue, setValue: setEndPointFieldValue } = useInputField('', () => undefined)

    const startPoint = (startPointFieldValue || endPointFieldValue).trim()
    const endPoint = (endPointFieldValue || startPointFieldValue).trim()

    const handleStartPointFieldChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => setStartPointFieldValue(e.currentTarget.value),
        [],
    )

    const handleEndPointFieldChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEndPointFieldValue(e.currentTarget.value)
    }, [])

    const optimizeDistance = useCallback(
        () =>
            dispatch({
                type: 'OPTIMIZE_ROUTE',
                optimizationParameter: OptimizationParameter.Distance,
                startPoint: startPoint || undefined,
                endPoint: endPoint || undefined,
            }),
        [startPoint, endPoint],
    )

    const optimizeTime = useCallback(
        () =>
            dispatch({
                type: 'OPTIMIZE_ROUTE',
                optimizationParameter: OptimizationParameter.Time,
                startPoint: startPoint || undefined,
                endPoint: endPoint || undefined,
            }),
        [startPoint, endPoint],
    )

    const cancelOptimize = useCallback(
        () =>
            dispatch({
                type: 'OPTIMIZE_ROUTE_CANCEL',
                startPoint: startPoint || undefined,
                endPoint: endPoint || undefined,
            }),
        [startPoint, endPoint],
    )

    const insufficientWaypoints = waypoints.length < 3

    const defaultStartPoint = () => startPoint || waypoints[0].address
    const defaultEndPoint = () => endPoint || waypoints[waypoints.length - 1].address

    const isMobileDevice = isMobileFn().any

    return (
        <WaypointEditorTemplate
            body={
                insufficientWaypoints ? (
                    <div className="alert alert-warning" role="alert">
                        Add three or more waypoints to optimize routes
                    </div>
                ) : (
                    <>
                        <div className="alert alert-info" role="alert">
                            The route found will be the optimal from the start point to the end point.
                        </div>
                        <div className="input-row">
                            <span>Start Point</span>
                            <input
                                type="text"
                                placeholder={defaultStartPoint()}
                                value={startPointFieldValue}
                                onChange={handleStartPointFieldChange}
                                disabled={optimizationInProgress}
                                autoFocus={!isMobileDevice}
                            />
                        </div>
                        <div className="input-row">
                            <span>End Point</span>
                            <input
                                type="text"
                                placeholder={defaultEndPoint()}
                                value={endPointFieldValue}
                                onChange={handleEndPointFieldChange}
                                disabled={optimizationInProgress}
                            />
                        </div>
                    </>
                )
            }
            footer={
                optimizationInProgress ? (
                    <>
                        <button className="btn btn-primary" disabled={true}>
                            <i className="fas fa-fw fa-spin fa-circle-notch" />
                            {!compactMode && ' Optimizing'}
                        </button>
                        <button className="btn btn-danger" onClick={cancelOptimize} onMouseDown={preventFocus}>
                            <i className="fas fa-ban" /> Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="btn btn-primary"
                            onClick={optimizeDistance}
                            onMouseDown={preventFocus}
                            disabled={insufficientWaypoints}
                        >
                            <i className="fas fa-fw fa-ruler-combined" />
                            {compactMode ? ' Distance' : ' Optimize Distance'}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={optimizeTime}
                            onMouseDown={preventFocus}
                            disabled={insufficientWaypoints}
                        >
                            <i className="fas fa-fw fa-clock" />
                            {compactMode ? ' Time' : ' Optimize Time'}
                        </button>
                    </>
                )
            }
        />
    )
}
