import * as React from 'react'
import { DraggableProvided } from 'react-beautiful-dnd';

export type WaypointFetchStatus = 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED'

interface WaypointItemProps {
    waypoint: string
    setWaypoint: (waypoint: string) => void
    deleteWaypoint: () => void
    moveWaypointUp: () => void
    moveWaypointDown: () => void
    fetchStatus: WaypointFetchStatus
    provided: DraggableProvided
}

export default class WaypointItem extends React.Component<WaypointItemProps> {
    render() {
        return <div
            className="card mb-3"
            ref={this.props.provided.innerRef}
            {...this.props.provided.draggableProps}
            {...this.props.provided.dragHandleProps}
        >
            <h6 className="card-header">
                <button
                    onClick={this.props.deleteWaypoint}
                    className="btn btn-danger">
                    <i className="fas fa-trash-alt"></i>
                </button>
                <div className="btn-group float-right">
                    <button
                        onClick={this.props.moveWaypointUp}
                        className="btn btn-secondary">
                        <i className="fas fa-chevron-up"></i>
                    </button>
                    <button
                        onClick={this.props.moveWaypointDown}
                        className="btn btn-secondary">
                        <i className="fas fa-chevron-down"></i>
                    </button>
                </div>
            </h6>
            <div className={'card-body ' + (this.props.fetchStatus === 'FAILED' ? 'text-danger' : 'text-bold')}>
                {this.props.waypoint}
            </div>
            <div className="card-footer text-muted" hidden={this.props.fetchStatus !== 'IN_PROGRESS'}>
                <i className="fas fa-spin fa-circle-notch"></i> Fetching
            </div>
            <div className="card-footer text-danger" hidden={this.props.fetchStatus !== 'FAILED'}>
                <i className="fas fa-exclamation-circle"></i> Waypoint could not be found
            </div>
        </div>
    }
}