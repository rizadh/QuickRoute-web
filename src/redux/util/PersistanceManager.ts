import { AppState } from '../state'
import { createWaypointFromAddress } from './createWaypointFromAddress'

export class PersistanceManager {
    static persistState(state: AppState) {
        localStorage.setItem(PersistanceManager.STATE_STORAGE_KEY, JSON.stringify(state.waypoints.map(w => w.address)))
    }

    static persistedState(): Partial<AppState> {
        const persisted = localStorage.getItem(PersistanceManager.STATE_STORAGE_KEY)
        if (!persisted) return {}

        const addresses = JSON.parse(persisted)
        if (!Array.isArray(addresses) || addresses.some(a => typeof a !== 'string')) return {}

        return { waypoints: addresses.map(createWaypointFromAddress) }
    }

    static resetState() {
        localStorage.removeItem(PersistanceManager.STATE_STORAGE_KEY)
    }
    private static STATE_STORAGE_KEY = 'com.rizadh.QuickRoute.state'
}
