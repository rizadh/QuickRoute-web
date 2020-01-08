import { AppState, FetchResult, FetchSuccess } from '../state'

export class PersistanceManager {
    static persistState(state: AppState) {
        localStorage.setItem(
            PersistanceManager.STATE_STORAGE_KEY,
            JSON.stringify(PersistanceManager.sanitizeState(state)),
        )
    }

    static persistedState(): Partial<AppState> {
        return JSON.parse(localStorage.getItem(PersistanceManager.STATE_STORAGE_KEY) || '{}')
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
            autofitIsEnabled: true,
            fetchedPlaces: PersistanceManager.objectFromEntries(
                PersistanceManager.filterSuccessfulFetchResults(Object.entries(fetchedPlaces), key =>
                    addresses.includes(key),
                ),
            ),
            fetchedRoutes: PersistanceManager.objectFromEntries(
                [...Object.entries(fetchedRoutes)]
                    .filter(([key]) => addresses.includes(key))
                    .map(([key, value]) => [
                        key,
                        PersistanceManager.objectFromEntries(
                            PersistanceManager.filterSuccessfulFetchResults(Object.entries(value ?? {}), innerKey =>
                                addresses.includes(innerKey),
                            ),
                        ),
                    ]),
            ),
        }
    }

    private static objectFromEntries<V>(entries: Iterable<[string, V]>): { [key: string]: V } {
        const obj: { [key: string]: V } = {}
        for (const [key, value] of entries) obj[key] = value
        return obj
    }

    private static filterSuccessfulFetchResults<V>(
        source: Iterable<[string, FetchResult<V> | undefined]>,
        predicate: (key: string) => boolean,
    ): Iterable<[string, FetchSuccess<V>]> {
        return [...source].filter(
            (entry): entry is [string, FetchSuccess<V>] =>
                entry[1]?.status === 'SUCCESS' && (!predicate || predicate(entry[0])),
        )
    }
}
