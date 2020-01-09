import { AppReducer } from '.'

export const errorReducer: AppReducer<Error | null> = (error = null, action) => {
    switch (action.type) {
        case 'SET_EDITOR_PANE':
            return null
        case 'IMPORT_WAYPOINTS_FAILED':
        case 'OPTIMIZE_ROUTE_FAILED':
        case 'ERROR_OCCURRED':
            return action.error
        case 'CLEAR_ERROR':
            return null
    }

    return error
}
