import { Waypoint } from "./state";

export type SetWaypointsAction = {
    type: 'SET_WAYPOINTS'
    waypoints: Waypoint[]
}

export type LookupSuccessAction = {
    type: 'LOOKUP_SUCCESS',
    address: string,
    place: mapkit.Place
}

export type LookupFailureAction = {
    type: 'LOOKUP_FAILURE',
    address: string
}

export type RouteSuccessAction = {
    type: 'ROUTE_SUCCESS',
    origin: string,
    destination: string,
    route: mapkit.Route
}

export type RouteFailureAction = {
    type: 'ROUTE_FAILURE',
    origin: string,
    destination: string
}

export type EnableAutofitAction = {
    type: 'ENABLE_AUTOFIT'
}

export type DisableAutofitAction = {
    type: 'DISABLE_AUTOFIT'
}

type WaypointsAction = SetWaypointsAction
type LookupAction = LookupSuccessAction | LookupFailureAction
type RouteAction = RouteSuccessAction | RouteFailureAction
type AutofitAction = EnableAutofitAction | DisableAutofitAction

type AppAction = WaypointsAction | LookupAction | RouteAction | AutofitAction
export default AppAction