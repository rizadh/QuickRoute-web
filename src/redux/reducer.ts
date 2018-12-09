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
                ),
                foundRoutes: new Array(state.waypoints.length - 1)
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
                foundRoutes: new Array(action.addresses.length - 1)
            }
        case 'MOVE_WAYPOINT_UP': {
            if (action.index === 0) return state

            const waypoints = [...state.waypoints]
            waypoints.splice(
                action.index - 1,
                2,
                state.waypoints[action.index],
                state.waypoints[action.index - 1]
            )

            return {
                ...state,
                waypoints: waypoints,
                foundRoutes: new Array(state.waypoints.length - 1)
            }
        }
        case 'MOVE_WAYPOINT_DOWN': {
            if (action.index >= state.waypoints.length - 1) return state

            const waypoints = [...state.waypoints]
            waypoints.splice(
                action.index,
                2,
                state.waypoints[action.index + 1],
                state.waypoints[action.index]
            )

            return {
                ...state,
                waypoints: waypoints,
                foundRoutes: new Array(state.waypoints.length - 1)
            }
        }
        case 'REVERSE_WAYPOINTS':
            return {
                ...state,
                waypoints: state.waypoints.slice().reverse(),
                foundRoutes: new Array(state.waypoints.length - 1)
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
        case 'GEOCODE_FAILURE': {
            return {
                ...state,
                waypoints: state.waypoints.map((waypoint, waypointIndex) => {
                    return waypointIndex == action.waypointIndex ? {
                        address: waypoint.address,
                        isGeocoded: false
                    } : waypoint
                })
            }
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
        case 'ROUTE_FOUND': {
            const foundRoutes = state.foundRoutes.slice()
            foundRoutes[action.routeIndex] = true

            return {
                ...state,
                foundRoutes
            }
        }
        case 'ROUTE_NOT_FOUND': {
            const foundRoutes = state.foundRoutes.slice()
            foundRoutes[action.routeIndex] = false

            return {
                ...state,
                foundRoutes
            }
        }
    }
};