import * as React from 'react'
import { AppState, FetchedRoutes, FetchedPlaces, Waypoint, RouteFetchResult, PlaceFetchResult } from '../redux/state';
import { connect } from 'react-redux';
import { AppAction } from '../redux/actionTypes';
import { deleteWaypoint, setAddress, moveWaypoint, moveWaypoints } from '../redux/actions';
import WaypointItem from './WaypointItem'
import { DragDropContext, DropResult, Droppable, DragStart } from 'react-beautiful-dnd'
import { range } from 'lodash'

type WaypointListStateProps = {
    waypoints: ReadonlyArray<Waypoint>
    fetchedRoutes: FetchedRoutes
    fetchedPlaces: FetchedPlaces
}

type WaypointListDispatchProps = {
    setWaypoint: (index: number, address: string) => void
    moveWaypoint: (sourceIndex: number, destinationIndex: number) => void
    moveWaypoints: (sourceIndexes: ReadonlySet<number>, destinationIndex: number) => void
    deleteWaypoint: (index: number) => void
}

type WaypointListProps = WaypointListStateProps & WaypointListDispatchProps

type WaypointListState = {
    selectedItems: ReadonlySet<number>
    initialSelection: number
}

class WaypointList extends React.Component<WaypointListProps, WaypointListState> {
    state = { selectedItems: new Set() as ReadonlySet<number>, initialSelection: 0 }

    placeFetchResult = (address: string): PlaceFetchResult | undefined => {

        return this.props.fetchedPlaces.get(address)
    }

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

        if (this.state.selectedItems.has(result.source.index)) {
            this.props.moveWaypoints(this.state.selectedItems, result.destination.index)

            this.setState({
                selectedItems: new Set(range(
                    result.destination.index,
                    result.destination.index + this.state.selectedItems.size
                ))
            })
        } else {
            this.props.moveWaypoint(result.source.index, result.destination.index)
        }
    }

    onDragStart = (dragStart: DragStart) => {
        if (!this.state.selectedItems.has(dragStart.source.index)) {
            this.setState({
                selectedItems: new Set()
            })
        }
    }

    itemWasClicked = (index: number) => (e: React.MouseEvent) => {
        const shouldToggleItem = e.ctrlKey || e.metaKey
        const shouldSelectRange = e.shiftKey

        if (shouldSelectRange) e.preventDefault()

        this.setState(state => {
            if (shouldSelectRange) {
                const newItems = state.initialSelection < index
                    ? range(state.initialSelection, index + 1)
                    : range(index, state.initialSelection + 1)

                // TODO: Handle overlap of an existing selection (by replacing the existing selection)

                return ({
                    initialSelection: state.initialSelection,
                    selectedItems: new Set([...newItems, ...state.selectedItems])
                })
            } else if (shouldToggleItem) {
                return {
                    initialSelection: index,
                    selectedItems: state.selectedItems.has(index)
                        ? new Set([...state.selectedItems].filter(item => item !== index))
                        : new Set(state.selectedItems).add(index)
                }
            } else if (state.selectedItems.size === 1 && state.selectedItems.has(index)) {
                return {
                    initialSelection: index,
                    selectedItems: new Set(),
                }
            } else {
                return {
                    initialSelection: index,
                    selectedItems: new Set([index]),
                }
            }
        })
    }

    render() {
        return (
            <DragDropContext onDragEnd={this.onDragEnd} onDragStart={this.onDragStart}>
                <Droppable droppableId="waypointlist">
                    {(provided, snapshot) =>
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                            {this.props.waypoints.map((waypoint, index) =>
                                <WaypointItem
                                    key={waypoint.uuid}
                                    index={index}
                                    waypoint={waypoint}
                                    isSelected={this.state.selectedItems.has(index)}
                                    isBeingDragged={snapshot.isDraggingOver && this.state.selectedItems.has(index)}
                                    placeFetchResult={this.placeFetchResult(waypoint.address)}
                                    outgoingRouteFetchResult={this.outgoingRouteFetchResult(index)}
                                    incomingRouteFetchResult={this.incomingRouteFetchResult(index)}
                                    itemWasClicked={this.itemWasClicked(index)}
                                    deleteWaypoint={() => this.props.deleteWaypoint(index)}
                                    setAddress={(newWaypoint) => this.props.setWaypoint(index, newWaypoint)}
                                />
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
    moveWaypoint: (sourceIndex, destinationIndex) => dispatch(moveWaypoint(sourceIndex, destinationIndex)),
    moveWaypoints: (sourceIndexes, destinationIndex) => dispatch(moveWaypoints(sourceIndexes, destinationIndex)),
})

export default connect(mapStateToProps, mapDispatchToProps)(WaypointList)