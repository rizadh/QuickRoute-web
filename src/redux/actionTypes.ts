import { Waypoint } from "./state";

export type ReplaceWaypointsAction = Readonly<{
    type: 'REPLACE_WAYPOINTS'
    waypoints: ReadonlyArray<Waypoint>
}>

export type AddWaypointAction = Readonly<{
    type: 'ADD_WAYPOINT'
    waypoint: Waypoint
}>

export type DeleteWaypointAction = Readonly<{
    type: 'DELETE_WAYPOINT'
    index: number
}>

export type MoveWaypointAction = Readonly<{
    type: 'MOVE_WAYPOINT'
    sourceIndex: number
    targetIndex: number
}>

export type MoveWaypointsAction = Readonly<{
    type: 'MOVE_WAYPOINTS'
    sourceIndexes: ReadonlySet<number>
    targetIndex: number
}>

export type ReverseWaypointsAction = Readonly<{
    type: 'REVERSE_WAYPOINTS'
}>

export type SetAddressAction = Readonly<{
    type: 'SET_ADDRESS'
    index: number
    address: string
}>

export type FetchPlaceAction = Readonly<{
    type: 'FETCH_PLACE'
    address: string
}>

export type FetchPlaceInProgressAction = Readonly<{
    type: 'FETCH_PLACE_IN_PROGRESS'
    address: string
    fetchId: number
}>

export type FetchPlaceSuccessAction = Readonly<{
    type: 'FETCH_PLACE_SUCCESS'
    address: string
    place: mapkit.Place
}>

export type FetchPlaceFailedAction = Readonly<{
    type: 'FETCH_PLACE_FAILED'
    address: string
    error: Error
}>

export type FetchRouteAction = Readonly<{
    type: 'FETCH_ROUTE'
    origin: string
    destination: string
}>

export type FetchRouteInProgressAction = Readonly<{
    type: 'FETCH_ROUTE_IN_PROGRESS'
    origin: string
    destination: string
    fetchId: number
}>

export type FetchRouteSuccessAction = Readonly<{
    type: 'FETCH_ROUTE_SUCCESS'
    origin: string
    destination: string
    route: mapkit.Route
}>

export type FetchRouteFailedAction = Readonly<{
    type: 'FETCH_ROUTE_FAILED'
    origin: string
    destination: string
    error: Error
}>

export type EnableAutofitAction = Readonly<{
    type: 'ENABLE_AUTOFIT'
}>

export type DisableAutofitAction = Readonly<{
    type: 'DISABLE_AUTOFIT'
}>

export type AppAction = ReplaceWaypointsAction
    | AddWaypointAction | DeleteWaypointAction
    | MoveWaypointAction | MoveWaypointsAction |  ReverseWaypointsAction | SetAddressAction
    | FetchPlaceAction | FetchPlaceInProgressAction | FetchPlaceSuccessAction | FetchPlaceFailedAction
    | FetchRouteAction | FetchRouteInProgressAction | FetchRouteSuccessAction | FetchRouteFailedAction
    | EnableAutofitAction | DisableAutofitAction 