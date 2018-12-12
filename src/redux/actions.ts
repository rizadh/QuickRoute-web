import AppAction, {
    SetWaypointsAction,
    LookupSuccessAction,
    LookupFailureAction,
    RouteSuccessAction,
    RouteFailureAction,
    EnableAutofitAction,
    DisableAutofitAction
} from './actionTypes'
import { ThunkAction } from 'redux-thunk';
import AppState from './state';
import { ExtraArgument } from './store';
import { range } from 'lodash'
import { parseWaypoint } from './validator'

type ThunkResult<R = void> = ThunkAction<R, AppState, ExtraArgument, AppAction>

const lookupWaypoint = (geocoder: mapkit.Geocoder, waypoint: string) => new Promise<mapkit.Place>((resolve, reject) => {
    geocoder.lookup(waypoint, (error, data) => {
        if (error) {
            reject(error)
            return
        }

        const place = data.results[0]

        if (!place) {
            reject()
            return
        }

        resolve(place)
    })
})

export const setAndLookupWaypoints = (waypoints: string[]): ThunkResult => (dispatch, getState, { geocoder, directions }) => {
    dispatch(setWaypoints(waypoints))

    const places = waypoints.map(async waypoint => {
        const place = getState().fetchedPlaces[waypoint]
        if (place) return place

        try {
            const place = await lookupWaypoint(geocoder, waypoint)
            dispatch(lookupSuccess(waypoint, place))
            return place
        } catch {
            dispatch(lookupFailure(waypoint))
        }
    })

    if (waypoints.length === 0) return

    const routes = range(0, waypoints.length - 1).map(async index => {
        const origin = {
            waypoint: waypoints[index],
            place: await places[index]
        }

        const destination = {
            waypoint: waypoints[index + 1],
            place: await places[index + 1]
        }

        return new Promise<mapkit.Route>((resolve, reject) => {
            if (!origin.place) {
                routeFailure(origin.waypoint, destination.waypoint)
                reject('Origin is undefined')
                return
            }
            if (!destination.place) {
                routeFailure(origin.waypoint, destination.waypoint)
                reject('Destination is undefined')
                return
            }

            directions.route({
                origin: origin.place,
                destination: destination.place
            }, (error, data) => {
                if (error) {
                    dispatch(routeFailure(origin.waypoint, destination.waypoint))
                    reject(error)
                    return
                }

                const route = data.routes[0]
                if (!route) {
                    dispatch(routeFailure(origin.waypoint, destination.waypoint))
                    reject()
                    return
                }

                resolve(route)
                dispatch(routeSuccess(origin.waypoint, destination.waypoint, route))
            })
        })
    })
}

export const setWaypoint = (index: number, waypoint: string): ThunkResult => (dispatch, getState) => {
    const waypoints = [...getState().waypoints]
    waypoints[index] = waypoint
    dispatch(setAndLookupWaypoints(waypoints))
}

export const addWaypoint = (waypoint: string): ThunkResult<string | null> => (dispatch, getState) => {
    const parsedWaypoint = parseWaypoint(waypoint)
    if (parsedWaypoint)
        dispatch(setAndLookupWaypoints([...getState().waypoints, parsedWaypoint]))

    return parsedWaypoint
}

export const deleteWaypoint = (index: number): ThunkResult => (dispatch, getState) => {
    const waypoints = [...getState().waypoints]
    waypoints.splice(index, 1)
    dispatch(setAndLookupWaypoints(waypoints))
}

export const moveWaypoint = (sourceIndex: number, destinationIndex: number): ThunkResult => (dispatch, getState) => {
    const waypoints = [...getState().waypoints]
    const [removedWaypoint] = waypoints.splice(sourceIndex, 1)
    waypoints.splice(destinationIndex, 0, removedWaypoint)
    dispatch(setAndLookupWaypoints(waypoints))
}

export const moveWaypointUp = (index: number): ThunkResult => (dispatch, getState) => {
    if (index === 0) return

    const waypoints = [...getState().waypoints]
    waypoints.splice(index - 1, 2, waypoints[index], waypoints[index - 1])
    dispatch(setAndLookupWaypoints(waypoints))
}

export const moveWaypointDown = (index: number): ThunkResult => (dispatch, getState) => {
    const waypoints = [...getState().waypoints]

    if (index === waypoints.length - 1) return

    waypoints.splice(index, 2, waypoints[index + 1], waypoints[index])
    dispatch(setAndLookupWaypoints(waypoints))
}

export const reverseWaypoints = (): ThunkResult => (dispatch, getState) => {
    dispatch(setAndLookupWaypoints([...getState().waypoints].reverse()))
}

const setWaypoints = (waypoints: string[]): SetWaypointsAction => ({
    type: 'SET_WAYPOINTS',
    waypoints
})

const lookupSuccess = (waypoint: string, place: mapkit.Place): LookupSuccessAction => ({
    type: 'LOOKUP_SUCCESS',
    waypoint,
    place
})

const lookupFailure = (waypoint: string): LookupFailureAction => ({
    type: 'LOOKUP_FAILURE',
    waypoint
})

const routeSuccess = (origin: string, destination: string, route: mapkit.Route): RouteSuccessAction => ({
    type: 'ROUTE_SUCCESS',
    origin,
    destination,
    route
})

const routeFailure = (origin: string, destination: string): RouteFailureAction => ({
    type: 'ROUTE_FAILURE',
    origin,
    destination
})

export const enableAutofit = (): EnableAutofitAction => ({
    type: 'ENABLE_AUTOFIT',
})

export const disableAutofit = (): DisableAutofitAction => ({
    type: 'DISABLE_AUTOFIT'
})