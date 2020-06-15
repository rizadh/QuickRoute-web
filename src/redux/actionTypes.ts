import { OptimizationParameter } from '../generated/graphql';
import { EditorPane, Place, Route, Waypoint } from './state';

export type ReplaceWaypointsAction = Readonly<{
    type: 'REPLACE_WAYPOINTS';
    waypoints: Waypoint[];
}>;

export type AddWaypointAction = Readonly<{
    type: 'ADD_WAYPOINT';
    waypoint: Waypoint;
}>;

export type DeleteWaypointAction = Readonly<{
    type: 'DELETE_WAYPOINT';
    index: number;
}>;

export type DeleteSelectedWaypointsAction = Readonly<{
    type: 'DELETE_SELECTED_WAYPOINTS';
}>;

export type MoveWaypointAction = Readonly<{
    type: 'MOVE_WAYPOINT';
    sourceIndex: number;
    targetIndex: number;
}>;

export type MoveSelectedWaypointsAction = Readonly<{
    type: 'MOVE_SELECTED_WAYPOINTS';
    index: number;
}>;

export type ReverseWaypointsAction = Readonly<{
    type: 'REVERSE_WAYPOINTS';
}>;

export type SetAddressAction = Readonly<{
    type: 'SET_ADDRESS';
    index: number;
    address: string;
}>;

export type SelectWaypointAction = Readonly<{
    type: 'SELECT_WAYPOINT';
    index: number;
}>;

export type DeselectAllWaypointsAction = Readonly<{
    type: 'DESELECT_ALL_WAYPOINTS';
}>;

export type ToggleWaypointSelectionAction = Readonly<{
    type: 'TOGGLE_WAYPOINT_SELECTION';
    index: number;
}>;

export type SelectWaypointRangeAction = Readonly<{
    type: 'SELECT_WAYPOINT_RANGE';
    index: number;
}>;

export type FetchPlaceAction = Readonly<{
    type: 'FETCH_PLACE';
    address: string;
}>;

export type FetchPlaceInProgressAction = Readonly<{
    type: 'FETCH_PLACE_IN_PROGRESS';
    address: string;
    fetchId: number;
}>;

export type FetchPlaceSuccessAction = Readonly<{
    type: 'FETCH_PLACE_SUCCESS';
    address: string;
    place: Place;
}>;

export type FetchPlaceFailedAction = Readonly<{
    type: 'FETCH_PLACE_FAILED';
    address: string;
    error: string;
}>;

export type FetchAllRoutesAction = Readonly<{
    type: 'FETCH_ALL_ROUTES';
}>;

export type FetchRouteAction = Readonly<{
    type: 'FETCH_ROUTE';
    origin: string;
    destination: string;
}>;

export type FetchRouteInProgressAction = Readonly<{
    type: 'FETCH_ROUTE_IN_PROGRESS';
    origin: string;
    destination: string;
    fetchId: number;
}>;

export type FetchRouteSuccessAction = Readonly<{
    type: 'FETCH_ROUTE_SUCCESS';
    origin: string;
    destination: string;
    route: Route;
}>;

export type FetchRouteFailedAction = Readonly<{
    type: 'FETCH_ROUTE_FAILED';
    origin: string;
    destination: string;
    error: string;
}>;

export type EnableAutofitAction = Readonly<{
    type: 'ENABLE_AUTOFIT';
}>;

export type DisableAutofitAction = Readonly<{
    type: 'DISABLE_AUTOFIT';
}>;

export type SetEditorPaneAction = Readonly<{
    type: 'SET_EDITOR_PANE';
    editorPane: EditorPane;
}>;

export type HideEditorPaneAction = Readonly<{
    type: 'HIDE_EDITOR_PANE';
}>;

export type ShowEditorPaneAction = Readonly<{
    type: 'SHOW_EDITOR_PANE';
}>;

export type ImportWaypointsAction = Readonly<{
    type: 'IMPORT_WAYPOINTS';
    driverNumber: string;
    password: string;
}>;

export type ImportWaypointsCancelAction = Readonly<{
    type: 'IMPORT_WAYPOINTS_CANCEL';
    driverNumber: string;
}>;

export type ImportWaypointsInProgressAction = Readonly<{
    type: 'IMPORT_WAYPOINTS_IN_PROGRESS';
    driverNumber: string;
}>;

export type ImportWaypointsSuccessAction = Readonly<{
    type: 'IMPORT_WAYPOINTS_SUCCESS';
    driverNumber: string;
}>;

export type ImportWaypointsFailedAction = Readonly<{
    type: 'IMPORT_WAYPOINTS_FAILED';
    driverNumber: string;
    error: string;
}>;

export type OptimizeRouteAction = Readonly<{
    type: 'OPTIMIZE_ROUTE';
    optimizationParameter: OptimizationParameter;
    startPoint?: string;
    endPoint?: string;
}>;

export type OptimizeRouteCancelAction = Readonly<{
    type: 'OPTIMIZE_ROUTE_CANCEL';
    startPoint?: string;
    endPoint?: string;
}>;

export type OptimizeRouteInProgressAction = Readonly<{
    type: 'OPTIMIZE_ROUTE_IN_PROGRESS';
    optimizationParameter: OptimizationParameter;
    startPoint?: string;
    endPoint?: string;
}>;

export type OptimizeRouteSuccessAction = Readonly<{
    type: 'OPTIMIZE_ROUTE_SUCCESS';
    optimizationParameter: OptimizationParameter;
    startPoint?: string;
    endPoint?: string;
}>;

export type OptimizeRouteFailedAction = Readonly<{
    type: 'OPTIMIZE_ROUTE_FAILED';
    optimizationParameter: OptimizationParameter;
    startPoint?: string;
    endPoint?: string;
    error: string;
}>;

export type SetErrorAction = Readonly<{
    type: 'ERROR_OCCURRED';
    error: string;
}>;

export type ClearErrorAction = Readonly<{
    type: 'CLEAR_ERROR';
}>;

export type AppAction =
    | ReplaceWaypointsAction
    | AddWaypointAction
    | DeleteWaypointAction
    | DeleteSelectedWaypointsAction
    | MoveWaypointAction
    | MoveSelectedWaypointsAction
    | ReverseWaypointsAction
    | SetAddressAction
    | SelectWaypointAction
    | DeselectAllWaypointsAction
    | ToggleWaypointSelectionAction
    | SelectWaypointRangeAction
    | FetchPlaceAction
    | FetchPlaceInProgressAction
    | FetchPlaceSuccessAction
    | FetchPlaceFailedAction
    | FetchAllRoutesAction
    | FetchRouteAction
    | FetchRouteInProgressAction
    | FetchRouteSuccessAction
    | FetchRouteFailedAction
    | EnableAutofitAction
    | DisableAutofitAction
    | SetEditorPaneAction
    | HideEditorPaneAction
    | ShowEditorPaneAction
    | ImportWaypointsAction
    | ImportWaypointsCancelAction
    | ImportWaypointsInProgressAction
    | ImportWaypointsSuccessAction
    | ImportWaypointsFailedAction
    | OptimizeRouteAction
    | OptimizeRouteCancelAction
    | OptimizeRouteInProgressAction
    | OptimizeRouteSuccessAction
    | OptimizeRouteFailedAction
    | SetErrorAction
    | ClearErrorAction;
