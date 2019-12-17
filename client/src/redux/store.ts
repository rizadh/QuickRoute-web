import { applyMiddleware, createStore } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import { AppAction } from './actionTypes'
import epic from './epic'
import { reducer } from './reducers'
import { AppState } from './state'

const epicMiddleware = createEpicMiddleware<AppAction, AppAction, AppState>()

const STATE_STORAGE_KEY = 'com.rizadh.QuickRoute.state'

const { waypoints, autofitIsEnabled, mutedMapIsEnabled, editorPane, editorIsHidden } = JSON.parse(
    localStorage.getItem(STATE_STORAGE_KEY) || '{}',
)

const persistedState: Partial<AppState> = {
    waypoints: waypoints
        ? {
              list: waypoints.list,
              selected: new Set(waypoints.selected),
              lastSelected: waypoints.lastSelected,
          }
        : undefined,
    autofitIsEnabled,
    mutedMapIsEnabled,
    editorPane,
    editorIsHidden,
}

const store = createStore(reducer, persistedState, applyMiddleware(epicMiddleware))

epicMiddleware.run(epic)

store.dispatch({ type: 'FETCH_ALL_ROUTES' })
store.subscribe(() => localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(store.getState())))

export default store
