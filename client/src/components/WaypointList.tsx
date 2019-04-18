import * as React from 'react'
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'
import { connect } from 'react-redux'
import {
    deleteWaypoint,
    moveSelectedWaypoints,
    moveWaypoint,
    selectWaypoint,
    selectWaypointRange,
    setAddress,
    toggleWaypointSelection,
} from '../redux/actions'
import { AppAction } from '../redux/actionTypes'
import { AppState, FetchedPlaces, FetchedRoutes, PlaceFetchResult, RouteFetchResult, Waypoint } from '../redux/state'
import { WaypointItem } from './WaypointItem'

type WaypointListStateProps = {
    waypoints: ReadonlyArray<Waypoint>;
    fetchedRoutes: FetchedRoutes;
    fetchedPlaces: FetchedPlaces;
}

type WaypointListDispatchProps = {
    setWaypoint: (index: number, address: string) => void;
    deleteWaypoint: (index: number) => void;
    selectWaypoint: (index: number) => void;
    toggleWaypointSelection: (index: number) => void;
    selectWaypointRange: (index: number) => void;
    moveWaypoint: (sourceIndex: number, destinationIndex: number) => void;
    moveSelectedWaypoints: (index: number) => void;
}

type WaypointListProps = WaypointListStateProps & WaypointListDispatchProps

const WaypointList = (props: WaypointListProps) => {
    const placeFetchResult = (address: string): PlaceFetchResult | undefined => props.fetchedPlaces.get(address)

    const incomingRouteFetchResult = (index: number): RouteFetchResult | undefined => {
        if (index === 0) return

        return routeFetchResult(props.waypoints[index - 1].address, props.waypoints[index].address)
    }

    const outgoingRouteFetchResult = (index: number): RouteFetchResult | undefined => {
        if (index === props.waypoints.length - 1) return

        return routeFetchResult(props.waypoints[index].address, props.waypoints[index + 1].address)
    }

    const routeFetchResult = (origin: string, destination: string): RouteFetchResult | undefined => {
        const routesFromOrigin = props.fetchedRoutes.get(origin)

        return routesFromOrigin ? routesFromOrigin.get(destination) : undefined
    }

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return
        if (result.destination.index === result.source.index) return

        if (props.waypoints[result.source.index].isSelected) {
            props.moveSelectedWaypoints(result.destination.index)
        } else {
            props.moveWaypoint(result.source.index, result.destination.index)
        }
    }

    const itemWasClicked = (index: number) => (e: React.MouseEvent) => {
        if (e.shiftKey) {
            e.preventDefault()
            props.selectWaypointRange(index)
        } else if (e.ctrlKey || e.metaKey) {
            props.toggleWaypointSelection(index)
        } else {
            props.selectWaypoint(index)
        }
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="waypointlist">
                {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                        {props.waypoints.map((waypoint, index) => (
                            <WaypointItem
                                key={waypoint.uuid}
                                index={index}
                                waypoint={waypoint}
                                isBeingDragged={snapshot.isDraggingOver && waypoint.isSelected}
                                placeFetchResult={placeFetchResult(waypoint.address)}
                                outgoingRouteFetchResult={outgoingRouteFetchResult(index)}
                                incomingRouteFetchResult={incomingRouteFetchResult(index)}
                                itemWasClicked={itemWasClicked(index)}
                                deleteWaypoint={() => props.deleteWaypoint(index)}
                                setAddress={newWaypoint => props.setWaypoint(index, newWaypoint)}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}

const mapStateToProps = (state: AppState): WaypointListStateProps => ({
    waypoints: state.waypoints,
    fetchedRoutes: state.fetchedRoutes,
    fetchedPlaces: state.fetchedPlaces,
})

const mapDispatchToProps = (dispatch: React.Dispatch<AppAction>): WaypointListDispatchProps => ({
    setWaypoint: (index, waypoint) => dispatch(setAddress(index, waypoint)),
    deleteWaypoint: index => dispatch(deleteWaypoint(index)),
    selectWaypoint: index => dispatch(selectWaypoint(index)),
    toggleWaypointSelection: index => dispatch(toggleWaypointSelection(index)),
    selectWaypointRange: index => dispatch(selectWaypointRange(index)),
    moveWaypoint: (sourceIndex, destinationIndex) => dispatch(moveWaypoint(sourceIndex, destinationIndex)),
    moveSelectedWaypoints: index => dispatch(moveSelectedWaypoints(index)),
})

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(WaypointList)
