import { Line } from 'rc-progress'
import * as React from 'react'
import { connect } from 'react-redux'
import { useMedia } from '../hooks/useMedia'
import { RouteInformation, routeInformation } from '../redux/selectors'
import { AppState } from '../redux/state'

type ProgressBarProps = {
    routeInformation: RouteInformation
}

const ProgressBar = (props: ProgressBarProps) => {
    const darkMode = useMedia('(prefers-color-scheme: dark)')

    if (props.routeInformation.status === 'FETCHING') {
        return (
            <div id="progress-bar">
                <Line
                    percent={props.routeInformation.fetchProgress * 100}
                    trailColor={darkMode ? 'rgba(10, 132, 255, 0.2)' : 'rgb(0, 122, 255, 0.2)'}
                    strokeColor={darkMode ? 'rgb(10, 132, 255)' : 'rgb(0, 122, 255)'}
                    strokeLinecap="butt"
                />
            </div>
        )
    }

    return null
}

const mapStateToProps = (state: AppState) => ({
    routeInformation: routeInformation(state),
})

export default connect(mapStateToProps)(ProgressBar)
