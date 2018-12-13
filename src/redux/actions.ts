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
import AppState, { Waypoint } from './state';
import { ExtraArgument } from './store';
import { range } from 'lodash'
import { parseAddress as parseAddress, isValidAddress } from './validator'
import { v4 as uuidv4 } from 'uuid'

type ThunkResult<R = void> = ThunkAction<R, AppState, ExtraArgument, AppAction>

const lookupAddress = (geocoder: mapkit.Geocoder, address: string) => new Promise<mapkit.Place>((resolve, reject) => {
    geocoder.lookup(address, (error, data) => {
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

export const lookupAddresses = (addresses: string[]): ThunkResult => (dispatch, getState, { geocoder, directions }) => {
    const places = addresses.map(async address => {
        const place = getState().fetchedPlaces[address]
        if (place) return place

        try {
            const place = await lookupAddress(geocoder, address)
            dispatch(lookupSuccess(address, place))
            return place
        } catch {
            dispatch(lookupFailure(address))
        }
    })

    if (addresses.length === 0) return

    const routes = range(0, addresses.length - 1).map(async index => {
        const origin = {
            address: addresses[index],
            place: await places[index]
        }

        const destination = {
            address: addresses[index + 1],
            place: await places[index + 1]
        }

        return new Promise<mapkit.Route>((resolve, reject) => {
            if (!origin.place) {
                routeFailure(origin.address, destination.address)
                reject('Origin is undefined')
                return
            }
            if (!destination.place) {
                routeFailure(origin.address, destination.address)
                reject('Destination is undefined')
                return
            }

            directions.route({
                origin: origin.place,
                destination: destination.place
            }, (error, data) => {
                if (error) {
                    dispatch(routeFailure(origin.address, destination.address))
                    reject(error)
                    return
                }

                const route = data.routes[0]
                if (!route) {
                    dispatch(routeFailure(origin.address, destination.address))
                    reject()
                    return
                }

                resolve(route)
                dispatch(routeSuccess(origin.address, destination.address, route))
            })
        })
    })
}

const setWaypointsAndLookup = (waypoints: Waypoint[]): ThunkResult => dispatch => {
    dispatch(setWaypoints(waypoints))
    dispatch(lookupAddresses(waypoints.map(w => w.address)))
}

const createWaypointFromAddress = (address: string): Waypoint => {
    uuidv4

    return {
        address,
        uuid: uuidv4()
    }
}

export const replaceWaypoints = (addresses: string[]): ThunkResult => dispatch => {
    dispatch(setWaypoints(addresses.map(createWaypointFromAddress)))
    dispatch(lookupAddresses(addresses))
}

export const setWaypoint = (index: number, address: string): ThunkResult => (dispatch, getState) => {
    const waypoints = [...getState().waypoints]
    waypoints[index] = { ...waypoints[index], address }
    dispatch(setWaypointsAndLookup(waypoints))
}

export const addWaypoint = (address: string): ThunkResult<string | null> => (dispatch, getState) => {
    if (!isValidAddress(address)) return null

    const parsedAddress = parseAddress(address)
    const waypoint = createWaypointFromAddress(parsedAddress)
    dispatch(setWaypointsAndLookup([...getState().waypoints, waypoint]))

    return parsedAddress
}

export const deleteWaypoint = (index: number): ThunkResult => (dispatch, getState) => {
    const waypoints = [...getState().waypoints]
    waypoints.splice(index, 1)
    dispatch(setWaypointsAndLookup(waypoints))
}

export const moveWaypoint = (sourceIndex: number, destinationIndex: number): ThunkResult => (dispatch, getState) => {
    const waypoints = [...getState().waypoints]
    const [removedWaypoint] = waypoints.splice(sourceIndex, 1)
    waypoints.splice(destinationIndex, 0, removedWaypoint)
    dispatch(setWaypointsAndLookup(waypoints))
}

export const reverseWaypoints = (): ThunkResult => (dispatch, getState) => {
    dispatch(setWaypointsAndLookup([...getState().waypoints].reverse()))
}

const setWaypoints = (waypoints: Waypoint[]): SetWaypointsAction => ({
    type: 'SET_WAYPOINTS',
    waypoints
})

const lookupSuccess = (address: string, place: mapkit.Place): LookupSuccessAction => ({
    type: 'LOOKUP_SUCCESS',
    address: address,
    place
})

const lookupFailure = (address: string): LookupFailureAction => ({
    type: 'LOOKUP_FAILURE',
    address: address
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