import { createStore, applyMiddleware } from 'redux'
import reducer from './reducer'
import AppState from './state'
import AppAction from './actionTypes'
import { logger } from 'redux-logger'
import thunk, { ThunkMiddleware } from 'redux-thunk'

const geocoder = new mapkit.Geocoder({ getsUserLocation: true })
const directions = new mapkit.Directions()

export interface ExtraArgument {
    geocoder: mapkit.Geocoder
    directions: mapkit.Directions
}

const store = createStore(
    reducer,
    applyMiddleware(
        thunk.withExtraArgument({ geocoder, directions }) as ThunkMiddleware<AppState, AppAction, ExtraArgument>,
        logger,
    )
)

export default store