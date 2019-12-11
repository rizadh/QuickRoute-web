import { applyMiddleware, createStore } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import { AppAction } from './actionTypes'
import epic from './epic'
import { reducer } from './reducers'
import { AppState } from './state'

const epicMiddleware = createEpicMiddleware<AppAction, AppAction, AppState>()

const store = createStore(reducer, applyMiddleware(epicMiddleware))

epicMiddleware.run(epic)

export default store
