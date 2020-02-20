import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { createEpicMiddleware } from 'redux-observable'
import { Observable } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { AppAction } from './actionTypes'
import epic from './epic'
import { appReducer } from './reducers/appReducer'
import { AppState } from './state'
import { createWaypointFromAddress } from './util/createWaypointFromAddress'
import { PersistanceManager } from './util/PersistanceManager'

const epicMiddleware = createEpicMiddleware<AppAction, AppAction, AppState>()

const searchParams = new URLSearchParams(location.search)

if (searchParams.has('reset')) {
    PersistanceManager.resetState()
    history.replaceState(undefined, 'QuickRoute', location.origin + location.pathname)
}

const store = configureStore({
    reducer: appReducer,
    middleware: [...getDefaultMiddleware(), epicMiddleware],
    preloadedState: PersistanceManager.persistedState(),
})

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
            error: 'Waypoints provided in URL could not be parsed',
        })
    }
}

store.dispatch({ type: 'FETCH_ALL_ROUTES' })

new Observable<AppState>(subscriber => store.subscribe(() => subscriber.next(store.getState())))
    .pipe(debounceTime(1000))
    .forEach(PersistanceManager.persistState)

export default store
