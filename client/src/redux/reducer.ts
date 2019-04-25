import { range } from 'lodash'
import { AppAction } from './actionTypes'
import { AppState, EditorPane } from './state'

export const initialState: AppState = {
    waypoints: [],
    lastSelectedWaypoint: '',
    selectedWaypoints: new Set(),
    fetchedPlaces: new Map(),
    fetchedRoutes: new Map(),
    autofitIsEnabled: true,
    mutedMapIsEnabled: false,
    editorPane: EditorPane.List,
    editorIsHidden: false,
    importInProgress: false,
    optimizationInProgress: false,
    error: undefined,
}

export default (state: AppState = initialState, action: AppAction): AppState => {
    switch (action.type) {
        // Basic Waypoint Manipulation
        case 'REPLACE_WAYPOINTS':
            return {
                ...state,
                waypoints: action.waypoints,
            }
        case 'ADD_WAYPOINT':
            return {
                ...state,
                waypoints: [...state.waypoints, action.waypoint],
            }
        case 'DELETE_WAYPOINT':
            return { ...state, waypoints: state.waypoints.filter((_, i) => action.index !== i) }
        case 'REVERSE_WAYPOINTS':
            return {
                ...state,
                waypoints: [...state.waypoints].reverse(),
            }
        case 'SET_ADDRESS':
            return {
                ...state,
                waypoints: state.waypoints.map((waypoint, waypointIndex) =>
                    waypointIndex === action.index ? { ...waypoint, address: action.address } : waypoint,
                ),
            }
        // Waypoint Selection and DND
        case 'MOVE_WAYPOINT': {
            if (action.sourceIndex === action.targetIndex) return state

            const waypoints = [...state.waypoints]
            const [removed] = waypoints.splice(action.sourceIndex, 1)
            waypoints.splice(action.targetIndex, 0, removed)
            return { ...state, waypoints }
        }
        case 'MOVE_SELECTED_WAYPOINTS': {
            const lowestIndex = state.waypoints.findIndex(waypoint => state.selectedWaypoints.has(waypoint.uuid))
            const partitionIndex = lowestIndex < action.index ? action.index + 1 : action.index

            const waypointsBeforePartition = state.waypoints.filter(
                (waypoint, index) => !state.selectedWaypoints.has(waypoint.uuid) && index < partitionIndex,
            )
            const movedWaypoints = state.waypoints.filter(waypoint => state.selectedWaypoints.has(waypoint.uuid))
            const waypointsAfterPartition = state.waypoints.filter(
                (waypoint, index) => !state.selectedWaypoints.has(waypoint.uuid) && index >= partitionIndex,
            )

            const waypoints = [...waypointsBeforePartition, ...movedWaypoints, ...waypointsAfterPartition]

            return { ...state, waypoints }
        }
        case 'SELECT_WAYPOINT': {
            const selectedCurrentWaypoints = state.waypoints.filter(w => state.selectedWaypoints.has(w.uuid))
            const waypoint = state.waypoints[action.index]

            if (selectedCurrentWaypoints.length === 1 && state.selectedWaypoints.has(waypoint.uuid)) {
                return { ...state, selectedWaypoints: new Set() }
            }

            return {
                ...state,
                selectedWaypoints: new Set([waypoint.uuid]),
                lastSelectedWaypoint: state.waypoints[action.index].uuid,
            }
        }
        case 'TOGGLE_WAYPOINT_SELECTION': {
            const waypoint = state.waypoints[action.index]
            const selectedWaypoints = new Set(state.selectedWaypoints)

            if (state.selectedWaypoints.has(waypoint.uuid)) {
                selectedWaypoints.delete(waypoint.uuid)
            } else {
                selectedWaypoints.add(waypoint.uuid)
            }

            return { ...state, selectedWaypoints, lastSelectedWaypoint: state.waypoints[action.index].uuid }
        }
        case 'SELECT_WAYPOINT_RANGE': {
            const lastSelectedWaypointIndex = state.waypoints.map(w => w.uuid).indexOf(state.lastSelectedWaypoint)
            const lowerBound = Math.min(action.index, lastSelectedWaypointIndex)
            const upperBound = Math.max(action.index, lastSelectedWaypointIndex)
            const selectedWaypoints = new Set(state.selectedWaypoints)

            range(lowerBound, upperBound + 1).forEach(i => selectedWaypoints.add(state.waypoints[i].uuid))

            return { ...state, selectedWaypoints }
        }
        // Place Fetch
        case 'FETCH_PLACE':
            return state
        case 'FETCH_PLACE_IN_PROGRESS':
            return {
                ...state,
                fetchedPlaces: new Map(state.fetchedPlaces).set(action.address, {
                    status: 'IN_PROGRESS',
                    fetchId: action.fetchId,
                }),
            }
        case 'FETCH_PLACE_SUCCESS':
            return {
                ...state,
                fetchedPlaces: new Map(state.fetchedPlaces).set(action.address, {
                    status: 'SUCCESS',
                    result: action.place,
                }),
            }
        case 'FETCH_PLACE_FAILED':
            return {
                ...state,
                fetchedPlaces: new Map(state.fetchedPlaces).set(action.address, {
                    status: 'FAILED',
                    error: action.error,
                }),
            }
        // Route Fetch
        case 'FETCH_ROUTE':
            return state
        case 'FETCH_ROUTE_IN_PROGRESS':
            return {
                ...state,
                fetchedRoutes: new Map(state.fetchedRoutes).set(
                    action.origin,
                    new Map(state.fetchedRoutes.get(action.origin) || []).set(action.destination, {
                        status: 'IN_PROGRESS',
                        fetchId: action.fetchId,
                    }),
                ),
            }
        case 'FETCH_ROUTE_SUCCESS':
            return {
                ...state,
                fetchedRoutes: new Map(state.fetchedRoutes).set(
                    action.origin,
                    new Map(state.fetchedRoutes.get(action.origin) || []).set(action.destination, {
                        status: 'SUCCESS',
                        result: action.route,
                    }),
                ),
            }
        case 'FETCH_ROUTE_FAILED':
            return {
                ...state,
                fetchedRoutes: new Map(state.fetchedRoutes).set(
                    action.origin,
                    new Map(state.fetchedRoutes.get(action.origin) || []).set(action.destination, {
                        status: 'FAILED',
                        error: action.error,
                    }),
                ),
            }
        // Map Properties
        case 'ENABLE_AUTOFIT':
            return { ...state, autofitIsEnabled: true }
        case 'DISABLE_AUTOFIT':
            return { ...state, autofitIsEnabled: false }
        case 'USE_MUTED_MAP':
            return { ...state, mutedMapIsEnabled: true }
        case 'USE_REGULAR_MAP':
            return { ...state, mutedMapIsEnabled: false }
        // Editor
        case 'SET_EDITOR_PANE':
            return {
                ...state,
                editorPane: action.editorPane,
                error: state.editorPane === action.editorPane ? state.error : undefined,
            }
        // Editor Visibility
        case 'HIDE_EDITOR_PANE':
            return { ...state, editorIsHidden: true }
        case 'SHOW_EDITOR_PANE':
            return { ...state, editorIsHidden: false }
        // Waypoint Import
        case 'IMPORT_WAYPOINTS':
            return state
        case 'IMPORT_WAYPOINTS_IN_PROGRESS':
            return { ...state, importInProgress: true }
        case 'IMPORT_WAYPOINTS_SUCCESS':
            return { ...state, importInProgress: false }
        case 'IMPORT_WAYPOINTS_FAILED':
            return { ...state, importInProgress: false, error: action.error }
        // Route Optimization
        case 'OPTIMIZE_ROUTE':
            return state
        case 'OPTIMIZE_ROUTE_IN_PROGRESS':
            return { ...state, optimizationInProgress: true }
        case 'OPTIMIZE_ROUTE_SUCCESS':
            return { ...state, optimizationInProgress: false }
        case 'OPTIMIZE_ROUTE_FAILED':
            return { ...state, optimizationInProgress: false, error: action.error }
        // Error Handling
        case 'ERROR_OCCURED':
            return { ...state, error: action.error }
        case 'CLEAR_ERROR':
            return { ...state, error: undefined }
        default:
            return state
    }
}
