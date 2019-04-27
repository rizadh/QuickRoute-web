import { produce } from 'immer'
import { AppAction } from './actionTypes'
import { AppState, EditorPane, FetchedPlaces, FetchedRoutes } from './state'

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

type AppReducer = (state: AppState | undefined, action: AppAction) => AppState

export const reducer: AppReducer = (state: AppState = initialState, action: AppAction) =>
    produce<AppState>(state, draft => {
        switch (action.type) {
            // Basic Waypoint Manipulation
            case 'REPLACE_WAYPOINTS':
                return void (draft.waypoints = action.waypoints)
            case 'ADD_WAYPOINT':
                return void draft.waypoints.push(action.waypoint)
            case 'DELETE_WAYPOINT':
                return void draft.waypoints.splice(action.index, 1)
            case 'REVERSE_WAYPOINTS':
                return void draft.waypoints.reverse()
            case 'SET_ADDRESS':
                return void (draft.waypoints[action.index].address = action.address)
            // Waypoint Selection and DND
            case 'MOVE_WAYPOINT':
                if (action.sourceIndex === action.targetIndex) return

                const [removed] = draft.waypoints.splice(action.sourceIndex, 1)

                return void draft.waypoints.splice(action.targetIndex, 0, removed)
            case 'MOVE_SELECTED_WAYPOINTS':
                const lowestIndex = draft.waypoints.findIndex(waypoint => draft.selectedWaypoints.has(waypoint.uuid))
                const partitionIndex = lowestIndex < action.index ? action.index + 1 : action.index

                const waypointsBeforePartition = draft.waypoints.filter(
                    (waypoint, index) => !draft.selectedWaypoints.has(waypoint.uuid) && index < partitionIndex,
                )
                const movedWaypoints = draft.waypoints.filter(waypoint => draft.selectedWaypoints.has(waypoint.uuid))
                const waypointsAfterPartition = draft.waypoints.filter(
                    (waypoint, index) => !draft.selectedWaypoints.has(waypoint.uuid) && index >= partitionIndex,
                )

                return void (draft.waypoints = [
                    ...waypointsBeforePartition,
                    ...movedWaypoints,
                    ...waypointsAfterPartition,
                ])
            case 'SELECT_WAYPOINT': {
                const waypoint = draft.waypoints[action.index]

                const selectedCurrentWaypoints = draft.waypoints.filter(w => draft.selectedWaypoints.has(w.uuid))
                if (selectedCurrentWaypoints.length === 1 && draft.selectedWaypoints.has(waypoint.uuid)) {
                    // TODO: Can be cleared directly with Immer v4.0
                    draft.selectedWaypoints = new Set()
                } else {
                    draft.selectedWaypoints = new Set([waypoint.uuid])
                }

                return void (draft.lastSelectedWaypoint = draft.waypoints[action.index].uuid)
            }
            case 'TOGGLE_WAYPOINT_SELECTION': {
                // TODO: Can be set directly with Immer v4.0
                const newSelectedWaypoints = new Set<string>(draft.selectedWaypoints as Set<string>)

                const waypoint = draft.waypoints[action.index]

                if (draft.selectedWaypoints.has(waypoint.uuid)) {
                    newSelectedWaypoints.delete(waypoint.uuid)
                } else {
                    newSelectedWaypoints.add(waypoint.uuid)
                }

                draft.lastSelectedWaypoint = waypoint.uuid

                return void (draft.selectedWaypoints = newSelectedWaypoints)
            }
            case 'SELECT_WAYPOINT_RANGE': {
                // TODO: Can be set directly with Immer v4.0
                const newSelectedWaypoints = new Set<string>(draft.selectedWaypoints as Set<string>)

                const lastSelectedWaypointIndex = draft.waypoints.map(w => w.uuid).indexOf(draft.lastSelectedWaypoint)
                const lowerBound = Math.min(action.index, lastSelectedWaypointIndex)
                const upperBound = Math.max(action.index, lastSelectedWaypointIndex)

                for (let i = lowerBound; i < upperBound + 1; i++) {
                    newSelectedWaypoints.add(draft.waypoints[i].uuid)
                }

                return void (draft.selectedWaypoints = newSelectedWaypoints)
            }
            // Place Fetch
            case 'FETCH_PLACE_IN_PROGRESS':
                // TODO: Can be set directly with Immer v4.0
                return void (draft.fetchedPlaces = new Map(draft.fetchedPlaces as FetchedPlaces).set(action.address, {
                    status: 'IN_PROGRESS',
                    fetchId: action.fetchId,
                }))
            case 'FETCH_PLACE_SUCCESS':
                // TODO: Can be set directly with Immer v4.0
                return void (draft.fetchedPlaces = new Map(draft.fetchedPlaces as FetchedPlaces).set(action.address, {
                    status: 'SUCCESS',
                    result: action.place,
                }))
            case 'FETCH_PLACE_FAILED':
                // TODO: Can be set directly with Immer v4.0
                return void (draft.fetchedPlaces = new Map(draft.fetchedPlaces as FetchedPlaces).set(action.address, {
                    status: 'FAILED',
                    error: action.error,
                }))
            // Route Fetch
            case 'FETCH_ROUTE_IN_PROGRESS': {
                // TODO: Can be set directly with Immer v4.0
                const routesFromOrigin = new Map(draft.fetchedRoutes.get(action.origin) || [])
                draft.fetchedRoutes = new Map(draft.fetchedRoutes as FetchedRoutes).set(
                    action.origin,
                    routesFromOrigin,
                )

                return void routesFromOrigin.set(action.destination, {
                    status: 'IN_PROGRESS',
                    fetchId: action.fetchId,
                })
            }
            case 'FETCH_ROUTE_SUCCESS': {
                // TODO: Can be set directly with Immer v4.0
                const routesFromOrigin = new Map(draft.fetchedRoutes.get(action.origin) || [])
                draft.fetchedRoutes = new Map(draft.fetchedRoutes as FetchedRoutes).set(
                    action.origin,
                    routesFromOrigin,
                )

                return void routesFromOrigin.set(action.destination, {
                    status: 'SUCCESS',
                    result: action.route,
                })
            }
            case 'FETCH_ROUTE_FAILED': {
                // TODO: Can be set directly with Immer v4.0
                const routesFromOrigin = new Map(draft.fetchedRoutes.get(action.origin) || [])
                draft.fetchedRoutes = new Map(draft.fetchedRoutes as FetchedRoutes).set(
                    action.origin,
                    routesFromOrigin,
                )

                return void routesFromOrigin.set(action.destination, {
                    status: 'FAILED',
                    error: action.error,
                })
            }
            // Map Properties
            case 'ENABLE_AUTOFIT':
                return void (draft.autofitIsEnabled = true)
            case 'DISABLE_AUTOFIT':
                return void (draft.autofitIsEnabled = false)
            case 'USE_MUTED_MAP':
                return void (draft.mutedMapIsEnabled = true)
            case 'USE_REGULAR_MAP':
                return void (draft.mutedMapIsEnabled = false)
            // Editor
            case 'SET_EDITOR_PANE':
                // TODO: Improve error management
                if (draft.editorPane !== action.editorPane) delete draft.error

                return void (draft.editorPane = action.editorPane)
            // Editor Visibility
            case 'HIDE_EDITOR_PANE':
                return void (draft.editorIsHidden = true)
            case 'SHOW_EDITOR_PANE':
                return void (draft.editorIsHidden = false)
            // Waypoint Import
            case 'IMPORT_WAYPOINTS_IN_PROGRESS':
                return void (draft.importInProgress = true)
            case 'IMPORT_WAYPOINTS_SUCCESS':
                return void (draft.importInProgress = false)
            case 'IMPORT_WAYPOINTS_FAILED':
                // TODO: Improve error management
                draft.error = action.error

                return void (draft.importInProgress = false)
            // Route Optimization
            case 'OPTIMIZE_ROUTE_IN_PROGRESS':
                return void (draft.optimizationInProgress = true)
            case 'OPTIMIZE_ROUTE_SUCCESS':
                return void (draft.optimizationInProgress = true)
            case 'OPTIMIZE_ROUTE_FAILED':
                // TODO: Improve error management
                draft.error = action.error

                return void (draft.optimizationInProgress = false)
            // Error Handling
            case 'ERROR_OCCURED':
                return void (draft.error = action.error)
            case 'CLEAR_ERROR':
                return void delete draft.error
        }
    })
