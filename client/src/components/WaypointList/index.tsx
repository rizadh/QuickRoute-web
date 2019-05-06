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

    const isDraggingWaypoint = useCallback(
        (uuid: string) =>
            (draggedWaypoint && selectedWaypoints.has(draggedWaypoint) && selectedWaypoints.has(uuid)) ||
            uuid === draggedWaypoint,
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
                                isBeingDraggedOver={snapshot.isDraggingOver && !isDraggingWaypoint(waypoint.uuid)}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}
