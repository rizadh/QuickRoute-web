import * as React from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { PlaceFetchResult, RouteFetchResult, Waypoint } from '../redux/state'
import { isValidAddress } from '../redux/validator'

type WaypointItemProps = {
    index: number
    waypoint: Waypoint
    setAddress: (address: string) => void
    deleteWaypoint: () => void
    placeFetchResult?: PlaceFetchResult
    outgoingRouteFetchResult?: RouteFetchResult
    incomingRouteFetchResult?: RouteFetchResult
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
        waypointFieldValue: this.props.waypoint.address,
    }

    handleWaypointFieldValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            waypointFieldValue: e.currentTarget.value,
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
            waypointFieldValue: this.props.waypoint.address,
        })
    }

    get fieldWasEdited() { return this.state.waypointFieldValue !== this.props.waypoint.address }

    get fetchIsInProgress() {
        const {
            placeFetchResult,
            incomingRouteFetchResult,
            outgoingRouteFetchResult,
        } = this.props

        return placeFetchResult && placeFetchResult.status === 'IN_PROGRESS'
            || incomingRouteFetchResult && incomingRouteFetchResult.status === 'IN_PROGRESS'
            || outgoingRouteFetchResult && outgoingRouteFetchResult.status === 'IN_PROGRESS'
    }

    get fetchFailed() {
        const {
            placeFetchResult,
            incomingRouteFetchResult,
            outgoingRouteFetchResult,
        } = this.props

        return placeFetchResult && placeFetchResult.status === 'FAILED'
            || incomingRouteFetchResult && incomingRouteFetchResult.status === 'FAILED'
            || outgoingRouteFetchResult && outgoingRouteFetchResult.status === 'FAILED'
    }

    /* tslint:disable:jsx-no-multiline-js */
    render() {
        const {
            index,
            waypoint,
            itemWasClicked,
            deleteWaypoint,
            isBeingDragged,
        } = this.props

        return (
            <Draggable index={index} draggableId={waypoint.uuid}>
                {(provided, snapshot) =>
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={'input-row ' + (waypoint.isSelected ? 'waypoint-item-selected' : '')}
                    >
                        <button onClick={deleteWaypoint} className="btn btn-sm btn-danger">
                            <i className="fas fa-trash-alt" />
                        </button>
                        <input
                            className={'form-control ' + (waypoint.isSelected ? 'text-primary' : '')}
                            value={this.state.waypointFieldValue}
                            onChange={this.handleWaypointFieldValueChange}
                            onKeyPress={this.handleWaypointFieldKeyPress}
                            disabled={isBeingDragged && !snapshot.isDragging}
                        />
                        <button
                            onClick={this.resetWaypointField}
                            className="btn btn-secondary"
                            hidden={!this.fieldWasEdited}
                        >
                            <i className="fas fa-undo-alt" />
                        </button>
                        <span className="text-danger" hidden={!this.fetchFailed}>
                            <i className="fas fa-exclamation-circle" />
                        </span>
                        <span className="text-muted" hidden={!this.fetchIsInProgress}>
                            <i className="fas fa-circle-notch fa-spin" />
                        </span>
                        <span>{index + 1}</span>
                        <span onClick={itemWasClicked} {...provided.dragHandleProps}>
                            <i className="fas fa-grip-lines-vertical" />
                        </span>
                    </div>
                }
            </Draggable>
        )
    }
    /* tslint:enable:jsx-no-multiline-js */
}
