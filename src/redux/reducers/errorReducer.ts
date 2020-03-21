import { AppState } from '../state'
import { AppReducer } from './appReducer'

export const errorReducer: AppReducer<AppState['error']> = (error = null, action) => {
    switch (action.type) {
        case 'SET_EDITOR_PANE':
            return null
        case 'OPTIMIZE_ROUTE_FAILED':
        case 'ERROR_OCCURRED':
            return action.error
        case 'CLEAR_ERROR':
            return null
    }

    return error
}
