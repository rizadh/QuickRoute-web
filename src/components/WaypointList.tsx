import * as React from 'react'
import { AppState, FetchedRoutes, FetchedPlaces, Waypoint } from '../redux/state';
import { connect } from 'react-redux';
import { AppAction } from '../redux/actionTypes';
import { deleteWaypoint, setAddress, moveWaypoint } from '../redux/actions';
import WaypointItem, { FetchStatus } from './WaypointItem'
import { DragDropContext, DropResult, Droppable, Draggable } from 'react-beautiful-dnd'

type WaypointListStateProps = {
    waypoints: ReadonlyArray<Waypoint>
    fetchedRoutes: FetchedRoutes
    fetchedPlaces: FetchedPlaces
}

type WaypointListDispatchProps = {
    setWaypoint: (index: number, address: string) => void
    moveWaypoint: (sourceIndex: number, destinationIndex: number) => void
    deleteWaypoint: (index: number) => void
}

type WaypointListProps = WaypointListStateProps & WaypointListDispatchProps

class WaypointList extends React.Component<WaypointListProps> {
    placeFetchStatus = (address: string): FetchStatus => {
        const place = this.props.fetchedPlaces.get(address)
        return place ? place.status : 'IN_PROGRESS'
    }

    incomingRouteStatus = (index: number): FetchStatus | undefined => {
        if (index === 0) return

        return this.routeStatus(
            this.props.waypoints[index - 1].address,
            this.props.waypoints[index].address,
        )
    }

    outgoingRouteStatus = (index: number): FetchStatus | undefined => {
        if (index === this.props.waypoints.length - 1) return

        return this.routeStatus(
            this.props.waypoints[index].address,
            this.props.waypoints[index + 1].address,
        )
    }

    routeStatus = (origin: string, destination: string): FetchStatus => {
        const routesFromOrigin = this.props.fetchedRoutes.get(origin)
        if (!routesFromOrigin) return 'IN_PROGRESS'

        const route = routesFromOrigin.get(destination)
        return route ? route.status : 'IN_PROGRESS'
    }

    onDragEnd = (result: DropResult) => {
        if (!result.destination) return

        this.props.moveWaypoint(result.source.index, result.destination.index)
    }

    render() {
        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided) =>
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                            {this.props.waypoints.map((waypoint, index) =>
                                <Draggable key={waypoint.uuid} index={index} draggableId={waypoint.uuid}>
                                    {(provided) =>
                                        <WaypointItem
                                            provided={provided}
                                            address={waypoint.address}
                                            placeFetchStatus={this.placeFetchStatus(waypoint.address)}
                                            outgoingRouteFetchStatus={this.outgoingRouteStatus(index)}
                                            incomingRouteFetchStatus={this.incomingRouteStatus(index)}
                                            setAddress={(newWaypoint) => this.props.setWaypoint(index, newWaypoint)}
                                            deleteWaypoint={() => this.props.deleteWaypoint(index)}
                                        />
                                    }
                                </Draggable>
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
    fetchedPlaces: state.fetchedPlaces
})

const mapDispatchToProps = (dispatch: React.Dispatch<AppAction>): WaypointListDispatchProps => ({
    deleteWaypoint: index => dispatch(deleteWaypoint(index)),
    setWaypoint: (index, waypoint) => dispatch(setAddress(index, waypoint)),
    moveWaypoint: (sourceIndex, destinationIndex) => dispatch(moveWaypoint(sourceIndex, destinationIndex))
})

export default connect(mapStateToProps, mapDispatchToProps)(WaypointList)