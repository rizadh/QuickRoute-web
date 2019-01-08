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
    toggleWaypointSelection
} from '../redux/actions'
import { AppAction } from '../redux/actionTypes'
import { AppState, FetchedPlaces, FetchedRoutes, PlaceFetchResult, RouteFetchResult, Waypoint } from '../redux/state'
import WaypointItem from './WaypointItem'

type WaypointListStateProps = {
    waypoints: ReadonlyArray<Waypoint>
    fetchedRoutes: FetchedRoutes
    fetchedPlaces: FetchedPlaces
}

type WaypointListDispatchProps = {
    setWaypoint: (index: number, address: string) => void
    deleteWaypoint: (index: number) => void
    selectWaypoint: (index: number) => void
    toggleWaypointSelection: (index: number) => void
    selectWaypointRange: (index: number) => void
    moveWaypoint: (sourceIndex: number, destinationIndex: number) => void
    moveSelectedWaypoints: (index: number) => void
}

type WaypointListProps = WaypointListStateProps & WaypointListDispatchProps
class WaypointList extends React.Component<WaypointListProps> {
    placeFetchResult = (address: string): PlaceFetchResult | undefined =>

        this.props.fetchedPlaces.get(address)

    incomingRouteFetchResult = (index: number): RouteFetchResult | undefined => {
        if (index === 0) return

        return this.routeFetchResult(
            this.props.waypoints[index - 1].address,
            this.props.waypoints[index].address,
        )
    }

    outgoingRouteFetchResult = (index: number): RouteFetchResult | undefined => {
        if (index === this.props.waypoints.length - 1) return

        return this.routeFetchResult(
            this.props.waypoints[index].address,
            this.props.waypoints[index + 1].address,
        )
    }

    routeFetchResult = (origin: string, destination: string): RouteFetchResult | undefined => {
        const routesFromOrigin = this.props.fetchedRoutes.get(origin)

        return routesFromOrigin ? routesFromOrigin.get(destination) : undefined
    }

    onDragEnd = (result: DropResult) => {
        if (!result.destination) return
        if (result.destination.index === result.source.index) return

        if (this.props.waypoints[result.source.index].isSelected) {
            this.props.moveSelectedWaypoints(result.destination.index)
        } else {
            this.props.moveWaypoint(result.source.index, result.destination.index)
        }
    }

    itemWasClicked = (index: number) => (e: React.MouseEvent) => {
        if (e.shiftKey) {
            e.preventDefault()
            this.props.selectWaypointRange(index)
        } else if (e.ctrlKey || e.metaKey) {
            this.props.toggleWaypointSelection(index)
        } else {
            this.props.selectWaypoint(index)
        }
    }

    render() {
        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId="waypointlist">
                    {(provided, snapshot) =>
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                            {this.props.waypoints.map((waypoint, index) =>
                                <WaypointItem
                                    key={waypoint.uuid}
                                    index={index}
                                    waypoint={waypoint}
                                    isBeingDragged={snapshot.isDraggingOver && waypoint.isSelected}
                                    placeFetchResult={this.placeFetchResult(waypoint.address)}
                                    outgoingRouteFetchResult={this.outgoingRouteFetchResult(index)}
                                    incomingRouteFetchResult={this.incomingRouteFetchResult(index)}
                                    itemWasClicked={this.itemWasClicked(index)}
                                    deleteWaypoint={() => this.props.deleteWaypoint(index)}
                                    setAddress={(newWaypoint) => this.props.setWaypoint(index, newWaypoint)}
                                />,
                            )}
                            {provided.placeholder}
                        </div>
                    }
                </Droppable>
            </DragDropContext>
        )
    }
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

export default connect(mapStateToProps, mapDispatchToProps)(WaypointList)
