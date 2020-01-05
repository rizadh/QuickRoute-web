import uuid from 'uuid/v4'
import { AppState, FetchedRoutes, FetchResult, FetchSuccess, RouteFetchResult, Waypoint } from './state'

export const createWaypointFromAddress = (address: string): Waypoint => ({
    address,
    uuid: uuid(),
})

export const getRoute = (
    fetchedRoutes: FetchedRoutes,
    origin: string,
    destination: string,
): RouteFetchResult | undefined => fetchedRoutes.get(origin)?.get(destination)

export class PersistanceManager {
    static persistState(state: AppState) {
        localStorage.setItem(PersistanceManager.STATE_STORAGE_KEY, JSON.stringify(state))
    }

    static persistedState(): Partial<AppState> {
        const {
            waypoints,
            autofitIsEnabled,
            mutedMapIsEnabled,
            editorPane,
            editorIsHidden,
            fetchedPlaces,
            fetchedRoutes,
        } = JSON.parse(localStorage.getItem(PersistanceManager.STATE_STORAGE_KEY) || '{}')

        return {
            waypoints: waypoints && {
                list: waypoints.list,
                selected: new Set(waypoints.selected),
                lastSelected: waypoints.lastSelected,
            },
            autofitIsEnabled,
            mutedMapIsEnabled,
            editorPane,
            editorIsHidden,
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
