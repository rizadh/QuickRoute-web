import { v4 as uuidv4 } from 'uuid'
import { FetchedRoutes, RouteFetchResult, Waypoint } from './state'

export const createWaypointFromAddress = (address: string): Waypoint => ({
    address,
    uuid: uuidv4(),
})

export const getRoute = (
    fetchedRoutes: FetchedRoutes,
    origin: string,
    destination: string,
): RouteFetchResult | undefined => {
    const routesFromOrigin = fetchedRoutes.get(origin)
    return routesFromOrigin && routesFromOrigin.get(destination)
}
