import React, { useContext } from 'react'
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'
import { AppStateContext } from '../context/AppStateContext'
import {
    deleteWaypoint,
    moveSelectedWaypoints,
    moveWaypoint,
    selectWaypoint,
    selectWaypointRange,
    setAddress,
    toggleWaypointSelection,
} from '../redux/actions'
import { PlaceFetchResult, RouteFetchResult } from '../redux/state'
import { WaypointItem } from './WaypointItem'

export const WaypointList = () => {
    const {
        state: { waypoints, fetchedPlaces, fetchedRoutes },
        dispatch,
    } = useContext(AppStateContext)
    const placeFetchResult = (address: string): PlaceFetchResult | undefined => fetchedPlaces.get(address)

    const incomingRouteFetchResult = (index: number): RouteFetchResult | undefined => {
        if (index === 0) return

        return routeFetchResult(waypoints[index - 1].address, waypoints[index].address)
    }

    const outgoingRouteFetchResult = (index: number): RouteFetchResult | undefined => {
        if (index === waypoints.length - 1) return

        return routeFetchResult(waypoints[index].address, waypoints[index + 1].address)
    }

    const routeFetchResult = (origin: string, destination: string): RouteFetchResult | undefined => {
        const routesFromOrigin = fetchedRoutes.get(origin)

        return routesFromOrigin ? routesFromOrigin.get(destination) : undefined
    }

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return
        if (result.destination.index === result.source.index) return

        if (waypoints[result.source.index].isSelected) {
            dispatch(moveSelectedWaypoints(result.destination.index))
        } else {
            dispatch(moveWaypoint(result.source.index, result.destination.index))
        }
    }

    const itemWasClicked = (index: number) => (e: React.MouseEvent) => {
        if (e.shiftKey) {
            e.preventDefault()
            dispatch(selectWaypointRange(index))
        } else if (e.ctrlKey || e.metaKey) {
            dispatch(toggleWaypointSelection(index))
        } else {
            dispatch(selectWaypoint(index))
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
                                waypoint={waypoint}
                                isBeingDragged={snapshot.isDraggingOver && waypoint.isSelected}
                                placeFetchResult={placeFetchResult(waypoint.address)}
                                outgoingRouteFetchResult={outgoingRouteFetchResult(index)}
                                incomingRouteFetchResult={incomingRouteFetchResult(index)}
                                itemWasClicked={itemWasClicked(index)}
                                deleteWaypoint={() => dispatch(deleteWaypoint(index))}
                                setAddress={newAddress => dispatch(setAddress(index, newAddress))}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}
