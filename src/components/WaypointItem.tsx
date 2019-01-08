import * as React from 'react'
import { Draggable } from 'react-beautiful-dnd';
import { isValidAddress } from '../redux/validator'
import { Waypoint, PlaceFetchResult, RouteFetchResult } from '../redux/state';

type WaypointItemProps = {
    index: number
    waypoint: Waypoint
    setAddress: (address: string) => void
    deleteWaypoint: () => void
    placeFetchResult?: PlaceFetchResult
    outgoingRouteFetchResult?: RouteFetchResult
    incomingRouteFetchResult?: RouteFetchResult
    isSelected: boolean
    isBeingDragged: boolean
    itemWasClicked: (e: React.MouseEvent) => void
}

type WaypointItemState = {
    isEditing: boolean
    waypointFieldValue: string
}

export default class WaypointItem extends React.Component<WaypointItemProps, WaypointItemState> {
    state = {
        isEditing: false,
        waypointFieldValue: this.props.waypoint.address
    }

    handleWaypointFieldValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            waypointFieldValue: e.currentTarget.value
        })
    }

    handleWaypointFieldKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && isValidAddress(this.state.waypointFieldValue)) {
            this.props.setAddress(this.state.waypointFieldValue)
            e.currentTarget.blur()
        }
    }

    resetWaypointField = () => {
        this.setState({
            waypointFieldValue: this.props.waypoint.address
        })
    }

    get fieldWasEdited() { return this.state.waypointFieldValue !== this.props.waypoint.address }

    get fetchIsInProgress() {
        const {
            placeFetchResult,
            incomingRouteFetchResult,
            outgoingRouteFetchResult
        } = this.props

        return placeFetchResult && placeFetchResult.status === 'IN_PROGRESS'
            || incomingRouteFetchResult && incomingRouteFetchResult.status === 'IN_PROGRESS'
            || outgoingRouteFetchResult && outgoingRouteFetchResult.status === 'IN_PROGRESS'
    }

    get fetchFailed() {
        const {
            placeFetchResult,
            incomingRouteFetchResult,
            outgoingRouteFetchResult
        } = this.props

        return placeFetchResult && placeFetchResult.status === 'FAILED'
            || incomingRouteFetchResult && incomingRouteFetchResult.status === 'FAILED'
            || outgoingRouteFetchResult && outgoingRouteFetchResult.status === 'FAILED'
    }

    render() {
        const {
            index,
            waypoint,
            itemWasClicked,
            isSelected,
            deleteWaypoint,
            isBeingDragged
        } = this.props

        return <Draggable index={index} draggableId={waypoint.uuid}>
            {(provided, snapshot) =>
                <div className="input-group mb-3"
                    ref={provided.innerRef}
                    {...provided.draggableProps}>
                    <div className="input-group-prepend">
                        <button onClick={deleteWaypoint} className="btn btn-sm btn-danger">
                            <i className="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <input
                        className="form-control"
                        value={this.state.waypointFieldValue}
                        onChange={this.handleWaypointFieldValueChange}
                        onKeyPress={this.handleWaypointFieldKeyPress}
                        disabled={isBeingDragged && !snapshot.isDragging}
                    />
                    <div className="input-group-append">
                        <button onClick={this.resetWaypointField} className="btn btn-secondary" hidden={!this.fieldWasEdited}>
                            <i className="fas fa-undo-alt"></i>
                        </button>
                        <span className="input-group-text text-danger" hidden={!this.fetchFailed}>
                            <i className="fas fa-exclamation-circle"></i>
                        </span>
                        <span className="input-group-text text-muted" hidden={!this.fetchIsInProgress}>
                            <i className="fas fa-circle-notch fa-spin"></i>
                        </span>
                        <span onClick={itemWasClicked} className={'input-group-text ' + (isSelected ? 'text-light bg-primary' : 'text-muted')} {...provided.dragHandleProps}>
                            <i className="fas fa-grip-lines-vertical"></i>
                        </span>
                    </div>
                </div>
            }
        </Draggable>
    }
}