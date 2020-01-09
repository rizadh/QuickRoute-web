import React, { Dispatch, useCallback } from 'react'
import { Draggable, DraggableProvided } from 'react-beautiful-dnd'
import { useDispatch, useSelector } from 'react-redux'
import { useInputField } from '../../../../hooks/useInputField'
import { AppAction } from '../../../../redux/actionTypes'
import { AppState } from '../../../../redux/state'
import { isValidAddress } from '../../../../redux/validator'
import { Button } from '../../../Button'

type WaypointItemProps = {
    index: number;
    isBeingDraggedAlong: boolean;
}

export const WaypointItem = ({ index, isBeingDraggedAlong }: WaypointItemProps) => {
    const dispatch: Dispatch<AppAction> = useDispatch()
    const waypoint = useSelector((state: AppState) => state.waypoints[index])

    const {
        value: waypointFieldValue,
        setValue: setWaypointFieldValue,
        changeHandler: handleWaypointFieldValueChange,
        keyPressHandler: handleWaypointFieldKeyPress,
    } = useInputField(
        waypoint.address,
        () => fieldWasEdited && isValidAddress(waypointFieldValue) && setAddress(waypointFieldValue.trim()),
    )
    const fieldWasEdited = waypointFieldValue.trim() !== waypoint.address

    const setAddress = useCallback(newAddress => dispatch({ type: 'SET_ADDRESS', index, address: newAddress }), [
        index,
    ])
    const deleteWaypoint = useCallback(() => dispatch({ type: 'DELETE_WAYPOINT', index }), [index])
    const resetWaypointField = useCallback(() => setWaypointFieldValue(waypoint.address), [waypoint.address])

    const placeFetchResult = useSelector((state: AppState) => state.fetchedPlaces[waypoint.address])

    const incomingRouteFetchResult = useSelector((state: AppState) =>
        index !== 0
            ? state.fetchedRoutes[state.waypoints[index - 1].address]?.[state.waypoints[index].address]
            : undefined,
    )

    const outgoingRouteFetchResult = useSelector((state: AppState) =>
        index !== state.waypoints.length - 1
            ? state.fetchedRoutes[state.waypoints[index].address]?.[state.waypoints[index + 1].address]
            : undefined,
    )

    const itemWasClicked = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()

            if (e.shiftKey) {
                dispatch({ type: 'SELECT_WAYPOINT_RANGE', index })
            } else if (e.ctrlKey || e.metaKey) {
                dispatch({ type: 'TOGGLE_WAYPOINT_SELECTION', index })
            } else {
                dispatch({ type: 'SELECT_WAYPOINT', index })
            }
        },
        [index, dispatch],
    )

    const fetchIsInProgress =
        placeFetchResult?.status === 'IN_PROGRESS' ||
        incomingRouteFetchResult?.status === 'IN_PROGRESS' ||
        outgoingRouteFetchResult?.status === 'IN_PROGRESS'

    const fetchFailed =
        placeFetchResult?.status === 'FAILED' ||
        incomingRouteFetchResult?.status === 'FAILED' ||
        outgoingRouteFetchResult?.status === 'FAILED'

    const failureMessage =
        placeFetchResult?.status === 'FAILED'
            ? 'Could not find this waypoint'
            : incomingRouteFetchResult?.status === 'FAILED' && outgoingRouteFetchResult?.status === 'FAILED'
            ? 'Could not find route to or from this waypoint'
            : incomingRouteFetchResult?.status === 'FAILED'
            ? 'Could not find route from last waypoint'
            : outgoingRouteFetchResult?.status === 'FAILED'
            ? 'Could not find route to next waypoint'
            : undefined

    const failureIcon =
        placeFetchResult?.status === 'FAILED' ? (
            <i className="far fa-fw fa-dot-circle" />
        ) : incomingRouteFetchResult?.status === 'FAILED' && outgoingRouteFetchResult?.status === 'FAILED' ? (
            <i className="fas fa-fw fa-rotate-90 fa-exchange-alt" />
        ) : incomingRouteFetchResult?.status === 'FAILED' ? (
            <i className="fas fa-fw fa-long-arrow-alt-up" />
        ) : outgoingRouteFetchResult?.status === 'FAILED' ? (
            <i className="fas fa-fw fa-long-arrow-alt-down" />
        ) : null

    return (
        <Draggable index={index} draggableId={waypoint.uuid}>
            {(provided: DraggableProvided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={
                        'input-row' +
                        (waypoint.selected ? ' waypoint-item-selected' : '') +
                        (isBeingDraggedAlong ? ' waypoint-item-dragging-along' : '')
                    }
                >
                    <span
                        className="waypoint-item-index"
                        title="Drag to reorder"
                        onClick={itemWasClicked}
                        {...provided.dragHandleProps}
                    >
                        <i className="fas fa-fw fa-grip-vertical" /> {index + 1}
                    </span>

                    <input
                        className="form-control"
                        value={waypointFieldValue}
                        onChange={handleWaypointFieldValueChange}
                        onKeyPress={handleWaypointFieldKeyPress}
                    />
                    {fieldWasEdited && (
                        <Button type="secondary" onClick={resetWaypointField}>
                            <i className="fas fa-fw fa-undo" />
                        </Button>
                    )}
                    {fetchFailed && (
                        <span className="text-danger" title={failureMessage}>
                            {failureIcon}
                        </span>
                    )}
                    {fetchIsInProgress && (
                        <span className="text-secondary">
                            <i className="fas fa-fw fa-circle-notch fa-spin" />
                        </span>
                    )}
                    <Button type="danger" onClick={deleteWaypoint} title="Delete waypoint">
                        <i className="fas fa-fw fa-trash" />
                    </Button>
                </div>
            )}
        </Draggable>
    )
}
