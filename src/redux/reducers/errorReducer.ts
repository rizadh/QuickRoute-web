import { AppReducer } from '.'

export const errorReducer: AppReducer<Error | null> = (error = null, action) => {
    switch (action.type) {
        case 'SET_EDITOR_PANE':
            return null
        case 'IMPORT_WAYPOINTS_FAILED':
            return action.error
        case 'OPTIMIZE_ROUTE_FAILED':
            return action.error
        case 'ERROR_OCCURED':
            return action.error
        case 'CLEAR_ERROR':
            return null
    }

    return error
}
