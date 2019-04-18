import React, { useState } from 'react'
import { Draggable, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd'
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
    const [waypointFieldValue, setWaypointFieldValue] = useState(props.waypoint.address)

    const handleWaypointFieldValueChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setWaypointFieldValue(e.currentTarget.value)

    const handleWaypointFieldKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && isValidAddress(waypointFieldValue)) {
            props.setAddress(waypointFieldValue)
            e.currentTarget.blur()
        }
    }

    const resetWaypointField = () => setWaypointFieldValue(props.waypoint.address)

    const fieldWasEdited = waypointFieldValue !== props.waypoint.address

    const fetchIsInProgress =
        (props.placeFetchResult && props.placeFetchResult.status === 'IN_PROGRESS') ||
        (props.incomingRouteFetchResult && props.incomingRouteFetchResult.status === 'IN_PROGRESS') ||
        (props.outgoingRouteFetchResult && props.outgoingRouteFetchResult.status === 'IN_PROGRESS')

    const fetchFailed =
        (props.placeFetchResult && props.placeFetchResult.status === 'FAILED') ||
        (props.incomingRouteFetchResult && props.incomingRouteFetchResult.status === 'FAILED') ||
        (props.outgoingRouteFetchResult && props.outgoingRouteFetchResult.status === 'FAILED')

    const renderItem = (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={'input-row ' + (props.waypoint.isSelected ? 'waypoint-item-selected' : '')}
        >
            <button onClick={props.deleteWaypoint} className="btn btn-sm btn-danger">
                <i className="fas fa-trash-alt" />
            </button>
            <input
                className={'form-control ' + (props.waypoint.isSelected ? 'text-primary' : '')}
                value={waypointFieldValue}
                onChange={handleWaypointFieldValueChange}
                onKeyPress={handleWaypointFieldKeyPress}
                disabled={props.isBeingDragged && !snapshot.isDragging}
            />
            <button onClick={resetWaypointField} className="btn btn-secondary" hidden={!fieldWasEdited}>
                <i className="fas fa-undo-alt" />
            </button>
            <span>{props.index + 1}</span>
            <span className="text-danger" hidden={!fetchFailed}>
                <i className="fas fa-exclamation-circle" />
            </span>
            <span className="text-muted" hidden={!fetchIsInProgress}>
                <i className="fas fa-circle-notch fa-spin" />
            </span>
            <span onClick={props.itemWasClicked} {...provided.dragHandleProps}>
                <i className="fas fa-grip-lines-vertical" />
            </span>
        </div>
    )

    return (
        <Draggable index={props.index} draggableId={props.waypoint.uuid}>
            {renderItem}
        </Draggable>
    )
}
