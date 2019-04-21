import { createContext, Dispatch } from 'react'
import { AppAction } from '../redux/actionTypes'
import { AppState, EditorPane } from '../redux/state'

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
        mutedMapIsEnabled: false,
        editorPane: EditorPane.List,
    },
    dispatch: _ => _,
})
