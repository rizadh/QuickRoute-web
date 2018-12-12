import * as React from 'react'
import { DraggableProvided } from 'react-beautiful-dnd';
import { isValidWaypoint } from '../redux/validator'

export type WaypointFetchStatus = 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED'

type WaypointItemProps = {
    waypoint: string
    setWaypoint: (waypoint: string) => void
    deleteWaypoint: () => void
    moveWaypointUp: () => void
    moveWaypointDown: () => void
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
        waypointFieldValue: ''
    }

    beginEditing = () => {
        this.setState({
            isEditing: true,
            waypointFieldValue: this.props.waypoint
        })
    }

    handleWaypointFieldValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            waypointFieldValue: e.currentTarget.value
        })
    }

    handleWaypointFieldKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') this.finishEditing()
    }

    cancelEditing = () => {
        this.setState({
            isEditing: false
        })
    }

    finishEditing = () => {
        if (!isValidWaypoint(this.state.waypointFieldValue)) return

        this.props.setWaypoint(this.state.waypointFieldValue)

        this.setState({
            isEditing: false
        })
    }

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
}