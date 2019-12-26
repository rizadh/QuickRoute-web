import { applyMiddleware, createStore } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import { Observable } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { AppAction } from './actionTypes'
import epic from './epic'
import { reducer } from './reducers'
import { AppState } from './state'
import { createWaypointFromAddress } from './util'

const epicMiddleware = createEpicMiddleware<AppAction, AppAction, AppState>()

const STATE_STORAGE_KEY = 'com.rizadh.QuickRoute.state'

const searchParams = new URLSearchParams(location.search)

if (searchParams.has('reset')) localStorage.removeItem(STATE_STORAGE_KEY)

const {
    waypoints,
    autofitIsEnabled,
    mutedMapIsEnabled,
    editorPane,
    editorIsHidden,
    fetchedPlaces,
    fetchedRoutes,
} = JSON.parse(localStorage.getItem(STATE_STORAGE_KEY) || '{}')

let persistedState: Partial<AppState> = {
    waypoints: waypoints && {
        list: waypoints.list,
        selected: new Set(waypoints.selected),
        lastSelected: waypoints.lastSelected,
    },
    autofitIsEnabled,
    mutedMapIsEnabled,
    editorPane,
    editorIsHidden,
    fetchedPlaces: fetchedPlaces && new Map(fetchedPlaces),
    fetchedRoutes: fetchedRoutes && new Map(fetchedRoutes.map(([key, value]: [string, any]) => [key, new Map(value)])),
}

const queryWaypointsValue = searchParams.get('waypoints')
if (queryWaypointsValue) {
    const queryWaypoints = JSON.parse(queryWaypointsValue) as string[]
    persistedState = {
        ...persistedState,
        waypoints: {
            list: queryWaypoints.map(createWaypointFromAddress),
            selected: new Set(),
            lastSelected: '',
        },
    }
}

const store = createStore(reducer, persistedState, applyMiddleware(epicMiddleware))

epicMiddleware.run(epic)

store.dispatch({ type: 'FETCH_ALL_ROUTES' })

new Observable<AppState>(subscriber => store.subscribe(() => subscriber.next(store.getState())))
    .pipe(debounceTime(1000))
    .forEach(state => localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(state)))

export default store
