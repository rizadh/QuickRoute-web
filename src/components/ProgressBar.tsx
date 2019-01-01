import * as React from 'react'
import { Line } from 'rc-progress'
import { RouteInformation, routeInformation } from '../redux/selectors'
import { connect } from 'react-redux';
import {AppState} from '../redux/state';

type ProgressBarProps = {
    routeInformation: RouteInformation
}

class ProgressBar extends React.Component<ProgressBarProps> {
    render() {
        if (this.props.routeInformation.status === 'FETCHING')
            return <div id="progress-bar">
                <Line
                    percent={this.props.routeInformation.fetchProgress * 100}
                    trailColor="transparent"
                    strokeColor='#ffc107'
                    strokeLinecap='butt'
                />
            </div>

        return null
    }
}

const mapStateToProps = (state: AppState) => ({
    routeInformation: routeInformation(state),
})

export default connect(mapStateToProps)(ProgressBar)