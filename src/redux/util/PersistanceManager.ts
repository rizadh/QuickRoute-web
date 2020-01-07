import { AppState, FetchResult, FetchSuccess } from '../state'

export class PersistanceManager {
    static persistState(state: AppState) {
        localStorage.setItem(
            PersistanceManager.STATE_STORAGE_KEY,
            JSON.stringify(PersistanceManager.sanitizeState(state)),
        )
    }

    static persistedState(): Partial<AppState> {
        const state = JSON.parse(localStorage.getItem(PersistanceManager.STATE_STORAGE_KEY) || '{}')
        const { waypoints, fetchedPlaces, fetchedRoutes } = state

        return {
            ...state,
            autofitIsEnabled: true,
            waypoints,
            fetchedPlaces: fetchedPlaces && PersistanceManager.sanitizeFetchResults(new Map(fetchedPlaces)),
            fetchedRoutes:
                fetchedRoutes &&
                new Map(
                    fetchedRoutes.map(([key, value]: [string, any]) => [
                        key,
                        PersistanceManager.sanitizeFetchResults(new Map(value)),
                    ]),
                ),
        }
    }

    static resetState() {
        localStorage.removeItem(PersistanceManager.STATE_STORAGE_KEY)
    }
    private static STATE_STORAGE_KEY = 'com.rizadh.QuickRoute.state'

    private static sanitizeState(state: AppState): AppState {
        const { waypoints, fetchedPlaces, fetchedRoutes } = state
        const addresses = waypoints.map(w => w.address)

        return {
            ...state,
            waypoints: waypoints.map(waypoint => ({ ...waypoint, selected: undefined })),
            fetchedPlaces: PersistanceManager.sanitizeFetchResults(new Map(fetchedPlaces), addresses),
            fetchedRoutes: new Map(
                [...fetchedRoutes.entries()]
                    .filter(([key]) => !addresses || addresses.includes(key))
                    .map(([key, value]: [string, any]) => [
                        key,
                        PersistanceManager.sanitizeFetchResults(new Map(value), addresses),
                    ]),
            ),
        }
    }

    private static sanitizeFetchResults<K, V>(
        source: ReadonlyMap<K, FetchResult<V>>,
        addresses?: K[],
    ): ReadonlyMap<K, FetchSuccess<V>> {
        return new Map(
            [...source.entries()].filter(
                (entry): entry is [K, FetchSuccess<V>] =>
                    entry[1].status === 'SUCCESS' && (!addresses || addresses.includes(entry[0])),
            ),
        )
    }
}
