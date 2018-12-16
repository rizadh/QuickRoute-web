import * as React from 'react'
import { DraggableProvided } from 'react-beautiful-dnd';
import { isValidAddress } from '../redux/validator'
import { Waypoint } from '../redux/state';

export type WaypointFetchStatus = 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED'

type WaypointItemProps = {
    waypoint: Waypoint
    setAddress: (address: string) => void
    deleteWaypoint: () => void
    fetchStatus: WaypointFetchStatus
    provided: DraggableProvided
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

    fieldWasEdited = (): boolean => {
        return this.state.waypointFieldValue !== this.props.waypoint.address
    }

    render() {
        return <div
            className="input-group mb-3"
            ref={this.props.provided.innerRef}
            {...this.props.provided.draggableProps}
        >
            <div className="input-group-prepend">
                <button onClick={this.props.deleteWaypoint} className="btn btn-sm btn-danger">
                    <i className="fas fa-trash-alt"></i>
                </button>
            </div>
            <input
                className="form-control"
                placeholder={this.props.waypoint.address}
                value={this.state.waypointFieldValue}
                onChange={this.handleWaypointFieldValueChange}
                onKeyPress={this.handleWaypointFieldKeyPress}
            />
            <div className="input-group-append">
                <button onClick={this.resetWaypointField} className="btn btn-secondary" hidden={!this.fieldWasEdited()}>
                    <i className="fas fa-undo-alt"></i>
                </button>
                <span className="input-group-text text-danger" hidden={this.props.fetchStatus !== 'FAILED'}>
                    <i className="fas fa-exclamation-circle"></i>
                </span>
                <span className="input-group-text text-muted" hidden={this.props.fetchStatus !== 'IN_PROGRESS'}>
                    <i className="fas fa-circle-notch fa-spin"></i>
                </span>
                <span className="input-group-text text-success" hidden={this.props.fetchStatus !== 'SUCCEEDED'}>
                    <i className="fas fa-check"></i>
                </span>
                <span className="input-group-text text-muted" {...this.props.provided.dragHandleProps}>
                    <i className="fas fa-grip-lines-vertical"></i>
                </span>
            </div>
        </div>
    }
}