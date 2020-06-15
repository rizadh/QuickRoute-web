import { AppReducer } from './appReducer';

export const optimizationInProgressReducer: AppReducer<boolean> = (optimizationInProgress = false, action) => {
    switch (action.type) {
        case 'OPTIMIZE_ROUTE_IN_PROGRESS':
            return true;
        case 'OPTIMIZE_ROUTE_CANCEL':
        case 'OPTIMIZE_ROUTE_SUCCESS':
        case 'OPTIMIZE_ROUTE_FAILED':
            return false;
    }

    return optimizationInProgress;
};
