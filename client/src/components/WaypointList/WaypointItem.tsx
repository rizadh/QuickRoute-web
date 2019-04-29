import React, { useCallback, useContext, useState } from 'react'
import { Draggable, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd'
import { AppStateContext } from '../../context/AppStateContext'
import { useInputField } from '../../hooks/useInputField'
import { getRoute } from '../../redux/util'
import { isValidAddress } from '../../redux/validator'

type WaypointItemProps = {
    index: number;
    isBeingDragged: boolean;
}

export const WaypointItem = (props: WaypointItemProps) => {
    const { index, isBeingDragged } = props

    const {
        state: {
            waypoints: { list: waypoints, selected: selectedWaypoints },
            fetchedPlaces,
            fetchedRoutes,
        },
        dispatch,
    } = useContext(AppStateContext)
    const waypoint = waypoints[index]
    const waypointIsSelected = selectedWaypoints.has(waypoint.uuid)

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
    const routeFetchResult = useCallback(
        (origin: string, destination: string) => getRoute(fetchedRoutes, origin, destination),
        [fetchedRoutes],
    )

    const placeFetchResult = fetchedPlaces.get(waypoint.address)

    const incomingRouteFetchResult =
        index !== 0 && routeFetchResult(waypoints[index - 1].address, waypoints[index].address)

    const outgoingRouteFetchResult =
        index !== waypoints.length - 1 && routeFetchResult(waypoints[index].address, waypoints[index + 1].address)

    const itemWasClicked = (e: React.MouseEvent) => {
        if (e.shiftKey) {
            e.preventDefault()
            dispatch({ type: 'SELECT_WAYPOINT_RANGE', index })
        } else if (e.ctrlKey || e.metaKey) {
            dispatch({ type: 'TOGGLE_WAYPOINT_SELECTION', index })
        } else {
            dispatch({ type: 'SELECT_WAYPOINT', index })
        }
    }

    const fetchIsInProgress =
        (placeFetchResult && placeFetchResult.status === 'IN_PROGRESS') ||
        (incomingRouteFetchResult && incomingRouteFetchResult.status === 'IN_PROGRESS') ||
        (outgoingRouteFetchResult && outgoingRouteFetchResult.status === 'IN_PROGRESS')

    const fetchFailed =
        (placeFetchResult && placeFetchResult.status === 'FAILED') ||
        (incomingRouteFetchResult && incomingRouteFetchResult.status === 'FAILED') ||
        (outgoingRouteFetchResult && outgoingRouteFetchResult.status === 'FAILED')

    return (
        <Draggable index={index} draggableId={waypoint.uuid}>
            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={
                        'input-row' +
                        (waypointIsSelected ? ' waypoint-item-selected' : '') +
                        (props.isBeingDragged ? ' waypoint-item-dragging' : '')
                    }
                >
                    <button onClick={deleteWaypoint} className="btn btn-sm btn-danger">
                        <i className="fas fa-fw fa-trash-alt" />
                    </button>
                    <input
                        className="form-control"
                        value={waypointFieldValue}
                        onChange={handleWaypointFieldValueChange}
                        onKeyPress={handleWaypointFieldKeyPress}
                        disabled={isBeingDragged && !snapshot.isDragging}
                    />
                    {fieldWasEdited && (
                        <button onClick={resetWaypointField} className="btn btn-secondary">
                            <i className="fas fa-fw fa-undo-alt" />
                        </button>
                    )}
                    <span>{index + 1}</span>
                    {fetchFailed && (
                        <span className="text-danger">
                            <i className="fas fa-fw fa-exclamation-circle" />
                        </span>
                    )}
                    {fetchIsInProgress && (
                        <span className="text-secondary">
                            <i className="fas fa-fw fa-circle-notch fa-spin" />
                        </span>
                    )}
                    <span onClick={itemWasClicked} {...provided.dragHandleProps}>
                        <i className="fas fa-fw fa-grip-lines-vertical" />
                    </span>
                </div>
            )}
        </Draggable>
    )
}
