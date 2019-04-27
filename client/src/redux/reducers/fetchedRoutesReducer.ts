import { Draft, produce } from 'immer'
import { AppReducer } from '.'
import { AppAction } from '../actionTypes'
import { FetchedRoutes } from '../state'

export const fetchedRoutesReducer: AppReducer<FetchedRoutes> = produce(
    (fetchedRoutes: Draft<FetchedRoutes>, action: AppAction) => {
        switch (action.type) {
            case 'FETCH_ROUTE_IN_PROGRESS': {
                // TODO: Can be set directly with Immer v4.0
                const routesFromOrigin = new Map(fetchedRoutes.get(action.origin) || [])
                const newFetchedRoutes = new Map(fetchedRoutes as FetchedRoutes).set(action.origin, routesFromOrigin)

                routesFromOrigin.set(action.destination, {
                    status: 'IN_PROGRESS',
                    fetchId: action.fetchId,
                })

                return newFetchedRoutes
            }
            case 'FETCH_ROUTE_SUCCESS': {
                // TODO: Can be set directly with Immer v4.0
                const routesFromOrigin = new Map(fetchedRoutes.get(action.origin) || [])
                const newFetchedRoutes = new Map(fetchedRoutes as FetchedRoutes).set(action.origin, routesFromOrigin)

                routesFromOrigin.set(action.destination, {
                    status: 'SUCCESS',
                    result: action.route,
                })

                return newFetchedRoutes
            }
            case 'FETCH_ROUTE_FAILED': {
                // TODO: Can be set directly with Immer v4.0
                const routesFromOrigin = new Map(fetchedRoutes.get(action.origin) || [])
                const newFetchedRoutes = new Map(fetchedRoutes as FetchedRoutes).set(action.origin, routesFromOrigin)

                routesFromOrigin.set(action.destination, {
                    status: 'FAILED',
                    error: action.error,
                })

                return newFetchedRoutes
            }
        }
    },
    new Map() as FetchedRoutes,
)
