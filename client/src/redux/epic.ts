import { getDistance } from 'geolib'
import flatten from 'lodash/flatten'
import { combineEpics, Epic, ofType } from 'redux-observable'
import { concat, EMPTY, from, merge, Observable, ObservableInput, of, range } from 'rxjs'
import { catchError, filter, flatMap, map, mergeMap, take, takeUntil } from 'rxjs/operators'
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
    ImportWaypointsCancelAction,
    MoveSelectedWaypointsAction,
    MoveWaypointAction,
    OptimizationParameter,
    OptimizeRouteAction,
    OptimizeRouteCancelAction,
    ReplaceWaypointsAction,
    ReverseWaypointsAction,
    SetAddressAction,
} from './actionTypes'
import { AppState, EditorPane } from './state'
import { createWaypointFromAddress, getRoute } from './util'

type AppEpic = Epic<AppAction, AppAction, AppState>

const geocoder = new mapkit.Geocoder({ getsUserLocation: true })
const directions = new mapkit.Directions()

type FetchPlaceResultAction = FetchPlaceInProgressAction | FetchPlaceSuccessAction | FetchPlaceFailedAction

const performLookup = (address: string) =>
    new Observable<FetchPlaceResultAction>(observer => {
        const fetchId = geocoder.lookup(address, (error, data) => {
            if (error) {
                observer.next({ type: 'FETCH_PLACE_FAILED', address, error: new Error(`${error} ('${address}')`) })
                observer.complete()

                return
            }

            const place = data.results[0]

            if (!place) {
                observer.next({
                    type: 'FETCH_PLACE_FAILED',
                    address,
                    error: new Error(`No places returned ('${address}')`),
                })
                observer.complete()

                return
            }

            observer.next({ type: 'FETCH_PLACE_SUCCESS', address, place })
            observer.complete()
        })

        observer.next({ type: 'FETCH_PLACE_IN_PROGRESS', address, fetchId })

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
                observer.next({
                    type: 'FETCH_ROUTE_FAILED',
                    origin: origin.address,
                    destination: destination.address,
                    error: new Error(`${error} ('${origin.address}' -> '${origin.address}')`),
                })
                observer.complete()

                return
            }

            const route = data.routes[0]

            if (!route) {
                observer.next({
                    type: 'FETCH_ROUTE_FAILED',
                    origin: origin.address,
                    destination: destination.address,
                    error: new Error(`No routes returned ('${origin.address}' -> '${origin.address}')`),
                })
                observer.complete()

                return
            }

            observer.next({
                type: 'FETCH_ROUTE_SUCCESS',
                origin: origin.address,
                destination: destination.address,
                route,
            })
            observer.complete()
        })

        observer.next({
            type: 'FETCH_ROUTE_IN_PROGRESS',
            origin: origin.address,
            destination: destination.address,
            fetchId,
        })

        return () => directions.cancel(fetchId)
    })

const replaceWaypointsEpic: AppEpic = combineEpics(
    action$ =>
        action$.pipe(
            ofType<AppAction, ReplaceWaypointsAction>('REPLACE_WAYPOINTS'),
            flatMap(({ waypoints }) => waypoints.map(({ address }) => ({ type: 'FETCH_PLACE', address }))),
        ),
    (action$, state$) =>
        action$.pipe(
            ofType<AppAction, ReplaceWaypointsAction>('REPLACE_WAYPOINTS'),
            mergeMap(() =>
                range(0, state$.value.waypoints.list.length - 1).pipe(
                    map(index => ({
                        type: 'FETCH_ROUTE',
                        origin: state$.value.waypoints.list[index].address,
                        destination: state$.value.waypoints.list[index + 1].address,
                    })),
                ),
            ),
        ),
)

const addWaypointEpic: AppEpic = combineEpics(
    action$ =>
        action$.pipe(
            ofType<AppAction, AddWaypointAction>('ADD_WAYPOINT'),
            map(({ waypoint: { address } }) => ({ type: 'FETCH_PLACE', address })),
        ),
    (action$, state$) =>
        action$.pipe(
            ofType<AppAction, AddWaypointAction>('ADD_WAYPOINT'),
            filter(() => state$.value.waypoints.list.length > 1),
            map(({ waypoint: { address } }) => ({
                type: 'FETCH_ROUTE',
                origin: state$.value.waypoints.list.slice(-2)[0].address,
                destination: address,
            })),
        ),
)

const deleteWaypointEpic: AppEpic = (action$, state$) =>
    action$.pipe(
        ofType<AppAction, DeleteWaypointAction>('DELETE_WAYPOINT'),
        filter(
            ({ index }) =>
                state$.value.waypoints.list.length > 1 && index > 0 && index < state$.value.waypoints.list.length,
        ),
        map(({ index }) => ({
            type: 'FETCH_ROUTE',
            origin: state$.value.waypoints.list[index - 1].address,
            destination: state$.value.waypoints.list[index].address,
        })),
    )

const setAddressEpic: AppEpic = combineEpics(
    action$ =>
        action$.pipe(
            ofType<AppAction, SetAddressAction>('SET_ADDRESS'),
            map(({ address }) => ({ type: 'FETCH_PLACE', address })),
        ),
    (action$, state$) =>
        action$.pipe(
            ofType<AppAction, SetAddressAction>('SET_ADDRESS'),
            filter(({ index }) => index > 0),
            map(({ index }) => ({
                type: 'FETCH_ROUTE',
                origin: state$.value.waypoints.list[index - 1].address,
                destination: state$.value.waypoints.list[index].address,
            })),
        ),
    (action$, state$) =>
        action$.pipe(
            ofType<AppAction, SetAddressAction>('SET_ADDRESS'),
            filter(({ index }) => index < state$.value.waypoints.list.length - 1),
            map(({ index }) => ({
                type: 'FETCH_ROUTE',
                origin: state$.value.waypoints.list[index].address,
                destination: state$.value.waypoints.list[index + 1].address,
            })),
        ),
)

const moveWaypointEpic: AppEpic = (action$, state$) =>
    action$.pipe(
        ofType<AppAction, MoveWaypointAction>('MOVE_WAYPOINT'),
        // TODO: Use a more efficient update algorithm
        mergeMap(() =>
            range(0, state$.value.waypoints.list.length - 1).pipe(
                map<number, FetchRouteAction>(index => ({
                    type: 'FETCH_ROUTE',
                    origin: state$.value.waypoints.list[index].address,
                    destination: state$.value.waypoints.list[index + 1].address,
                })),
            ),
        ),
    )

const moveSelectedWaypointsEpic: AppEpic = (action$, state$) =>
    action$.pipe(
        ofType<AppAction, MoveSelectedWaypointsAction>('MOVE_SELECTED_WAYPOINTS'),
        // TODO: Use a more efficient update algorithm
        mergeMap(() =>
            range(0, state$.value.waypoints.list.length - 1).pipe(
                map<number, FetchRouteAction>(index => ({
                    type: 'FETCH_ROUTE',
                    origin: state$.value.waypoints.list[index].address,
                    destination: state$.value.waypoints.list[index + 1].address,
                })),
            ),
        ),
    )

const reverseWaypointsEpic: AppEpic = (action$, state$) =>
    action$.pipe(
        ofType<AppAction, ReverseWaypointsAction>('REVERSE_WAYPOINTS'),
        mergeMap(() =>
            range(0, state$.value.waypoints.list.length - 1).pipe(
                map<number, FetchRouteAction>(index => ({
                    type: 'FETCH_ROUTE',
                    origin: state$.value.waypoints.list[index].address,
                    destination: state$.value.waypoints.list[index + 1].address,
                })),
            ),
        ),
    )

const fetchPlaceEpic: AppEpic = (action$, state$) =>
    action$.pipe(
        ofType<AppAction, FetchPlaceAction>('FETCH_PLACE'),
        filter(({ address }) => !state$.value.fetchedPlaces.get(address)),
        mergeMap(({ address }) => performLookup(address)),
    )

const fetchRouteEpic: AppEpic = (action$, state$) =>
    action$.pipe(
        ofType<AppAction, FetchRouteAction>('FETCH_ROUTE'),
        filter(({ origin, destination }) => !getRoute(state$.value.fetchedRoutes, origin, destination)),
        mergeMap(({ origin, destination }) =>
            merge(
                of<AppAction>({ type: 'FETCH_PLACE', address: origin }),
                of<AppAction>({ type: 'FETCH_PLACE', address: destination }),
                state$.pipe(
                    mergeMap(state => {
                        const fetchedOrigin = state.fetchedPlaces.get(origin)
                        const fetchedDestination = state.fetchedPlaces.get(destination)

                        if (!fetchedOrigin || fetchedOrigin.status === 'IN_PROGRESS') return EMPTY
                        if (fetchedOrigin.status === 'FAILED') {
                            throw new Error(`Route fetching failed: ${fetchedOrigin.error.message}`)
                        }

                        if (!fetchedDestination || fetchedDestination.status === 'IN_PROGRESS') return EMPTY
                        if (fetchedDestination.status === 'FAILED') {
                            throw new Error(`Route fetching failed: ${fetchedDestination.error.message}`)
                        }

                        return of({
                            fetchedOrigin: fetchedOrigin.result,
                            fetchedDestination: fetchedDestination.result,
                        })
                    }),
                    take(1),
                    mergeMap(({ fetchedOrigin, fetchedDestination }) =>
                        performRoute(
                            { address: origin, place: fetchedOrigin },
                            { address: destination, place: fetchedDestination },
                        ),
                    ),
                    catchError(error => {
                        return of({ type: 'FETCH_ROUTE_FAILED', origin, destination, error } as FetchRouteFailedAction)
                    }),
                ),
            ),
        ),
    )

type FetchedWaypoint = { address: string; city: string; postalCode: string }
type WaypointsResponse = {
    date: string;
    driverNumber: string;
    waypoints: {
        dispatched: FetchedWaypoint[];
        inprogress: FetchedWaypoint[];
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

    return (await httpResponse.json()) as WaypointsResponse
}

const importWaypointsEpic: AppEpic = action$ =>
    action$.pipe(
        ofType<AppAction, ImportWaypointsAction>('IMPORT_WAYPOINTS'),
        mergeMap(({ driverNumber }) =>
            concat(
                of<AppAction>({ type: 'IMPORT_WAYPOINTS_IN_PROGRESS', driverNumber }),
                from(importWaypoints(driverNumber)).pipe(
                    mergeMap<WaypointsResponse, ObservableInput<AppAction>>(
                        ({ waypoints: { dispatched, inprogress } }) => [
                            { type: 'IMPORT_WAYPOINTS_SUCCESS', driverNumber },
                            {
                                type: 'REPLACE_WAYPOINTS',
                                waypoints: [...dispatched, ...inprogress]
                                    .map(w => `${w.address} ${w.postalCode}`)
                                    .map(createWaypointFromAddress),
                            },
                            { type: 'SET_EDITOR_PANE', editorPane: EditorPane.List },
                        ],
                    ),
                    catchError<AppAction, ObservableInput<AppAction>>(error =>
                        error instanceof Error ? of({ type: 'IMPORT_WAYPOINTS_FAILED', driverNumber, error }) : EMPTY,
                    ),
                    takeUntil(
                        action$.pipe(
                            ofType<AppAction, ImportWaypointsCancelAction>('IMPORT_WAYPOINTS_CANCEL'),
                            filter(action => action.driverNumber === driverNumber),
                        ),
                    ),
                ),
            ),
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
            const optimizationWaypoints = [...state$.value.waypoints.list.map(w => w.address)]
            if (startPoint) optimizationWaypoints.splice(0, 0, startPoint)
            if (endPoint) optimizationWaypoints.push(endPoint)

            const waypointPairs: Array<[string, string]> = flatten(
                optimizationWaypoints.map(origin => optimizationWaypoints.map(destination => [origin, destination])),
            )

            return merge<AppAction, AppAction>(
                optimizationParameter === OptimizationParameter.Quick
                    ? [
                          { type: 'OPTIMIZE_ROUTE_IN_PROGRESS', optimizationParameter },
                          ...optimizationWaypoints.map<AppAction>(waypoint => ({
                              type: 'FETCH_PLACE',
                              address: waypoint,
                          })),
                      ]
                    : [
                          { type: 'OPTIMIZE_ROUTE_IN_PROGRESS', optimizationParameter },
                          ...waypointPairs.map<AppAction>(([origin, destination]) => ({
                              type: 'FETCH_ROUTE',
                              origin,
                              destination,
                          })),
                      ],
                state$.pipe(
                    filter(state =>
                        optimizationParameter === OptimizationParameter.Quick
                            ? optimizationWaypoints.every(waypoint => {
                                  const place = state.fetchedPlaces.get(waypoint)
                                  return place !== undefined && place.status !== 'IN_PROGRESS'
                              })
                            : waypointPairs.every(([origin, destination]) => {
                                  const route = getRoute(state.fetchedRoutes, origin, destination)
                                  return route !== undefined && route.status !== 'IN_PROGRESS'
                              }),
                    ),
                    take(1),
                    mergeMap(async state => {
                        const getCost = (origin: string, destination: string) => {
                            if (optimizationParameter === OptimizationParameter.Quick) {
                                const fetchedRoute = getRoute(state.fetchedRoutes, origin, destination)

                                if (fetchedRoute && fetchedRoute.status === 'SUCCESS') {
                                    return fetchedRoute.result.distance
                                }

                                const originPlace = state.fetchedPlaces.get(origin)
                                const destinationPlace = state.fetchedPlaces.get(destination)

                                if (
                                    !originPlace ||
                                    !destinationPlace ||
                                    originPlace.status === 'IN_PROGRESS' ||
                                    destinationPlace.status === 'IN_PROGRESS'
                                ) {
                                    throw new Error('Optimization failed: Internal assertion failed')
                                }

                                if (originPlace.status === 'FAILED') {
                                    throw new Error(`Optimization failed: ${originPlace.error.message}`)
                                }

                                if (destinationPlace.status === 'FAILED') {
                                    throw new Error(`Optimization failed: ${destinationPlace.error.message}`)
                                }

                                return getDistance(originPlace.result.coordinate, destinationPlace.result.coordinate)
                            }

                            const route = getRoute(state.fetchedRoutes, origin, destination)
                            if (!route || route.status === 'IN_PROGRESS') {
                                throw new Error('Optimization failed: Internal assertion failed')
                            }

                            if (route.status === 'FAILED') {
                                throw new Error(`Optimization failed: ${route.error.message}`)
                            }

                            switch (optimizationParameter) {
                                case OptimizationParameter.Distance:
                                    return route.result.distance
                                case OptimizationParameter.Time:
                                    return route.result.expectedTravelTime
                                default:
                                    throw new Error('Optimization failed: Internal assertion failed')
                            }
                        }

                        const costMatrix: number[][] = optimizationWaypoints.map(origin =>
                            optimizationWaypoints.map(destination => getCost(origin, destination)),
                        )

                        let optimalOrdering = await optimizeRoute(costMatrix)
                        if (startPoint) optimalOrdering = optimalOrdering.slice(1).map(i => i - 1)
                        if (endPoint) optimalOrdering = optimalOrdering.slice(0, -1)
                        return optimalOrdering.map(i => state.waypoints.list[i].address)
                    }),
                    mergeMap(optimalOrdering => [
                        { type: 'OPTIMIZE_ROUTE_SUCCESS', optimizationParameter },
                        {
                            type: 'REPLACE_WAYPOINTS',
                            waypoints: optimalOrdering.map(createWaypointFromAddress),
                        },
                        { type: 'SET_EDITOR_PANE', editorPane: EditorPane.List },
                    ]),
                    catchError(error => of({ type: 'OPTIMIZE_ROUTE_FAILED', optimizationParameter, error })),
                    takeUntil(
                        action$.pipe(
                            ofType<AppAction, OptimizeRouteCancelAction>('OPTIMIZE_ROUTE_CANCEL'),
                            filter(action => action.startPoint === startPoint && action.endPoint === endPoint),
                        ),
                    ),
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
