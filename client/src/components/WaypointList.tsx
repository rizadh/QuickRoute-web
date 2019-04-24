import React, { useContext } from 'react'
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'
import { AppStateContext } from '../context/AppStateContext'
import { WaypointItem } from './WaypointItem'

export const WaypointList = () => {
    const {
        state: { waypoints },
        dispatch,
    } = useContext(AppStateContext)

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return
        if (result.destination.index === result.source.index) return

        if (waypoints[result.source.index].isSelected) {
            dispatch({ type: 'MOVE_SELECTED_WAYPOINTS', index: result.destination.index })
        } else {
            dispatch({
                type: 'MOVE_WAYPOINT',
                sourceIndex: result.source.index,
                targetIndex: result.destination.index,
            })
        }
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="waypointlist">
                {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                        {waypoints.map((waypoint, index) => (
                            <WaypointItem
                                key={waypoint.uuid}
                                index={index}
                                isBeingDragged={snapshot.isDraggingOver && waypoint.isSelected}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}
