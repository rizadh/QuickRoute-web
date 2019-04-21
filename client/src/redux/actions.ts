import { v4 as uuidv4 } from 'uuid'
import {
    AddWaypointAction,
    DeleteWaypointAction,
    DisableAutofitAction,
    EnableAutofitAction,
    FetchPlaceAction,
    FetchPlaceFailedAction,
    FetchPlaceInProgressAction,
    FetchPlaceSuccessAction,
    FetchRouteAction,
    FetchRouteFailedAction,
    FetchRouteInProgressAction,
    FetchRouteSuccessAction,
    MoveSelectedWaypointsAction,
    MoveWaypointAction,
    MuteMapAction,
    ReplaceWaypointsAction,
    ReverseWaypointsAction,
    SelectWaypointAction,
    SelectWaypointRangeAction,
    SetAddressAction,
    ToggleWaypointSelectionAction,
    UnmuteMapAction,
} from './actionTypes'
import { Waypoint } from './state'

const createWaypointFromAddress = (address: string): Waypoint => ({
    address,
    uuid: uuidv4(),
    isSelected: false,
})

export const createAndReplaceWaypoints = (addresses: ReadonlyArray<string>): ReplaceWaypointsAction =>
    replaceWaypoints(addresses.map(createWaypointFromAddress))

export const replaceWaypoints = (waypoints: ReadonlyArray<Waypoint>): ReplaceWaypointsAction => ({
    type: 'REPLACE_WAYPOINTS',
    waypoints,
})

export const createWaypoint = (address: string): AddWaypointAction => addWaypoint(createWaypointFromAddress(address))

export const addWaypoint = (waypoint: Waypoint): AddWaypointAction => ({
    type: 'ADD_WAYPOINT',
    waypoint,
})

export const deleteWaypoint = (index: number): DeleteWaypointAction => ({
    type: 'DELETE_WAYPOINT',
    index,
})

export const moveWaypoint = (sourceIndex: number, targetIndex: number): MoveWaypointAction => ({
    type: 'MOVE_WAYPOINT',
    sourceIndex,
    targetIndex,
})

export const moveSelectedWaypoints = (index: number): MoveSelectedWaypointsAction => ({
    type: 'MOVE_SELECTED_WAYPOINTS',
    index,
})

export const setAddress = (index: number, address: string): SetAddressAction => ({
    type: 'SET_ADDRESS',
    index,
    address,
})

export const selectWaypoint = (index: number): SelectWaypointAction => ({
    type: 'SELECT_WAYPOINT',
    index,
})

export const toggleWaypointSelection = (index: number): ToggleWaypointSelectionAction => ({
    type: 'TOGGLE_WAYPOINT_SELECTION',
    index,
})

export const selectWaypointRange = (index: number): SelectWaypointRangeAction => ({
    type: 'SELECT_WAYPOINT_RANGE',
    index,
})

export const reverseWaypoints = (): ReverseWaypointsAction => ({
    type: 'REVERSE_WAYPOINTS',
})

export const fetchPlace = (address: string): FetchPlaceAction => ({
    type: 'FETCH_PLACE',
    address,
})

export const fetchPlaceInProgress = (address: string, fetchId: number): FetchPlaceInProgressAction => ({
    type: 'FETCH_PLACE_IN_PROGRESS',
    address,
    fetchId,
})

export const fetchPlaceSuccess = (address: string, place: mapkit.Place): FetchPlaceSuccessAction => ({
    type: 'FETCH_PLACE_SUCCESS',
    address,
    place,
})

export const fetchPlaceFailed = (address: string, error: Error): FetchPlaceFailedAction => ({
    type: 'FETCH_PLACE_FAILED',
    address,
    error,
})

export const fetchRoute = (origin: string, destination: string): FetchRouteAction => ({
    type: 'FETCH_ROUTE',
    origin,
    destination,
})

export const fetchRouteInProgress = (
    origin: string,
    destination: string,
    fetchId: number,
): FetchRouteInProgressAction => ({
    type: 'FETCH_ROUTE_IN_PROGRESS',
    origin,
    destination,
    fetchId,
})

export const fetchRouteSuccess = (
    origin: string,
    destination: string,
    route: mapkit.Route,
): FetchRouteSuccessAction => ({
    type: 'FETCH_ROUTE_SUCCESS',
    origin,
    destination,
    route,
})

export const fetchRouteFailed = (origin: string, destination: string, error: Error): FetchRouteFailedAction => ({
    type: 'FETCH_ROUTE_FAILED',
    origin,
    destination,
    error,
})

export const enableAutofit = (): EnableAutofitAction => ({
    type: 'ENABLE_AUTOFIT',
})

export const disableAutofit = (): DisableAutofitAction => ({
    type: 'DISABLE_AUTOFIT',
})

export const muteMap = (): MuteMapAction => ({
    type: 'MUTE_MAP',
})

export const unmuteMap = (): UnmuteMapAction => ({
    type: 'UNMUTE_MAP',
})
