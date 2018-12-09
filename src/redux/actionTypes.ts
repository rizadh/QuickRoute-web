import { Waypoint, Address, RouteInformation } from './state'

export interface ReplaceAddressesAction {
    type: 'REPLACE_ADDRESSES'
    addresses: Address[]
}

export interface SetAddressAction {
    type: 'SET_ADDRESS'
    index: number
    address: Address
}

export interface MoveWaypointUpAction {
    type: 'MOVE_WAYPOINT_UP'
    index: number
}

export interface MoveWaypointDownAction {
    type: 'MOVE_WAYPOINT_DOWN'
    index: number
}

export interface ReverseWaypointsAction {
    type: 'REVERSE_WAYPOINTS',
}

export interface GeocodeSuccessAction {
    type: 'GEOCODE_SUCCESS'
    waypointIndex: number
}

export interface GeocodeFailureAction {
    type: 'GEOCODE_FAILURE'
    waypointIndex: number
}

export interface RouteFoundAction {
    type: 'ROUTE_FOUND'
    routeIndex: number
}

export interface RouteNotFoundAction {
    type: 'ROUTE_NOT_FOUND'
    routeIndex: number
}

export interface SetRouteInformationAction {
    type: 'SET_ROUTE_INFORMATION',
    routeInformation: RouteInformation
}

export interface EnableAutofitAction {
    type: 'ENABLE_AUTOFIT'
}

export interface DisableAutofitAction {
    type: 'DISABLE_AUTOFIT'
}

export interface BeginMapUpdateAction {
    type: 'BEGIN_MAP_UPDATE'
}

export interface FinishMapUpdateAction {
    type: 'FINISH_MAP_UPDATE'
}

type AddressAction = SetAddressAction | ReplaceAddressesAction
type WaypointsAction = AddressAction | MoveWaypointUpAction | MoveWaypointDownAction | ReverseWaypointsAction
type GeocodeAction = GeocodeSuccessAction | GeocodeFailureAction
type RouteAction = RouteFoundAction | RouteNotFoundAction | SetRouteInformationAction
type AutofitAction = EnableAutofitAction | DisableAutofitAction
type MapUpdateAction = BeginMapUpdateAction | FinishMapUpdateAction

type AppAction = WaypointsAction | GeocodeAction | RouteAction | AutofitAction | MapUpdateAction
export default AppAction