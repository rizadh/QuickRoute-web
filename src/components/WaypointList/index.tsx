import React, { useCallback, useContext, useState } from 'react'
import { DragDropContext, DragStart, Droppable, DropResult } from 'react-beautiful-dnd'
import { AppStateContext } from '../../context/AppStateContext'
import { Waypoint } from '../../redux/state'
import { WaypointItem } from './WaypointItem'

export const WaypointList = () => {
    const {
        state: { waypoints },
        dispatch,
    } = useContext(AppStateContext)

    const [draggedWaypoint, setDraggedWaypoint] = useState<Waypoint | null>(null)

    const onDragEnd = useCallback(
        (result: DropResult) => {
            if (!result.destination) return
            if (result.destination.index === result.source.index) return

            if (waypoints[result.source.index].selected) {
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
        [waypoints],
    )

    const onDragStart = useCallback((initial: DragStart) => setDraggedWaypoint(waypoints[initial.source.index]), [
        waypoints,
    ])

    /**
     * Returns true iff waypoint is being dragged due to being selected, but is not being dragged directly
     */
    const isBeingDraggedAlong = useCallback(
        (waypoint: Waypoint) =>
            // Check that this waypoint is not being dragged directly
            waypoint.uuid !== draggedWaypoint?.uuid &&
            // Check that a waypoint is being dragged
            draggedWaypoint !== null &&
            // Check that a selected waypoint is being dragged
            !!draggedWaypoint.selected &&
            // Check that this waypoint is selected
            !!waypoint.selected,
        [draggedWaypoint],
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
                                isBeingDraggedAlong={snapshot.isDraggingOver && isBeingDraggedAlong(waypoint)}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}
