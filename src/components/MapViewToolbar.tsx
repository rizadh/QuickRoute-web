import * as React from 'react'
import { connect } from 'react-redux'
import AppState, { RouteInformation } from '../redux/state'
import StatView from './StatView'
import { enableAutofit } from '../redux/actions';

interface MapViewToolbarStateProps {
    routeInformation?: RouteInformation
    autofitIsEnabled: boolean,
    mapIsUpdating: boolean,
    updateProgress: number
}

interface MapViewToolbarDispatchProps {
    enableAutofit: () => void
}

type MapViewToolbarProps = MapViewToolbarStateProps & MapViewToolbarDispatchProps

class MapViewToolbar extends React.Component<MapViewToolbarProps> {
    stringForTime = (seconds: number) => {
        if (seconds < 60) {
            return `${Math.floor(seconds)} s`
        }

        if (seconds < 3600) {
            return `${Math.floor(seconds / 60)} min`
        }

        return `${Math.floor(seconds / 3600)} h ${Math.floor((seconds / 60) % 60)} m`
    }

    stringForDistance = (metres: number) => {
        if (metres < 1000) {
            return `${Math.floor(metres)} metres`
        }

        return `${Math.floor(metres / 100) / 10} km`
    }

    stringForUpdateProgress = (): string =>
        `${Math.floor(this.props.updateProgress * 1000) / 10} %`

    render() {
        return <div className="mapview-toolbar frosted">
            {this.props.routeInformation
                ? <>
                    <StatView title="Distance" value={this.stringForDistance(this.props.routeInformation.distance)} />
                    <StatView title="Time" value={this.stringForTime(this.props.routeInformation.time)} />
                </>
                : this.props.mapIsUpdating
                    ? <StatView title="Routing" value={this.stringForUpdateProgress()} />
                    : "Add waypoints to show route information"
            }
            {this.props.autofitIsEnabled
                ? null
                : <button
                    className="btn btn-warning btn-sm"
                    onClick={this.props.enableAutofit}>Auto-Fit</button>
            }
        </div>
    }
}

export default connect<MapViewToolbarStateProps, MapViewToolbarDispatchProps, {}, AppState>(state => {
    const waypointCount = state.waypoints.length
    const currentRouteCount = state.foundRoutes.filter(a => a).length
    const targetRouteCount = waypointCount - 1
    const geocodedWaypointCount = state.waypoints.filter(w => typeof w.isGeocoded === 'boolean').length

    const totalItems = waypointCount + targetRouteCount
    const completedItems = geocodedWaypointCount + currentRouteCount
    const progress = completedItems / totalItems

    return {
        routeInformation: state.routeInformation,
        autofitIsEnabled: state.autofitIsEnabled,
        mapIsUpdating: state.mapIsUpdating,
        updateProgress: progress
    }
}, dispatch => ({
    enableAutofit: () => dispatch(enableAutofit())
}))(MapViewToolbar)