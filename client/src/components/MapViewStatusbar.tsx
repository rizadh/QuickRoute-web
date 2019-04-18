import * as React from 'react'
import { connect } from 'react-redux'
import { routeInformation, RouteInformation } from '../redux/selectors'
import { AppState } from '../redux/state'
import StatView from './StatView'

type MapViewStatusbarProps = {
    routeInformation: RouteInformation;
}

const MapViewStatusbar = (props: MapViewStatusbarProps) => {
    let statusbarItems: JSX.Element | string
    switch (props.routeInformation.status) {
        case 'FETCHING':
            statusbarItems = (
                <>
                    <StatView title="Routing" value={stringForUpdateProgress(props.routeInformation.fetchProgress)} />
                </>
            )
            break
        case 'FETCHED':
            statusbarItems = (
                <>
                    <StatView title="Distance" value={stringForDistance(props.routeInformation.totalDistance)} />
                    <StatView title="Time" value={stringForTime(props.routeInformation.totalTime)} />
                </>
            )
            break
        case 'FAILED':
            statusbarItems = 'Routing failed'
            break
        case 'NO_ROUTE':
            statusbarItems = 'Enter more waypoints'
            break
        default:
            throw new Error('Invalid route information')
    }

    return <div id="mapview-statusbar">{statusbarItems}</div>
}

function stringForTime(seconds: number) {
    if (seconds < 60) {
        return `${Math.floor(seconds)} s`
    }

    if (seconds < 3600) {
        return `${Math.floor(seconds / 60)} min`
    }

    return `${Math.floor(seconds / 3600)} h ${Math.floor((seconds / 60) % 60)} m`
}

function stringForDistance(metres: number) {
    if (metres < 1000) {
        return `${Math.floor(metres)} metres`
    }

    return `${Math.floor(metres / 100) / 10} km`
}

function stringForUpdateProgress(progress: number): string {
    return `${Math.floor(progress * 1000) / 10} %`
}

const mapStateToProps = (state: AppState) => ({
    routeInformation: routeInformation(state),
})

export default connect(mapStateToProps)(MapViewStatusbar)
