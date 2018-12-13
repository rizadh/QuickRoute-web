import * as React from 'react'
import AppState, { FetchedRoutes, FetchedPlaces } from '../redux/state';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { ExtraArgument } from '../redux/store';
import AppAction from '../redux/actionTypes';
import { addWaypoint, deleteWaypoint, setWaypoint, moveWaypoint } from '../redux/actions';
import { isValidWaypoint } from '../redux/validator'
import WaypointItem, { WaypointFetchStatus } from './WaypointItem'
import { DragDropContext, DropResult, Droppable, Draggable } from 'react-beautiful-dnd'

type WaypointListStateProps = {
    waypoints: string[]
    fetchedRoutes: FetchedRoutes
    fetchedPlaces: FetchedPlaces
}

type WaypointListDispatchProps = {
    setWaypoint: (index: number, waypoint: string) => void
    moveWaypoint: (sourceIndex: number, destinationIndex: number) => void
    addWaypoint: (waypoint: string) => string | null
    deleteWaypoint: (index: number) => void
}

type WaypointListProps = WaypointListStateProps & WaypointListDispatchProps

type WaypointListState = {
    newWaypointFieldValue: string
}

class WaypointList extends React.Component<WaypointListProps, WaypointListState> {
    state = { newWaypointFieldValue: '' }

    lookupStatus = (index: number): boolean | undefined => {
        const waypoint = this.props.waypoints[index]
        const place = this.props.fetchedPlaces[waypoint]

        if (place === undefined) return undefined
        if (place === null) return false

        return true
    }

    routeStatus = (index: number): 'NONE' | 'ALL' | 'PARTIAL' => {
        const previousWaypoint = this.props.waypoints[index - 1]
        const thisWaypoint = this.props.waypoints[index]
        const nextWaypoint = this.props.waypoints[index + 1]

        const incomingRoute = this.props.fetchedRoutes[previousWaypoint + '|' + thisWaypoint]
        const outgoingRoute = this.props.fetchedRoutes[thisWaypoint + '|' + nextWaypoint]
        const lastIndex = this.props.waypoints.length - 1

        if (index === 0) return outgoingRoute ? 'ALL' : 'NONE'
        if (index === lastIndex) return incomingRoute ? 'ALL' : 'NONE'
        else if (incomingRoute && outgoingRoute) return 'ALL'
        else if (incomingRoute || outgoingRoute) return 'PARTIAL'
        else return 'NONE'
    }

    addNewWaypoint = () => {
        if (this.props.addWaypoint(this.state.newWaypointFieldValue))
            this.setState({
                newWaypointFieldValue: ''
            })
    }

    handleNewWaypointFieldValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            newWaypointFieldValue: e.currentTarget.value
        })
    }

    handleNewWaypointFieldKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') this.addNewWaypoint()
    }

    handleWaypointItemDrag = (e: React.DragEvent) => {
        console.log(e.clientX)
        console.log(e.clientY)
    }

    waypointFetchStatus = (waypoint: string): WaypointFetchStatus => {
        const place = this.props.fetchedPlaces[waypoint]
        if (place) return 'SUCCEEDED'
        else if (place === null) return 'FAILED'
        else return 'IN_PROGRESS'
    }

    onDragEnd = (result: DropResult) => {
        if (!result.destination) return

        this.props.moveWaypoint(result.source.index, result.destination.index)
    }

    render() {
        return <>
            <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided) =>
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                            {this.props.waypoints.map((waypoint, index) =>
                                <Draggable key={waypoint} index={index} draggableId={waypoint}>
                                    {(provided) =>
                                        <WaypointItem
                                            provided={provided}
                                            waypoint={waypoint}
                                            fetchStatus={this.waypointFetchStatus(waypoint)}
                                            setWaypoint={(newWaypoint) => this.props.setWaypoint(index, newWaypoint)}
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
            <div className="input-group pb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 123 Example Street"
                    value={this.state.newWaypointFieldValue}
                    onChange={this.handleNewWaypointFieldValueChange}
                    onKeyPress={this.handleNewWaypointFieldKeyPress}
                    autoFocus
                ></input>
                <div className="input-group-append">
                    <button
                        onClick={this.addNewWaypoint}
                        disabled={!isValidWaypoint(this.state.newWaypointFieldValue)}
                        className="btn btn-primary">
                        <i className="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </>
    }
}

const mapStateToProps = (state: AppState): WaypointListStateProps => ({
    waypoints: state.waypoints,
    fetchedRoutes: state.fetchedRoutes,
    fetchedPlaces: state.fetchedPlaces
})

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, ExtraArgument, AppAction>): WaypointListDispatchProps => ({
    addWaypoint: waypoint => dispatch(addWaypoint(waypoint)),
    deleteWaypoint: index => dispatch(deleteWaypoint(index)),
    setWaypoint: (index, waypoint) => dispatch(setWaypoint(index, waypoint)),
    moveWaypoint: (sourceIndex, destinationIndex) => dispatch(moveWaypoint(sourceIndex, destinationIndex))
})

export default connect(mapStateToProps, mapDispatchToProps)(WaypointList)