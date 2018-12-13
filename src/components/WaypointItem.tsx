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
    /*
    render() {
        return <div
            className="card mb-3"
            ref={this.props.provided.innerRef}
            {...this.props.provided.draggableProps}
            {...this.props.provided.dragHandleProps}
        >
            <h6 className="card-header">
                <button onClick={this.props.deleteWaypoint} className="btn btn-danger">
                    <i className="fas fa-trash-alt"></i>
                </button>
                <div className="btn-group float-right">
                    <button onClick={this.props.moveWaypointUp} className="btn btn-secondary">
                        <i className="fas fa-chevron-up"></i>
                    </button>
                    <button onClick={this.props.moveWaypointDown} className="btn btn-secondary">
                        <i className="fas fa-chevron-down"></i>
                    </button>
                </div>
            </h6>
            <div className={'card-body text-danger'} hidden={this.props.fetchStatus !== 'FAILED'}>
                {this.props.waypoint}
            </div>
            <div className={'card-body text-muted'} hidden={this.props.fetchStatus !== 'IN_PROGRESS'}>
                {this.props.waypoint} <i className="fas fa-spin fa-circle-notch"></i>
            </div>
            <div className={'card-body'} hidden={this.props.fetchStatus !== 'SUCCEEDED' || this.state.isEditing}>
                <div className="input-group border-success">
                    <input readOnly className="form-control" value={this.props.waypoint} />
                    <div className="input-group-append">
                        <button
                            className="btn btn-sm btn-warning"
                            hidden={this.state.isEditing}
                            onClick={this.beginEditing}
                        >
                            <i className="fas fa-pen"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className={'card-body'} hidden={this.props.fetchStatus !== 'SUCCEEDED' || !this.state.isEditing}>
                <div className="input-group">
                    <input
                        className="form-control"
                        placeholder={this.props.waypoint}
                        value={this.state.waypointFieldValue}
                        onChange={this.handleWaypointFieldValueChange}
                        onKeyPress={this.handleWaypointFieldKeyPress}
                        autoFocus
                    />
                    <div className="input-group-append">
                        <button onClick={this.cancelEditing} className="btn btn-secondary">
                            <i className="fas fa-times"></i>
                        </button>
                        <button
                            onClick={this.finishEditing}
                            className="btn btn-success"
                            disabled={!isValidWaypoint(this.state.waypointFieldValue)}
                        >
                            <i className="fas fa-check"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-footer text-danger" hidden={this.props.fetchStatus !== 'FAILED'}>
                <i className="fas fa-exclamation-circle"></i> Waypoint could not be found
            </div>
        </div>
    }
    */
}