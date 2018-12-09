import { createStore, applyMiddleware } from 'redux'
import reducer from './reducer'
import AppState from './state'
import AppAction from './actionTypes'
import { logger } from 'redux-logger'

export default createStore<AppState, AppAction, {}, {}>(
    reducer,
    applyMiddleware(logger)
)