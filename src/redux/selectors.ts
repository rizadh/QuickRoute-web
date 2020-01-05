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

    const routeSuccessCount = routes.filter(result => result?.status === 'SUCCESS').length
    const routeFailedCount = routes.filter(result => result?.status === 'FAILED').length

    if (routeSuccessCount === routeCount) {
        return {
            status: 'FETCHED',
            totalDistance: routes
                .map(route => (route?.status === 'SUCCESS' ? route.result.distance : 0))
                .reduce((acc, cur) => acc + cur, 0),
            totalTime: routes
                .map(route => (route?.status === 'SUCCESS' ? route.result.time : 0))
                .reduce((acc, cur) => acc + cur, 0),
        }
    } else if (routeSuccessCount + routeFailedCount === routeCount) {
        return { status: 'FAILED' }
    } else {
        return { status: 'FETCHING', progress: (routeSuccessCount + routeFailedCount) / routeCount }
    }
}
