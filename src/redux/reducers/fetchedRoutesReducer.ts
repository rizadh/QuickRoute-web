import { Draft, produce } from 'immer';
import { AppAction } from '../actionTypes';
import { FetchedRoutes, RouteFetchResult } from '../state';
import { AppReducer } from './appReducer';

export const fetchedRoutesReducer: AppReducer<FetchedRoutes> = produce(
    (fetchedRoutes: Draft<FetchedRoutes>, action: AppAction) => {
        switch (action.type) {
            case 'FETCH_ROUTE_IN_PROGRESS':
                getRoutesFromOrigin(fetchedRoutes, action.origin)[action.destination] = {
                    status: 'IN_PROGRESS',
                    fetchId: action.fetchId,
                };
                break;
            case 'FETCH_ROUTE_SUCCESS':
                getRoutesFromOrigin(fetchedRoutes, action.origin)[action.destination] = {
                    status: 'SUCCESS',
                    result: action.route,
                };
                break;
            case 'FETCH_ROUTE_FAILED':
                getRoutesFromOrigin(fetchedRoutes, action.origin)[action.destination] = {
                    status: 'FAILED',
                    error: action.error,
                };
                break;
        }
    },
    {},
);

const getRoutesFromOrigin = (
    fetchedRoutes: { [key: string]: { [key: string]: RouteFetchResult | undefined } | undefined },
    origin: string,
): { [key: string]: RouteFetchResult | undefined } => {
    const routesFromOrigin = fetchedRoutes[origin] || {};
    fetchedRoutes[origin] = routesFromOrigin;

    return routesFromOrigin;
};
