import AppAction from './actionTypes'
import AppState, { Waypoint } from './state'

const initialState: AppState = {
    waypoints: [],
    fetchedPlaces: {},
    fetchedRoutes: {},
    autofitIsEnabled: true
}

export default (state: AppState = initialState, action: AppAction): AppState => {
    switch (action.type) {
        case 'SET_WAYPOINTS':
            return setWaypoints(state, action.waypoints)
        case 'LOOKUP_SUCCESS':
            return lookupSuccess(state, action.address, action.place)
        case 'LOOKUP_FAILURE':
            return lookupFailure(state, action.address)
        case 'ROUTE_SUCCESS':
            return routeSuccess(state, action.origin, action.destination, action.route)
        case 'ROUTE_FAILURE':
            return routeFailure(state, action.origin, action.destination)
        case 'ENABLE_AUTOFIT':
            return enableAutofit(state)
        case 'DISABLE_AUTOFIT':
            return disableAutofit(state)
    }

    return state
};

export const fetchedRoutesKey = (origin: string, destination: string) => {
    return origin + '|' + destination
}

const setWaypoints = (state: AppState, waypoints: Waypoint[]): AppState => {
    return { ...state, waypoints }
}

const lookupSuccess = (state: AppState, address: string, place: mapkit.Place): AppState => ({
    ...state,
    fetchedPlaces: {
        ...state.fetchedPlaces,
        [address]: place
    }
})

const lookupFailure = (state: AppState, address: string): AppState => ({
    ...state,
    fetchedPlaces: {
        ...state.fetchedPlaces,
        [address]: null
    }
})

const routeSuccess = (state: AppState, origin: string, destination: string, route: mapkit.Route): AppState => ({
    ...state,
    fetchedRoutes: {
        ...state.fetchedRoutes,
        [fetchedRoutesKey(origin, destination)]: route
    }
})

const routeFailure = (state: AppState, origin: string, destination: string): AppState => ({
    ...state,
    fetchedRoutes: {
        ...state.fetchedRoutes,
        [fetchedRoutesKey(origin, destination)]: null
    }
})

const enableAutofit = (state: AppState) => ({
    ...state,
    autofitIsEnabled: true
})

const disableAutofit = (state: AppState) => ({
    ...state,
    autofitIsEnabled: false
})