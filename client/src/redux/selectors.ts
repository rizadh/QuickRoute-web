import range from 'lodash/range'
import { AppState } from '../redux/state'
import { getRoute } from './util'

type NoRouteInformation = Readonly<{
    status: 'NO_ROUTE';
}>

type FetchedRouteInformation = Readonly<{
    status: 'FETCHED';
    totalDistance: number;
    totalTime: number;
}>

type FetchFailedRouteInformation = Readonly<{
    status: 'FAILED';
}>

type FetchingRouteInformation = Readonly<{
    status: 'FETCHING';
    progress: number;
}>

export type RouteInformation =
    | FetchedRouteInformation
    | FetchFailedRouteInformation
    | FetchingRouteInformation
    | NoRouteInformation

export const routeInformation = (state: AppState): RouteInformation => {
    const routeCount = state.waypoints.list.length - 1

    if (routeCount <= 0) return { status: 'NO_ROUTE' }

    const routes = range(0, routeCount).map(i =>
        getRoute(state.fetchedRoutes, state.waypoints.list[i].address, state.waypoints.list[i + 1].address),
    )

    const routeSuccessCount = routes.filter(result => result && result.status === 'SUCCESS').length
    const routeFailedCount = routes.filter(result => result && result.status === 'FAILED').length

    if (routeFailedCount) return { status: 'FAILED' }

    const totalDistance = routes
        .map(route => (route && route.status === 'SUCCESS' ? route.result.distance : 0))
        .reduce((acc, cur) => acc + cur, 0)

    const totalTime = routes
        .map(route => (route && route.status === 'SUCCESS' ? route.result.expectedTravelTime : 0))
        .reduce((acc, cur) => acc + cur, 0)

    const progress = routeSuccessCount / routeCount

    return progress === 1 ? { status: 'FETCHED', totalDistance, totalTime } : { status: 'FETCHING', progress }
}
