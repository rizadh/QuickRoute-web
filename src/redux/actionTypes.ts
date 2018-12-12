export interface SetWaypointsAction {
    type: 'SET_WAYPOINTS'
    waypoints: string[]
}

export interface LookupSuccessAction {
    type: 'LOOKUP_SUCCESS',
    waypoint: string,
    place: mapkit.Place
}

export interface LookupFailureAction {
    type: 'LOOKUP_FAILURE',
    waypoint: string
}

export interface RouteSuccessAction {
    type: 'ROUTE_SUCCESS',
    origin: string,
    destination: string,
    route: mapkit.Route
}

export interface RouteFailureAction {
    type: 'ROUTE_FAILURE',
    origin: string,
    destination: string
}

export interface EnableAutofitAction {
    type: 'ENABLE_AUTOFIT'
}

export interface DisableAutofitAction {
    type: 'DISABLE_AUTOFIT'
}

type WaypointsAction = SetWaypointsAction
type LookupAction = LookupSuccessAction | LookupFailureAction
type RouteAction = RouteSuccessAction | RouteFailureAction
type AutofitAction = EnableAutofitAction | DisableAutofitAction

type AppAction = WaypointsAction | LookupAction | RouteAction | AutofitAction
export default AppAction