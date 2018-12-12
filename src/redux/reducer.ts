import AppAction from './actionTypes'
import AppState from './state'
import WaypointEditor from '../components/WaypointEditor';

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
            return lookupSuccess(state, action.waypoint, action.place)
        case 'LOOKUP_FAILURE':
            return lookupFailure(state, action.waypoint)
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

const setWaypoints = (state: AppState, waypoints: string[]): AppState => {
    return { ...state, waypoints }
}

const lookupSuccess = (state: AppState, waypoint: string, place: mapkit.Place): AppState => ({
    ...state,
    fetchedPlaces: {
        ...state.fetchedPlaces,
        [waypoint]: place
    }
})

const lookupFailure = (state: AppState, waypoint: string): AppState => ({
    ...state,
    fetchedPlaces: {
        ...state.fetchedPlaces,
        [waypoint]: null
    }
})

const routeSuccess = (state: AppState, origin: string, destination: string, route: mapkit.Route): AppState => ({
    ...state,
    fetchedRoutes: {
        ...state.fetchedRoutes,
        [origin + '|' + destination]: route
    }
})

const routeFailure = (state: AppState, origin: string, destination: string): AppState => ({
    ...state,
    fetchedRoutes: {
        ...state.fetchedRoutes,
        [origin + '|' + destination]: null
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