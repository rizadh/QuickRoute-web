import { range } from 'lodash'
import { AppState, FetchSuccess } from '../redux/state'

type NoRouteInformation = Readonly<{
    status: 'NO_ROUTE'
}>

type FetchedRouteInformation = Readonly<{
    status: 'FETCHED'
    totalDistance: number
    totalTime: number
}>

type FetchFailedRouteInformation = Readonly<{
    status: 'FAILED'
}>

type FetchingRouteInformation = Readonly<{
    status: 'FETCHING'
    fetchProgress: number
}>

export type RouteInformation = FetchedRouteInformation
    | FetchFailedRouteInformation
    | FetchingRouteInformation
    | NoRouteInformation

export const routeInformation = (state: AppState): RouteInformation => {
    const waypointCount = state.waypoints.length

    if (waypointCount < 2) return { status: 'NO_ROUTE' }

    const fetchedPlaceResults = state.waypoints.map(waypoint => state.fetchedPlaces.get(waypoint.address))
    const fetchedPlacesSuccessCount =
        fetchedPlaceResults.filter(result => !!result && result.status === 'SUCCESS').length
    const fetchedPlacesFailedCount = fetchedPlaceResults.filter(result => !!result && result.status === 'FAILED').length
    if (fetchedPlacesFailedCount) return { status: 'FAILED' }

    const fetchedRouteResults = range(0, waypointCount - 1).map(i => {
        const origin = state.waypoints[i].address
        const destination = state.waypoints[i + 1].address

        const routesFromOrigin = state.fetchedRoutes.get(origin)
        if (!routesFromOrigin) return undefined

        const route = routesFromOrigin.get(destination)
        return route
    })
    const fetchedRoutesSuccessCount =
        fetchedRouteResults.filter(result => !!result && result.status === 'SUCCESS').length
    const fetchedRoutesFailedCount = fetchedRouteResults.filter(result => !!result && result.status === 'FAILED').length
    if (fetchedRoutesFailedCount) return { status: 'FAILED' }

    const [totalDistance, totalTime] = fetchedRouteResults
        .filter((result): result is FetchSuccess<mapkit.Route> => !!result && result.status === 'SUCCESS')
        .map(result => result.result)
        .reduce(([cumulativeDistance, cumulativeTime], route) =>
            [cumulativeDistance + route.distance, cumulativeTime + route.expectedTravelTime], [0, 0])

    const completedItems = fetchedPlacesSuccessCount + fetchedRoutesSuccessCount
    const totalItems = 2 * waypointCount - 1

    return completedItems === totalItems
        ? {
            status: 'FETCHED',
            totalDistance,
            totalTime,
        }
        : {
            status: 'FETCHING',
            fetchProgress: completedItems / totalItems,
        }
}
