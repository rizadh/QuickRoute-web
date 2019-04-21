import React, { useCallback, useContext } from 'react'
import { Draggable, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd'
import { AppStateContext } from '../context/AppStateContext'
import { useInputField } from '../hooks/useInputField'
import {
    deleteWaypoint as deleteWaypointActionCreator,
    selectWaypoint,
    selectWaypointRange,
    setAddress as setAddressActionCreator,
    toggleWaypointSelection,
} from '../redux/actions'
import { RouteFetchResult } from '../redux/state'
import { isValidAddress } from '../redux/validator'

type WaypointItemProps = {
    index: number;
    isBeingDragged: boolean;
}

export const WaypointItem = (props: WaypointItemProps) => {
    const { index, isBeingDragged } = props

    const {
        state: { waypoints, fetchedPlaces, fetchedRoutes },
        dispatch,
    } = useContext(AppStateContext)
    const waypoint = waypoints[index]

    const {
        value: waypointFieldValue,
        setValue: setWaypointFieldValue,
        changeHandler: handleWaypointFieldValueChange,
        keyPressHandler: handleWaypointFieldKeyPress,
    } = useInputField(
        waypoint.address,
        () => fieldWasEdited && isValidAddress(waypointFieldValue) && setAddress(waypointFieldValue),
    )
    const fieldWasEdited = waypointFieldValue !== waypoint.address

    const setAddress = useCallback(newAddress => dispatch(setAddressActionCreator(index, newAddress)), [index])
    const deleteWaypoint = useCallback(() => dispatch(deleteWaypointActionCreator(index)), [index])
    const resetWaypointField = useCallback(() => setWaypointFieldValue(waypoint.address), [waypoint.address])
    const routeFetchResult = useCallback(
        (origin: string, destination: string): RouteFetchResult | undefined => {
            const routesFromOrigin = fetchedRoutes.get(origin)

            return routesFromOrigin ? routesFromOrigin.get(destination) : undefined
        },
        [fetchedRoutes],
    )

    const placeFetchResult = fetchedPlaces.get(waypoint.address)

    const incomingRouteFetchResult =
        index === 0 && routeFetchResult(waypoints[index - 1].address, waypoints[index].address)

    const outgoingRouteFetchResult =
        index === waypoints.length - 1 && routeFetchResult(waypoints[index].address, waypoints[index + 1].address)

    const itemWasClicked = (e: React.MouseEvent) => {
        if (e.shiftKey) {
            e.preventDefault()
            dispatch(selectWaypointRange(index))
        } else if (e.ctrlKey || e.metaKey) {
            dispatch(toggleWaypointSelection(index))
        } else {
            dispatch(selectWaypoint(index))
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
                    className={'input-row ' + (waypoint.isSelected ? 'waypoint-item-selected' : '')}
                >
                    <button onClick={deleteWaypoint} className="btn btn-sm btn-danger">
                        <i className="fas fa-trash-alt" />
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
                            <i className="fas fa-undo-alt" />
                        </button>
                    )}
                    <span>{index + 1}</span>
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
                    <span onClick={itemWasClicked} {...provided.dragHandleProps}>
                        <i className="fas fa-grip-lines-vertical" />
                    </span>
                </div>
            )}
        </Draggable>
    )
}
