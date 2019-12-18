import React, { useCallback, useContext } from 'react'
import { Draggable, DraggableProvided } from 'react-beautiful-dnd'
import { AppStateContext } from '../../context/AppStateContext'
import { useInputField } from '../../hooks/useInputField'
import { getRoute } from '../../redux/util'
import { isValidAddress } from '../../redux/validator'
import { preventFocus } from '../util/preventFocus'

type WaypointItemProps = {
    index: number;
    isBeingDraggedOver: boolean;
}

export const WaypointItem = (props: WaypointItemProps) => {
    const { index, isBeingDraggedOver } = props

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
        (placeFetchResult && placeFetchResult.status === 'IN_PROGRESS') ||
        (incomingRouteFetchResult && incomingRouteFetchResult.status === 'IN_PROGRESS') ||
        (outgoingRouteFetchResult && outgoingRouteFetchResult.status === 'IN_PROGRESS')

    const fetchFailed =
        (placeFetchResult && placeFetchResult.status === 'FAILED') ||
        (incomingRouteFetchResult && incomingRouteFetchResult.status === 'FAILED') ||
        (outgoingRouteFetchResult && outgoingRouteFetchResult.status === 'FAILED')

    return (
        <Draggable index={index} draggableId={waypoint.uuid}>
            {(provided: DraggableProvided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={
                        'input-row' +
                        (waypointIsSelected ? ' waypoint-item-selected' : '') +
                        (isBeingDraggedOver ? ' waypoint-item-dragging-over' : '')
                    }
                >
                    <button
                        title="Delete waypoint"
                        onClick={deleteWaypoint}
                        onMouseDown={preventFocus}
                        className="btn btn-sm btn-danger"
                    >
                        <i className="fas fa-fw fa-trash-alt" />
                    </button>
                    <input
                        className="form-control"
                        value={waypointFieldValue}
                        onChange={handleWaypointFieldValueChange}
                        onKeyPress={handleWaypointFieldKeyPress}
                    />
                    {fieldWasEdited && (
                        <button onClick={resetWaypointField} onMouseDown={preventFocus} className="btn btn-secondary">
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
                    <span title="Drag to reorder" onClick={itemWasClicked} {...provided.dragHandleProps}>
                        <i className="fas fa-fw fa-grip-lines-vertical" />
                    </span>
                </div>
            )}
        </Draggable>
    )
}
