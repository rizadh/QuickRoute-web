import { createContext } from 'react'
import { Dispatch } from 'redux'
import { AppAction } from '../redux/actionTypes'
import { AppState } from '../redux/state'

export const AppStateContext = createContext<{
    state: AppState;
    dispatch: Dispatch<AppAction>;
}>({
    state: {
        waypoints: [],
        lastSelectedWaypointIndex: 0,
        fetchedPlaces: new Map(),
        fetchedRoutes: new Map(),
        autofitIsEnabled: true,
    },
    dispatch: _ => _,
})
