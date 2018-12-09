import AppAction from './actionTypes'
import AppState from './state'
import { isEqual } from 'lodash'

const initialState: AppState = {
    waypoints: [],
    foundRoutes: [],
    autofitIsEnabled: true,
    mapIsUpdating: false,
}

export default (state: AppState | undefined, action: AppAction): AppState => {
    if (!state) return initialState

    switch (action.type) {
        case 'SET_ADDRESS':
            if (action.address == state.waypoints[action.index].address) return state

            return {
                ...state,
                waypoints: state.waypoints.map((waypoint, index) =>
                    index === action.index
                        ? {
                            address: action.address
                        }
                        : waypoint
                )
            }
        case 'REPLACE_ADDRESSES':
            if (isEqual(
                state.waypoints.map(w => w.address),
                action.addresses
            )) return state

            return {
                ...state,
                routeInformation: undefined,
                waypoints: action.addresses.map(address => ({
                    address
                })),
            }
        case 'MOVE_WAYPOINT_UP':
            if (action.index === 0) return state

            const waypointsMovedUp = [...state.waypoints]
            waypointsMovedUp.splice(
                action.index - 1,
                2,
                state.waypoints[action.index],
                state.waypoints[action.index - 1]
            )

            return {
                ...state,
                waypoints: waypointsMovedUp
            }
        case 'MOVE_WAYPOINT_DOWN':
            if (action.index >= state.waypoints.length - 1) return state

            const waypointsMovedDown = [...state.waypoints]
            waypointsMovedDown.splice(
                action.index,
                2,
                state.waypoints[action.index + 1],
                state.waypoints[action.index]
            )

            return {
                ...state,
                waypoints: waypointsMovedDown
            }
        case 'REVERSE_WAYPOINTS':
            return {
                ...state,
                waypoints: state.waypoints.slice().reverse(),
            }
        case 'GEOCODE_SUCCESS':
            return {
                ...state,
                waypoints: state.waypoints.map((waypoint, waypointIndex) => {
                    return waypointIndex == action.waypointIndex ? {
                        address: waypoint.address,
                        isGeocoded: true
                    } : waypoint
                })
            }
        case 'GEOCODE_FAILURE':
            return {
                ...state,
                waypoints: state.waypoints.map((waypoint, waypointIndex) => {
                    return waypointIndex == action.waypointIndex ? {
                        address: waypoint.address,
                        isGeocoded: false
                    } : waypoint
                })
            }
        case 'SET_ROUTE_INFORMATION':
            return {
                ...state,
                routeInformation: action.routeInformation
            }
        case 'ENABLE_AUTOFIT':
            return {
                ...state,
                autofitIsEnabled: true
            }
        case 'DISABLE_AUTOFIT':
            return {
                ...state,
                autofitIsEnabled: false
            }
        case 'BEGIN_MAP_UPDATE':
            return {
                ...state,
                mapIsUpdating: true
            }
        case 'FINISH_MAP_UPDATE':
            return {
                ...state,
                mapIsUpdating: false
            }
    }
};