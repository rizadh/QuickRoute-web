import { flatten } from 'lodash'
import { combineEpics, Epic, ofType } from 'redux-observable'
import { EMPTY, from, merge, Observable, ObservableInput, of, range } from 'rxjs'
import { filter, flatMap, map, mergeMap, take } from 'rxjs/operators'
import {
    createWaypointFromAddress,
    fetchPlace,
    fetchPlaceFailed,
    fetchPlaceInProgress,
    fetchPlaceSuccess,
    fetchRoute,
    fetchRouteFailed,
    fetchRouteInProgress,
    fetchRouteSuccess,
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
    ImportWaypointsAction,
    MoveSelectedWaypointsAction,
    MoveWaypointAction,
    OptimizationParameter,
    OptimizeRouteAction,
    ReplaceWaypointsAction,
    ReverseWaypointsAction,
    SetAddressAction,
} from './actionTypes'
import { AppState, EditorPane } from './state'

type AppEpic = Epic<AppAction, AppAction, AppState>

const geocoder = new mapkit.Geocoder({ getsUserLocation: true })
const directions = new mapkit.Directions()

type FetchPlaceResultAction = FetchPlaceInProgressAction | FetchPlaceSuccessAction | FetchPlaceFailedAction

const performLookup = (address: string) =>
    new Observable<FetchPlaceResultAction>(observer => {
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
    origin: { address: string; place: mapkit.Place },
    destination: { address: string; place: mapkit.Place },
) =>
    new Observable<FetchRouteResultAction>(observer => {
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
    action$ =>
        action$.pipe(
            ofType<AppAction, ReplaceWaypointsAction>('REPLACE_WAYPOINTS'),
            flatMap(({ waypoints }) => waypoints.map(({ address }) => fetchPlace(address))),
        ),
    (action$, state$) =>
        action$.pipe(
            ofType<AppAction, ReplaceWaypointsAction>('REPLACE_WAYPOINTS'),
            mergeMap(() =>
                range(0, state$.value.waypoints.length - 1).pipe(
                    map(index =>
                        fetchRoute(state$.value.waypoints[index].address, state$.value.waypoints[index + 1].address),
                    ),
                ),
            ),
        ),
)

const addWaypointEpic: AppEpic = combineEpics(
    action$ =>
        action$.pipe(
            ofType<AppAction, AddWaypointAction>('ADD_WAYPOINT'),
            map(({ waypoint: { address } }) => fetchPlace(address)),
        ),
    (action$, state$) =>
        action$.pipe(
            ofType<AppAction, AddWaypointAction>('ADD_WAYPOINT'),
            filter(() => state$.value.waypoints.length > 1),
            map(({ waypoint: { address } }) => fetchRoute(state$.value.waypoints.slice(-2)[0].address, address)),
        ),
)

const deleteWaypointEpic: AppEpic = (action$, state$) =>
    action$.pipe(
        ofType<AppAction, DeleteWaypointAction>('DELETE_WAYPOINT'),
        filter(({ index }) => state$.value.waypoints.length > 1 && index > 0 && index < state$.value.waypoints.length),
        map(({ index }) => fetchRoute(state$.value.waypoints[index - 1].address, state$.value.waypoints[index].address)),
    )

const setAddressEpic: AppEpic = combineEpics(
    action$ =>
        action$.pipe(
            ofType<AppAction, SetAddressAction>('SET_ADDRESS'),
            map(({ address }) => fetchPlace(address)),
        ),
    (action$, state$) =>
        action$.pipe(
            ofType<AppAction, SetAddressAction>('SET_ADDRESS'),
            filter(({ index }) => index > 0),
            map(({ index }) =>
                fetchRoute(state$.value.waypoints[index - 1].address, state$.value.waypoints[index].address),
            ),
        ),
    (action$, state$) =>
        action$.pipe(
            ofType<AppAction, SetAddressAction>('SET_ADDRESS'),
            filter(({ index }) => index < state$.value.waypoints.length - 1),
            map(({ index }) =>
                fetchRoute(state$.value.waypoints[index].address, state$.value.waypoints[index + 1].address),
            ),
        ),
)

const moveWaypointEpic: AppEpic = (action$, state$) =>
    action$.pipe(
        ofType<AppAction, MoveWaypointAction>('MOVE_WAYPOINT'),
        // TODO: Use a more efficient update algorithm
        mergeMap(() =>
            range(0, state$.value.waypoints.length - 1).pipe(
                map(index =>
                    fetchRoute(state$.value.waypoints[index].address, state$.value.waypoints[index + 1].address),
                ),
            ),
        ),
    )

const moveSelectedWaypointsEpic: AppEpic = (action$, state$) =>
    action$.pipe(
        ofType<AppAction, MoveSelectedWaypointsAction>('MOVE_SELECTED_WAYPOINTS'),
        // TODO: Use a more efficient update algorithm
        mergeMap(() =>
            range(0, state$.value.waypoints.length - 1).pipe(
                map(index =>
                    fetchRoute(state$.value.waypoints[index].address, state$.value.waypoints[index + 1].address),
                ),
            ),
        ),
    )

const reverseWaypointsEpic: AppEpic = (action$, state$) =>
    action$.pipe(
        ofType<AppAction, ReverseWaypointsAction>('REVERSE_WAYPOINTS'),
        mergeMap(() =>
            range(0, state$.value.waypoints.length - 1).pipe(
                map(index =>
                    fetchRoute(state$.value.waypoints[index].address, state$.value.waypoints[index + 1].address),
                ),
            ),
        ),
    )

const fetchPlaceEpic: AppEpic = (action$, state$) =>
    action$.pipe(
        ofType<AppAction, FetchPlaceAction>('FETCH_PLACE'),
        filter(({ address }) => {
            const fetchedPlace = state$.value.fetchedPlaces.get(address)

            return !fetchedPlace || fetchedPlace.status === 'FAILED'
        }),
        mergeMap(({ address }) => performLookup(address)),
    )

const fetchRouteEpic: AppEpic = (action$, state$) =>
    action$.pipe(
        ofType<AppAction, FetchRouteAction>('FETCH_ROUTE'),
        filter(({ origin, destination }) => {
            const routesFromOrigin = state$.value.fetchedRoutes.get(origin)
            if (!routesFromOrigin) return true
            const route = routesFromOrigin.get(destination)

            return !route || route.status === 'FAILED'
        }),
        mergeMap(({ origin, destination }) =>
            merge(
                of<AppAction>({ type: 'FETCH_PLACE', address: origin }),
                of<AppAction>({ type: 'FETCH_PLACE', address: destination }),
                state$.pipe(
                    mergeMap(state => {
                        const fetchedOrigin = state.fetchedPlaces.get(origin)
                        const fetchedDestination = state.fetchedPlaces.get(destination)

                        if (!fetchedOrigin || fetchedOrigin.status !== 'SUCCESS') return EMPTY
                        if (!fetchedDestination || fetchedDestination.status !== 'SUCCESS') return EMPTY

                        return of([fetchedOrigin.result, fetchedDestination.result] as [mapkit.Place, mapkit.Place])
                    }),
                    take(1),
                    mergeMap(([originPlace, destinationPlace]) =>
                        performRoute(
                            { address: origin, place: originPlace },
                            { address: destination, place: destinationPlace },
                        ),
                    ),
                ),
            ),
        ),
    )

type FetchedWaypoint = { address: string; city: string; postalCode: string }
type WaypointsResponse = {
    date: string;
    driverNumber: string;
    waypoints: {
        dispatched: ReadonlyArray<FetchedWaypoint>;
        inprogress: ReadonlyArray<FetchedWaypoint>;
    };
}

const importWaypoints = async (driverNumber: string) => {
    const url = '/waypoints/' + driverNumber
    const httpResponse = await fetch(url)
    if (!httpResponse.ok) {
        throw new Error(
            `Failed to import waypoints for driver ${driverNumber} (ERROR: '${await httpResponse.text()}')`,
        )
    }

    const {
        waypoints: { dispatched, inprogress },
    } = (await httpResponse.json()) as WaypointsResponse
    return [...dispatched, ...inprogress].map(w => `${w.address} ${w.postalCode}`).map(createWaypointFromAddress)
}

const importWaypointsEpic: AppEpic = action$ =>
    action$.pipe(
        ofType<AppAction, ImportWaypointsAction>('IMPORT_WAYPOINTS'),
        mergeMap(
            ({ driverNumber }) =>
                new Observable<AppAction>(observer => {
                    observer.next({ type: 'IMPORT_WAYPOINTS_IN_PROGRESS', driverNumber })
                    importWaypoints(driverNumber)
                        .then(waypoints => {
                            observer.next({ type: 'IMPORT_WAYPOINTS_SUCCESS', driverNumber })
                            observer.next({ type: 'REPLACE_WAYPOINTS', waypoints })
                            observer.next({ type: 'SET_EDITOR_PANE', editorPane: EditorPane.List })
                            observer.complete()
                        })
                        .catch(error => {
                            if (error instanceof Error) {
                                observer.next({ type: 'IMPORT_WAYPOINTS_FAILED', driverNumber, error })
                            }
                            observer.complete()
                        })
                }),
        ),
    )

interface IOptimizeResponse {
    result: number[]
}

const optimizeRoute = async (costMatrix: number[][]) => {
    const response = await fetch('/optimize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ costMatrix }),
    })

    if (!response.ok) {
        throw new Error(`Failed to optimize route ${await response.text()}`)
    }

    const jsonResponse: IOptimizeResponse = await response.json()
    return jsonResponse.result
}

const optimizeRouteEpic: AppEpic = (action$, state$) =>
    action$.pipe(
        ofType<AppAction, OptimizeRouteAction>('OPTIMIZE_ROUTE'),
        mergeMap<OptimizeRouteAction, ObservableInput<AppAction>>(({ optimizationParameter, startPoint, endPoint }) => {
            const optimizationWaypoints = [...state$.value.waypoints.map(w => w.address)]
            if (startPoint) optimizationWaypoints.splice(0, 0, startPoint)
            if (endPoint) optimizationWaypoints.push(endPoint)

            const waypointPairs: Array<[string, string]> = flatten(
                optimizationWaypoints.map(origin => optimizationWaypoints.map(destination => [origin, destination])),
            )

            return merge(
                of({ type: 'OPTIMIZE_ROUTE_IN_PROGRESS', optimizationParameter }),
                from<ObservableInput<FetchRouteAction>>(
                    waypointPairs.map(([origin, destination]) => ({ type: 'FETCH_ROUTE', origin, destination })),
                ),
                state$.pipe(
                    filter(state =>
                        waypointPairs.every(([origin, destination]) => {
                            const routesFromOrigin = state.fetchedRoutes.get(origin)
                            const route = routesFromOrigin && routesFromOrigin.get(destination)
                            return route !== undefined && route.status === 'SUCCESS'
                        }),
                    ),
                    take(1),
                    mergeMap(state => {
                        const costMatrix = optimizationWaypoints.map(origin =>
                            optimizationWaypoints.map(destination => {
                                const routesFromOrigin = state.fetchedRoutes.get(origin)
                                const route = routesFromOrigin && routesFromOrigin.get(destination)
                                if (!route || route.status !== 'SUCCESS') {
                                    throw new Error(
                                        `Optimization failed: Route from ${origin} to ${destination} was not fetched`,
                                    )
                                }

                                switch (optimizationParameter) {
                                    case OptimizationParameter.Distance:
                                        return route.result.distance
                                    case OptimizationParameter.Time:
                                        return route.result.expectedTravelTime
                                }
                            }),
                        )

                        return new Observable<AppAction>(observer => {
                            optimizeRoute(costMatrix)
                                .then(optimalOrdering => {
                                    if (startPoint) optimalOrdering = optimalOrdering.slice(1, -1).map(i => i - 1)

                                    observer.next({ type: 'OPTIMIZE_ROUTE_SUCCESS', optimizationParameter })
                                    observer.next({
                                        type: 'REPLACE_WAYPOINTS',
                                        waypoints: optimalOrdering
                                            .map(i => state.waypoints[i].address)
                                            .map(createWaypointFromAddress),
                                    })
                                    observer.next({ type: 'SET_EDITOR_PANE', editorPane: EditorPane.List })
                                    observer.complete()
                                })
                                .catch(error => {
                                    if (error instanceof Error) {
                                        observer.next({ type: 'OPTIMIZE_ROUTE_FAILED', optimizationParameter, error })
                                    }
                                    observer.complete()
                                })
                        })
                    }),
                ),
            )
        }),
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
    importWaypointsEpic,
    optimizeRouteEpic,
)
