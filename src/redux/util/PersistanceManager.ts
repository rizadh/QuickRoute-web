import { AppState, FetchResult, FetchSuccess } from '../state'

export class PersistanceManager {
    static persistState(state: AppState) {
        localStorage.setItem(PersistanceManager.STATE_STORAGE_KEY, JSON.stringify(state))
    }

    static persistedState(): Partial<AppState> {
        const state = JSON.parse(localStorage.getItem(PersistanceManager.STATE_STORAGE_KEY) || '{}')
        const { waypoints, fetchedPlaces, fetchedRoutes } = state

        return {
            ...state,
            autofitIsEnabled: true,
            waypoints: waypoints && {
                ...waypoints,
                selected: new Set(waypoints.selected),
            },
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

    private static sanitizeFetchResults<K, V>(source: ReadonlyMap<K, FetchResult<V>>): ReadonlyMap<K, FetchSuccess<V>> {
        const sanitizedEntries: Array<[K, FetchSuccess<V>]> = []

        for (const entry of source.entries()) {
            const [key, result] = entry

            if (result.status === 'SUCCESS') {
                sanitizedEntries.push([key, result])
            }
        }

        return new Map(sanitizedEntries)
    }
}
