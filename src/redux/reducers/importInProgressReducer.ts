import { AppReducer } from './appReducer'

export const importInProgressReducer: AppReducer<boolean> = (importInProgress = false, action) => {
    switch (action.type) {
        case 'IMPORT_WAYPOINTS_IN_PROGRESS':
            return true
        case 'IMPORT_WAYPOINTS_CANCEL':
        case 'IMPORT_WAYPOINTS_SUCCESS':
        case 'IMPORT_WAYPOINTS_FAILED':
            return false
    }

    return importInProgress
}
