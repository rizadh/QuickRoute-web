import * as React from 'react'
import AppState, { FetchedRoutes, FetchedPlaces, Waypoint } from '../redux/state';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { ExtraArgument } from '../redux/store';
import AppAction from '../redux/actionTypes';
import { deleteWaypoint, setWaypoint, moveWaypoint } from '../redux/actions';
import WaypointItem, { FetchStatus } from './WaypointItem'
import { DragDropContext, DropResult, Droppable, Draggable } from 'react-beautiful-dnd'
import { fetchedRoutesKey } from '../redux/reducer'

type WaypointListStateProps = {
    waypoints: Waypoint[]
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
    incomingRouteStatus = (index: number): FetchStatus | undefined => {
        if (index === 0) return

        if (this.props.fetchedPlaces[index - 1] === undefined) return
        if (this.props.fetchedPlaces[index] === undefined) return

        const route = this.props.fetchedRoutes[fetchedRoutesKey(
            this.props.waypoints[index - 1].address,
            this.props.waypoints[index].address
        )]

        if (route === undefined) return 'IN_PROGRESS'
        else return route ? 'SUCCEEDED' : 'FAILED'
    }

    outgoingRouteStatus = (index: number): FetchStatus | undefined => {
        if (index === this.props.waypoints.length - 1) return

        if (this.props.fetchedPlaces[index] === undefined) return
        if (this.props.fetchedPlaces[index + 1] === undefined) return

        const route = this.props.fetchedRoutes[fetchedRoutesKey(
            this.props.waypoints[index].address,
            this.props.waypoints[index + 1].address
        )]

        if (route === undefined) return 'IN_PROGRESS'
        else return route ? 'SUCCEEDED' : 'FAILED'
    }

    addressFetchStatus = (address: string): FetchStatus => {
        const place = this.props.fetchedPlaces[address]
        if (place) return 'SUCCEEDED'
        else if (place === null) return 'FAILED'
        else return 'IN_PROGRESS'
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
                                            waypointFetchStatus={this.addressFetchStatus(waypoint.address)}
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

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, ExtraArgument, AppAction>): WaypointListDispatchProps => ({
    deleteWaypoint: index => dispatch(deleteWaypoint(index)),
    setWaypoint: (index, waypoint) => dispatch(setWaypoint(index, waypoint)),
    moveWaypoint: (sourceIndex, destinationIndex) => dispatch(moveWaypoint(sourceIndex, destinationIndex))
})

export default connect(mapStateToProps, mapDispatchToProps)(WaypointList)