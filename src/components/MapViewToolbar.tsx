import * as React from 'react'
import { connect } from 'react-redux'
import AppState from '../redux/state'
import StatView from './StatView'
import { routeInformation, RouteInformation } from '../redux/selectors'

interface MapViewToolbarProps {
    routeInformation: RouteInformation
}

// TODO: Convert into plain function
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

    stringForUpdateProgress = (progress: number): string =>
        `${Math.floor(progress * 1000) / 10} %`

    render() {
        let toolbarItems: JSX.Element
        switch (this.props.routeInformation.status) {
            case 'FETCHING':
                toolbarItems = <StatView title="Routing" value={this.stringForUpdateProgress(this.props.routeInformation.fetchProgress)} />
                break
            case 'FETCHED':
                toolbarItems = <>
                    <StatView title="Distance" value={this.stringForDistance(this.props.routeInformation.totalDistance)} />
                    <StatView title="Time" value={this.stringForTime(this.props.routeInformation.totalTime)} />
                </>
                break
            case 'FAILED':
                toolbarItems = <>Routing failed</>
                break
            case 'EMPTY':
                toolbarItems = <>Add waypoints to show route information</>
                break
            default:
                throw new Error('Invalid route information')
        }

        return <div className="mapview-toolbar frosted">
            {toolbarItems}
        </div>
    }
}

const mapStateToProps = (state: AppState) => ({
    routeInformation: routeInformation(state),
})

export default connect(mapStateToProps)(MapViewToolbar)