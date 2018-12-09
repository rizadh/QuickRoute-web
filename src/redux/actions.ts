import { Waypoint, RouteInformation, Address } from "./state";
import {
    GeocodeSuccessAction,
    GeocodeFailureAction,
    ReplaceAddressesAction,
    SetAddressAction,
    SetRouteInformationAction,
    ReverseWaypointsAction,
    EnableAutofitAction,
    DisableAutofitAction,
    BeginMapUpdateAction,
    FinishMapUpdateAction,
    MoveWaypointUpAction,
    MoveWaypointDownAction,
    RouteFoundAction,
    RouteNotFoundAction
} from './actionTypes'

export const replaceAddresses = (addresses: Address[]): ReplaceAddressesAction => ({
    type: 'REPLACE_ADDRESSES',
    addresses
})

export const setAddress = (index: number, address: Address): SetAddressAction => ({
    type: 'SET_ADDRESS',
    index,
    address
})

export const moveWaypointUp = (index: number): MoveWaypointUpAction => ({
    type: 'MOVE_WAYPOINT_UP',
    index
})

export const moveWaypointDown = (index: number): MoveWaypointDownAction => ({
    type: 'MOVE_WAYPOINT_DOWN',
    index
})

export const reverseWaypoints = (): ReverseWaypointsAction => ({
    type: 'REVERSE_WAYPOINTS'
})

export const geocodeSuccess = (waypointIndex: number): GeocodeSuccessAction => ({
    type: 'GEOCODE_SUCCESS',
    waypointIndex
})

export const geocodeFailure = (waypointIndex: number): GeocodeFailureAction => ({
    type: 'GEOCODE_FAILURE',
    waypointIndex
})

export const routeFound = (routeIndex: number): RouteFoundAction => ({
    type: 'ROUTE_FOUND',
    routeIndex
})

export const routeNotFound = (routeIndex: number): RouteNotFoundAction => ({
    type: 'ROUTE_NOT_FOUND',
    routeIndex
})

export const setRouteInformation = (routeInformation: RouteInformation): SetRouteInformationAction => ({
    type: 'SET_ROUTE_INFORMATION',
    routeInformation
})

export const enableAutofit = (): EnableAutofitAction => ({
    type: 'ENABLE_AUTOFIT'
})

export const disableAutofit = (): DisableAutofitAction => ({
    type: 'DISABLE_AUTOFIT'
})

export const beginMapUpdate = (): BeginMapUpdateAction => ({
    type: 'BEGIN_MAP_UPDATE'
})

export const finishMapUpdate = (): FinishMapUpdateAction => ({
    type: 'FINISH_MAP_UPDATE'
})