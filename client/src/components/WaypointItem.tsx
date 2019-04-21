import React, { useCallback } from 'react'
import { Draggable, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd'
import { useInputField } from '../hooks/useInputField'
import { PlaceFetchResult, RouteFetchResult, Waypoint } from '../redux/state'
import { isValidAddress } from '../redux/validator'

type WaypointItemProps = {
    index: number;
    waypoint: Waypoint;
    setAddress: (address: string) => void;
    deleteWaypoint: () => void;
    placeFetchResult?: PlaceFetchResult;
    outgoingRouteFetchResult?: RouteFetchResult;
    incomingRouteFetchResult?: RouteFetchResult;
    isBeingDragged: boolean;
    itemWasClicked: (e: React.MouseEvent) => void;
}

export const WaypointItem = (props: WaypointItemProps) => {
    const {
        value: waypointFieldValue,
        setValue: setWaypointFieldValue,
        changeHandler: handleWaypointFieldValueChange,
        keyPressHandler: handleWaypointFieldKeyPress,
    } = useInputField(
        props.waypoint.address,
        () => fieldWasEdited && isValidAddress(waypointFieldValue) && props.setAddress(waypointFieldValue),
    )

    const resetWaypointField = useCallback(() => setWaypointFieldValue(props.waypoint.address), [
        props.waypoint.address,
    ])

    const fieldWasEdited = waypointFieldValue !== props.waypoint.address

    const fetchIsInProgress =
        (props.placeFetchResult && props.placeFetchResult.status === 'IN_PROGRESS') ||
        (props.incomingRouteFetchResult && props.incomingRouteFetchResult.status === 'IN_PROGRESS') ||
        (props.outgoingRouteFetchResult && props.outgoingRouteFetchResult.status === 'IN_PROGRESS')

    const fetchFailed =
        (props.placeFetchResult && props.placeFetchResult.status === 'FAILED') ||
        (props.incomingRouteFetchResult && props.incomingRouteFetchResult.status === 'FAILED') ||
        (props.outgoingRouteFetchResult && props.outgoingRouteFetchResult.status === 'FAILED')

    return (
        <Draggable index={props.index} draggableId={props.waypoint.uuid}>
            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={'input-row ' + (props.waypoint.isSelected ? 'waypoint-item-selected' : '')}
                >
                    <button onClick={props.deleteWaypoint} className="btn btn-sm btn-danger">
                        <i className="fas fa-trash-alt" />
                    </button>
                    <input
                        className="form-control"
                        value={waypointFieldValue}
                        onChange={handleWaypointFieldValueChange}
                        onKeyPress={handleWaypointFieldKeyPress}
                        disabled={props.isBeingDragged && !snapshot.isDragging}
                    />
                    {fieldWasEdited && (
                        <button onClick={resetWaypointField} className="btn btn-secondary">
                            <i className="fas fa-undo-alt" />
                        </button>
                    )}
                    <span>{props.index + 1}</span>
                    {fetchFailed && (
                        <span className="text-danger">
                            <i className="fas fa-exclamation-circle" />
                        </span>
                    )}
                    {fetchIsInProgress && (
                        <span className="text-muted">
                            <i className="fas fa-circle-notch fa-spin" />
                        </span>
                    )}
                    <span onClick={props.itemWasClicked} {...provided.dragHandleProps}>
                        <i className="fas fa-grip-lines-vertical" />
                    </span>
                </div>
            )}
        </Draggable>
    )
}
