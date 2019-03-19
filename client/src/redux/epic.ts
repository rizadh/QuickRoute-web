import { combineEpics, Epic, ofType } from 'redux-observable'
import { EMPTY, Observable, of, range } from 'rxjs'
import { filter, flatMap, map, mergeMap, take } from 'rxjs/operators'
import {
    fetchPlace,
    fetchPlaceFailed,
    fetchPlaceInProgress,
    fetchPlaceSuccess,
    fetchRoute,
    fetchRouteFailed,
    fetchRouteInProgress,
    fetchRouteSuccess
} from './actions'
import {
    AddWaypointAction,
    AppAction,
    DeleteWaypointAction,
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
    ReplaceWaypointsAction,
    ReverseWaypointsAction,
    SetAddressAction
} from './actionTypes'
import { AppState } from './state'

type AppEpic = Epic<AppAction, AppAction, AppState>

const geocoder = new mapkit.Geocoder({ getsUserLocation: true })
const directions = new mapkit.Directions()

type FetchPlaceResultAction = FetchPlaceInProgressAction | FetchPlaceSuccessAction | FetchPlaceFailedAction

const performLookup = (address: string) => new Observable<FetchPlaceResultAction>(observer => {
    const fetchId = geocoder.lookup(address, (error, data) => {
        if (error) {
            observer.next(fetchPlaceFailed(address, error))
            observer.complete()

            return
        }

        const place = data.results[0]

        if (!place) {
            observer.next(fetchPlaceFailed(address, new Error('No places returned')))
            observer.complete()

            return
        }

        observer.next(fetchPlaceSuccess(address, place))
        observer.complete()
    })

    observer.next(fetchPlaceInProgress(address, fetchId))

    return () => geocoder.cancel(fetchId)
})

type FetchRouteResultAction = FetchRouteInProgressAction | FetchRouteSuccessAction | FetchRouteFailedAction

const performRoute = (
    origin: { address: string, place: mapkit.Place },
    destination: { address: string, place: mapkit.Place },
) => new Observable<FetchRouteResultAction>(observer => {
    const fetchId = directions.route({ origin: origin.place, destination: destination.place }, (error, data) => {
        if (error) {
            observer.next(fetchRouteFailed(origin.address, destination.address, error))
            observer.complete()

            return
        }

        const route = data.routes[0]

        if (!route) {
            observer.next(fetchRouteFailed(origin.address, destination.address, new Error('No places returned')))
            observer.complete()

            return
        }

        observer.next(fetchRouteSuccess(origin.address, destination.address, route))
        observer.complete()
    })

    observer.next(fetchRouteInProgress(origin.address, destination.address, fetchId))

    return () => directions.cancel(fetchId)
})

const replaceWaypointsEpic: AppEpic = combineEpics(
    action$ => action$.pipe(
        ofType<AppAction, ReplaceWaypointsAction>('REPLACE_WAYPOINTS'),
        flatMap(({ waypoints }) => waypoints.map(({ address }) => fetchPlace(address))),
    ),
    (action$, state$) => action$.pipe(
        ofType<AppAction, ReplaceWaypointsAction>('REPLACE_WAYPOINTS'),
        mergeMap(() => range(0, state$.value.waypoints.length - 1).pipe(
            map(index => fetchRoute(
                state$.value.waypoints[index].address,
                state$.value.waypoints[index + 1].address,
            )),
        )),
    ),
)

const addWaypointEpic: AppEpic = combineEpics(
    action$ => action$.pipe(
        ofType<AppAction, AddWaypointAction>('ADD_WAYPOINT'),
        map(({ waypoint: { address } }) => fetchPlace(address)),
    ),
    (action$, state$) => action$.pipe(
        ofType<AppAction, AddWaypointAction>('ADD_WAYPOINT'),
        filter(() => state$.value.waypoints.length > 1),
        map(({ waypoint: { address } }) => fetchRoute(state$.value.waypoints.slice(-2)[0].address, address)),
    ),
)

const deleteWaypointEpic: AppEpic = (action$, state$) => action$.pipe(
    ofType<AppAction, DeleteWaypointAction>('DELETE_WAYPOINT'),
    filter(({ index }) => state$.value.waypoints.length > 1
        && index > 0
        && index < state$.value.waypoints.length),
    map(({ index }) => fetchRoute(
        state$.value.waypoints[index - 1].address,
        state$.value.waypoints[index].address,
    )),
)

const setAddressEpic: AppEpic = combineEpics(
    action$ => action$.pipe(
        ofType<AppAction, SetAddressAction>('SET_ADDRESS'),
        map(({ address }) => fetchPlace(address)),
    ),
    (action$, state$) => action$.pipe(
        ofType<AppAction, SetAddressAction>('SET_ADDRESS'),
        filter(({ index }) => index > 0),
        map(({ index }) => fetchRoute(
            state$.value.waypoints[index - 1].address,
            state$.value.waypoints[index].address,
        )),
    ),
    (action$, state$) => action$.pipe(
        ofType<AppAction, SetAddressAction>('SET_ADDRESS'),
        filter(({ index }) => index < state$.value.waypoints.length - 1),
        map(({ index }) => fetchRoute(
            state$.value.waypoints[index].address,
            state$.value.waypoints[index + 1].address,
        )),
    ),
)

const moveWaypointEpic: AppEpic = (action$, state$) => action$.pipe(
    ofType<AppAction, MoveWaypointAction>('MOVE_WAYPOINT'),
    // TODO: Use a more efficient update algorithm
    mergeMap(() => range(0, state$.value.waypoints.length - 1).pipe(
        map(index => fetchRoute(
            state$.value.waypoints[index].address,
            state$.value.waypoints[index + 1].address,
        )),
    )),
)

const moveSelectedWaypointsEpic: AppEpic = (action$, state$) => action$.pipe(
    ofType<AppAction, MoveSelectedWaypointsAction>('MOVE_SELECTED_WAYPOINTS'),
    // TODO: Use a more efficient update algorithm
    mergeMap(() => range(0, state$.value.waypoints.length - 1).pipe(
        map(index => fetchRoute(
            state$.value.waypoints[index].address,
            state$.value.waypoints[index + 1].address,
        )),
    )),
)

const reverseWaypointsEpic: AppEpic = (action$, state$) => action$.pipe(
    ofType<AppAction, ReverseWaypointsAction>('REVERSE_WAYPOINTS'),
    mergeMap(() => range(0, state$.value.waypoints.length - 1).pipe(
        map(index => fetchRoute(
            state$.value.waypoints[index].address,
            state$.value.waypoints[index + 1].address,
        )),
    )),
)

const fetchPlaceEpic: AppEpic = (action$, state$) => action$.pipe(
    ofType<AppAction, FetchPlaceAction>('FETCH_PLACE'),
    filter(({ address }) => {
        const fetchedPlace = state$.value.fetchedPlaces.get(address)

        return !fetchedPlace || fetchedPlace.status === 'FAILED'
    }),
    mergeMap(({ address }) => performLookup(address)),
)

const fetchRouteEpic: AppEpic = (action$, state$) => action$.pipe(
    ofType<AppAction, FetchRouteAction>('FETCH_ROUTE'),
    filter(({ origin, destination }) => {
        const routesFromOrigin = state$.value.fetchedRoutes.get(origin)
        if (!routesFromOrigin) return true
        const route = routesFromOrigin.get(destination)

        return !route || route.status === 'FAILED'
    }),
    mergeMap(({ origin, destination }) => state$.pipe(
        mergeMap(state => {
            const fetchedOrigin = state.fetchedPlaces.get(origin)
            const fetchedDestination = state.fetchedPlaces.get(destination)

            if (!fetchedOrigin || fetchedOrigin.status !== 'SUCCESS') return EMPTY
            if (!fetchedDestination || fetchedDestination.status !== 'SUCCESS') return EMPTY

            return of([fetchedOrigin.result, fetchedDestination.result] as [mapkit.Place, mapkit.Place])
        }),
        take(1),
        mergeMap(([originPlace, destinationPlace]) => performRoute(
            { address: origin, place: originPlace },
            { address: destination, place: destinationPlace },
        )),
    )),
)

export default combineEpics(
    replaceWaypointsEpic,
    reverseWaypointsEpic,
    addWaypointEpic,
    deleteWaypointEpic,
    moveWaypointEpic,
    moveSelectedWaypointsEpic,
    setAddressEpic,
    fetchPlaceEpic,
    fetchRouteEpic,
)
