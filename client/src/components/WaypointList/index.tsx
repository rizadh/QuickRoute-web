import React, { useCallback, useContext, useState } from 'react'
import { DragDropContext, DragStart, Droppable, DropResult } from 'react-beautiful-dnd'
import { AppStateContext } from '../../context/AppStateContext'
import { WaypointItem } from './WaypointItem'

export const WaypointList = () => {
    const {
        state: {
            waypoints: { list: waypoints, selected: selectedWaypoints },
        },
        dispatch,
    } = useContext(AppStateContext)

    const [draggedWaypoint, setDraggedWaypoint] = useState<string | null>(null)

    const onDragEnd = useCallback(
        (result: DropResult) => {
            if (!result.destination) return
            if (result.destination.index === result.source.index) return

            if (selectedWaypoints.has(waypoints[result.source.index].uuid)) {
                dispatch({ type: 'MOVE_SELECTED_WAYPOINTS', index: result.destination.index })
            } else {
                dispatch({
                    type: 'MOVE_WAYPOINT',
                    sourceIndex: result.source.index,
                    targetIndex: result.destination.index,
                })
            }

            setDraggedWaypoint(null)
        },
        [waypoints, selectedWaypoints],
    )

    const onDragStart = useCallback((initial: DragStart) => setDraggedWaypoint(waypoints[initial.source.index].uuid), [
        waypoints,
    ])

    /**
     * Returns true iff waypoint is being dragged due to being selected, but is not being dragged directly
     */
    const isBeingDraggedAlong = useCallback(
        (uuid: string) =>
            // Check that this waypoint is not being dragged directly
            uuid !== draggedWaypoint &&
            // Check that a waypoint is being dragged
            draggedWaypoint !== null &&
            // Check that a selected waypoint is being dragged
            selectedWaypoints.has(draggedWaypoint) &&
            // Check that this waypoint is selected
            selectedWaypoints.has(uuid),
        [draggedWaypoint, selectedWaypoints],
    )

    return (
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
            <Droppable droppableId="waypointlist">
                {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                        {waypoints.map((waypoint, index) => (
                            <WaypointItem
                                key={waypoint.uuid}
                                index={index}
                                isBeingDraggedAlong={snapshot.isDraggingOver && isBeingDraggedAlong(waypoint.uuid)}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}
