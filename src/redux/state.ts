export type Address = string

export interface Waypoint {
    address: Address
    isGeocoded?: boolean
}

export interface RouteInformation {
    distance: number
    time: number
}

export default interface AppState {
    waypoints: Waypoint[]
    foundRoutes: []
    routeInformation?: RouteInformation
    autofitIsEnabled: boolean
    mapIsUpdating: boolean
}