import { createStore, applyMiddleware } from 'redux'
import reducer from './reducer'
import { AppState } from './state'
import { AppAction } from './actionTypes'
import epic from './epic'
import { logger } from 'redux-logger'
import { createEpicMiddleware } from 'redux-observable'

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