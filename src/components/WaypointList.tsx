import * as React from 'react'
import AppState, { FetchedRoutes, FetchedPlaces, Waypoint } from '../redux/state';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { ExtraArgument } from '../redux/store';
import AppAction from '../redux/actionTypes';
import { deleteWaypoint, setWaypoint, moveWaypoint } from '../redux/actions';
import WaypointItem, { WaypointFetchStatus } from './WaypointItem'
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
    lookupStatus = (index: number): boolean | undefined => {
        const waypoint = this.props.waypoints[index]
        const place = this.props.fetchedPlaces[waypoint.address]

        if (place === undefined) return undefined
        if (place === null) return false

        return true
    }

    routeStatus = (index: number): 'NONE' | 'ALL' | 'PARTIAL' => {
        const previousWaypoint = this.props.waypoints[index - 1]
        const thisWaypoint = this.props.waypoints[index]
        const nextWaypoint = this.props.waypoints[index + 1]

        const incomingRoute = this.props.fetchedRoutes[fetchedRoutesKey(previousWaypoint.address, thisWaypoint.address)]
        const outgoingRoute = this.props.fetchedRoutes[fetchedRoutesKey(thisWaypoint.address, nextWaypoint.address)]
        const lastIndex = this.props.waypoints.length - 1

        if (index === 0) return outgoingRoute ? 'ALL' : 'NONE'
        if (index === lastIndex) return incomingRoute ? 'ALL' : 'NONE'
        else if (incomingRoute && outgoingRoute) return 'ALL'
        else if (incomingRoute || outgoingRoute) return 'PARTIAL'
        else return 'NONE'
    }

    handleWaypointItemDrag = (e: React.DragEvent) => {
        console.log(e.clientX)
        console.log(e.clientY)
    }

    addressFetchStatus = (address: string): WaypointFetchStatus => {
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
                                            waypoint={waypoint}
                                            fetchStatus={this.addressFetchStatus(waypoint.address)}
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