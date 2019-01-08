import { applyMiddleware, createStore } from 'redux'
import { logger } from 'redux-logger'
import { createEpicMiddleware } from 'redux-observable'
import { AppAction } from './actionTypes'
import epic from './epic'
import reducer from './reducer'
import { AppState } from './state'

const epicMiddleware = createEpicMiddleware<AppAction, AppAction, AppState>()

const store = createStore(
    reducer,
    applyMiddleware(
        epicMiddleware,
        logger,
    )
)

epicMiddleware.run(epic)

export default store