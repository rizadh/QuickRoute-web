import React, { useContext } from 'react'
import { AppStateContext } from '../context/AppStateContext'
import { routeInformation } from '../redux/selectors'
import { StatView } from './StatView'

type RouteInformationBarProps = {
    collapsed?: boolean;
}

export const RouteInformationBar = ({ collapsed }: RouteInformationBarProps) => {
    const { state } = useContext(AppStateContext)
    const currentRouteInformation = routeInformation(state)

    let statusbarItems: JSX.Element | string
    switch (currentRouteInformation.status) {
        case 'FETCHING':
            statusbarItems = (
                <StatView title="Routing" value={stringForUpdateProgress(currentRouteInformation.progress)} />
            )
            break
        case 'FETCHED':
            statusbarItems = (
                <>
                    <StatView title="Distance" value={stringForDistance(currentRouteInformation.totalDistance)} />
                    <StatView title="Time" value={stringForTime(currentRouteInformation.totalTime)} />
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

    return (
        <div id="route-statusbar" className={collapsed ? 'collapsed' : undefined}>
            {statusbarItems}
        </div>
    )
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
