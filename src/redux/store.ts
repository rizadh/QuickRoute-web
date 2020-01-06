import { applyMiddleware, createStore } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import { Observable } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { AppAction } from './actionTypes'
import epic from './epic'
import { reducer } from './reducers'
import { AppState } from './state'
import { createWaypointFromAddress, PersistanceManager } from './util'

const epicMiddleware = createEpicMiddleware<AppAction, AppAction, AppState>()

const searchParams = new URLSearchParams(location.search)

if (searchParams.has('reset')) {
    PersistanceManager.resetState()
    history.replaceState(undefined, 'QuickRoute', location.origin + location.pathname)
}

const store = createStore(reducer, PersistanceManager.persistedState(), applyMiddleware(epicMiddleware))

epicMiddleware.run(epic)

const queryWaypointsValue = searchParams.get('waypoints')
if (queryWaypointsValue) {
    try {
        store.dispatch({
            type: 'REPLACE_WAYPOINTS',
            waypoints: JSON.parse(queryWaypointsValue).map(createWaypointFromAddress),
        })
        history.replaceState(undefined, 'QuickRoute', location.origin + location.pathname)
    } catch {
        store.dispatch({
            type: 'ERROR_OCCURRED',
            error: new Error('Waypoint were provided in URL but could not be parsed'),
        })
    }
}

store.dispatch({ type: 'FETCH_ALL_ROUTES' })

new Observable<AppState>(subscriber => store.subscribe(() => subscriber.next(store.getState())))
    .pipe(debounceTime(1000))
    .forEach(PersistanceManager.persistState)

export default store
