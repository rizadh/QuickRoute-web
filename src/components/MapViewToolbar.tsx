import * as React from 'react'
import { connect } from 'react-redux'
import AppState, { RouteInformation } from '../redux/state'
import StatView from './StatView'
import { enableAutofit } from '../redux/actions';

interface MapViewToolbarStateProps {
    routeInformation?: RouteInformation
    autofitIsEnabled: boolean,
    mapIsUpdating: boolean
}

interface MapViewToolbarDispatchProps {
    enableAutofit: () => void
}

type MapViewToolbarProps = MapViewToolbarStateProps & MapViewToolbarDispatchProps

class MapViewToolbar extends React.Component<MapViewToolbarProps> {
    stringForTime(seconds: number) {
        if (seconds < 60) {
            return `${Math.floor(seconds)} s`
        }

        if (seconds < 3600) {
            return `${Math.floor(seconds / 60)} min`
        }

        return `${Math.floor(seconds / 3600)} h ${Math.floor((seconds / 60) % 60)} m`
    }

    stringForDistance(metres: number) {
        if (metres < 1000) {
            return `${Math.floor(metres)} metres`
        }

        return `${Math.floor(metres / 100) / 10} km`
    }

    render() {
        const classNames = this.props.mapIsUpdating ? ['mapview-toolbar', 'updating'] : ['mapview-toolbar']

        return <div className={classNames.join(' ')}>
            {this.props.routeInformation
                ? <>
                    <StatView title="Distance" value={this.stringForDistance(this.props.routeInformation.distance)} />
                    <StatView title="Time" value={this.stringForTime(this.props.routeInformation.time)} />
                </>
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

export default connect<MapViewToolbarStateProps, MapViewToolbarDispatchProps, {}, AppState>(state => ({
    routeInformation: state.routeInformation,
    autofitIsEnabled: state.autofitIsEnabled,
    mapIsUpdating: state.mapIsUpdating
}), dispatch => ({
    enableAutofit: () => dispatch(enableAutofit())
}))(MapViewToolbar)