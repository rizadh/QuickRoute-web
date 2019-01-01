import {
    AppAction,
    AddWaypointAction,
    ReplaceWaypointsAction,
    DeleteWaypointAction,
    MoveWaypointAction,
    SetAddressAction,
    FetchPlaceInProgressAction,
    FetchPlaceSuccessAction,
    FetchPlaceFailedAction,
    FetchRouteInProgressAction,
    FetchRouteSuccessAction,
    FetchRouteFailedAction,
    ReverseWaypointsAction
} from './actionTypes'
import { AppState, fetchInProgress, fetchSuccess, fetchFailed } from './state'

const initialState: AppState = {
    waypoints: [],
    fetchedPlaces: new Map(),
    fetchedRoutes: new Map(),
    autofitIsEnabled: true
}

export default (state: AppState = initialState, action: AppAction): AppState => {
    switch (action.type) {
        case 'REPLACE_WAYPOINTS':
            return replaceWaypoints(state, action)
        case 'ADD_WAYPOINT':
            return addWaypoint(state, action)
        case 'DELETE_WAYPOINT':
            return deleteWaypoint(state, action)
        case 'MOVE_WAYPOINT':
            return moveWaypoint(state, action)
        case 'REVERSE_WAYPOINTS':
            return reverseWaypoints(state, action)
        case 'SET_ADDRESS':
            return setAddress(state, action)
        case 'FETCH_PLACE_IN_PROGRESS':
            return fetchPlaceInProgress(state, action)
        case 'FETCH_PLACE_SUCCESS':
            return fetchPlaceSuccess(state, action)
        case 'FETCH_PLACE_FAILED':
            return fetchPlaceFailed(state, action)
        case 'FETCH_ROUTE_IN_PROGRESS':
            return fetchRouteInProgress(state, action)
        case 'FETCH_ROUTE_SUCCESS':
            return fetchRouteSuccess(state, action)
        case 'FETCH_ROUTE_FAILED':
            return fetchRouteFailed(state, action)
        case 'ENABLE_AUTOFIT':
            return { ...state, autofitIsEnabled: true }
        case 'DISABLE_AUTOFIT':
            return { ...state, autofitIsEnabled: false }
    }

    return state
}

type Reducer<T> = (state: AppState, action: T) => AppState

const replaceWaypoints: Reducer<ReplaceWaypointsAction> = (state, { waypoints }) => {
    return { ...state, waypoints }
}

const addWaypoint: Reducer<AddWaypointAction> = (state, { waypoint }) => {
    return { ...state, waypoints: [...state.waypoints, waypoint] }
}

const deleteWaypoint: Reducer<DeleteWaypointAction> = (state, { index }) => {
    const waypoints = [...state.waypoints]
    waypoints.splice(index, 1)
    return { ...state, waypoints }
}

const moveWaypoint: Reducer<MoveWaypointAction> = (state, { sourceIndex, targetIndex }) => {
    const waypoints = [...state.waypoints]
    const [removed] = waypoints.splice(sourceIndex, 1)
    waypoints.splice(targetIndex, 0, removed)
    return { ...state, waypoints }
}

const reverseWaypoints: Reducer<ReverseWaypointsAction> = state => {
    return { ...state, waypoints: [...state.waypoints].reverse() }
}

const setAddress: Reducer<SetAddressAction> = (state, { index, address }) => {
    const waypoints = [...state.waypoints]
    waypoints.splice(index, 1, {
        ...state.waypoints[index],
        address,
    })
    return { ...state, waypoints }
}

const fetchPlaceInProgress: Reducer<FetchPlaceInProgressAction> = (state, { address, fetchId }) => {
    return {
        ...state,
        fetchedPlaces: new Map(state.fetchedPlaces).set(address, fetchInProgress(fetchId))
    }
}

const fetchPlaceSuccess: Reducer<FetchPlaceSuccessAction> = (state, { address, place }) => {
    return {
        ...state,
        fetchedPlaces: new Map(state.fetchedPlaces).set(address, fetchSuccess(place))
    }
}

const fetchPlaceFailed: Reducer<FetchPlaceFailedAction> = (state, { address, error }) => {
    return {
        ...state,
        fetchedPlaces: new Map(state.fetchedPlaces).set(address, fetchFailed(error)),
    }
}

const fetchRouteInProgress: Reducer<FetchRouteInProgressAction> = (state, { origin, destination, fetchId }) => {
    return {
        ...state,
        fetchedRoutes: new Map(state.fetchedRoutes).set(
            origin,
            new Map(state.fetchedRoutes.get(origin) || []).set(destination, fetchInProgress(fetchId))
        )
    }
}

const fetchRouteSuccess: Reducer<FetchRouteSuccessAction> = (state, { origin, destination, route }) => {
    return {
        ...state,
        fetchedRoutes: new Map(state.fetchedRoutes).set(
            origin,
            new Map(state.fetchedRoutes.get(origin) || []).set(destination, fetchSuccess(route))
        )
    }
}

const fetchRouteFailed: Reducer<FetchRouteFailedAction> = (state, { origin, destination, error }) => {
    return {
        ...state,
        fetchedRoutes: new Map(state.fetchedRoutes).set(
            origin,
            new Map(state.fetchedRoutes.get(origin) || []).set(destination, fetchFailed(error))
        )
    }
}