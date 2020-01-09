import { Draft, produce } from 'immer'
import { AppAction } from '../actionTypes'
import { FetchedRoutes } from '../state'
import { AppReducer } from './appReducer'

export const fetchedRoutesReducer: AppReducer<FetchedRoutes> = produce(
    (fetchedRoutes: Draft<FetchedRoutes>, action: AppAction) => {
        switch (action.type) {
            case 'FETCH_ROUTE_IN_PROGRESS': {
                const routesFromOrigin = fetchedRoutes[action.origin] || {}
                fetchedRoutes[action.origin] = routesFromOrigin

                routesFromOrigin[action.destination] = {
                    status: 'IN_PROGRESS',
                    fetchId: action.fetchId,
                }
                break
            }
            case 'FETCH_ROUTE_SUCCESS': {
                const routesFromOrigin = fetchedRoutes[action.origin] || {}
                fetchedRoutes[action.origin] = routesFromOrigin

                routesFromOrigin[action.destination] = {
                    status: 'SUCCESS',
                    result: action.route,
                }
                break
            }
            case 'FETCH_ROUTE_FAILED': {
                const routesFromOrigin = fetchedRoutes[action.origin] || {}
                fetchedRoutes[action.origin] = routesFromOrigin

                routesFromOrigin[action.destination] = {
                    status: 'FAILED',
                    error: action.error,
                }
                break
            }
        }
    },
    {},
)
