import uuid from 'uuid/v4'
import { FetchedRoutes, RouteFetchResult, Waypoint } from './state'

export const createWaypointFromAddress = (address: string): Waypoint => ({
    address,
    uuid: uuid(),
})

export const getRoute = (
    fetchedRoutes: FetchedRoutes,
    origin: string,
    destination: string,
): RouteFetchResult | undefined => {
    const routesFromOrigin = fetchedRoutes.get(origin)
    return routesFromOrigin && routesFromOrigin.get(destination)
}
