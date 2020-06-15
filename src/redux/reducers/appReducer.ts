import { combineReducers } from 'redux';
import { AppAction } from '../actionTypes';
import { AppState } from '../state';
import { autofitIsEnabledReducer } from './autofitIsEnabledReducer';
import { editorIsHiddenReducer } from './editorIsHiddenReducer';
import { editorPaneReducer } from './editorPaneReducer';
import { errorReducer } from './errorReducer';
import { fetchedPlacesReducer } from './fetchedPlacesReducer';
import { fetchedRoutesReducer } from './fetchedRoutesReducer';
import { importInProgressReducer } from './importInProgressReducer';
import { optimizationInProgressReducer } from './optimizationInProgressReducer';
import { waypointsReducer } from './waypointsReducer';

export type AppReducer<T = AppState> = (state: T | undefined, action: AppAction) => T;

export const appReducer: AppReducer = combineReducers({
    waypoints: waypointsReducer,
    fetchedPlaces: fetchedPlacesReducer,
    fetchedRoutes: fetchedRoutesReducer,
    autofitIsEnabled: autofitIsEnabledReducer,
    editorPane: editorPaneReducer,
    editorIsHidden: editorIsHiddenReducer,
    importInProgress: importInProgressReducer,
    optimizationInProgress: optimizationInProgressReducer,
    error: errorReducer,
});
