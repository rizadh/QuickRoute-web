import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { createEpicMiddleware } from 'redux-observable'
import { Observable } from 'rxjs'
import { distinctUntilKeyChanged } from 'rxjs/operators'
import { AppAction } from './actionTypes'
import epic from './epic'
import { appReducer } from './reducers/appReducer'
import { AppState } from './state'
import persistanceManager from './util/PersistanceManager'

const epicMiddleware = createEpicMiddleware<AppAction, AppAction, AppState>()

const store = configureStore({
    reducer: appReducer,
    middleware: [...getDefaultMiddleware(), epicMiddleware],
})

epicMiddleware.run(epic)

new Observable<AppState>(subscriber => store.subscribe(() => subscriber.next(store.getState())))
    .pipe(distinctUntilKeyChanged('waypoints'))
    .forEach(state => persistanceManager.setAddresses(state.waypoints.map(waypoint => waypoint.address)))

export default store
