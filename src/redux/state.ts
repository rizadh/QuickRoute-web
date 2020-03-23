export type FetchResult<ResultType> = FetchSuccess<ResultType> | FetchInProgress | FetchFailed

export type FetchSuccess<ResultType> = Readonly<{
    status: 'SUCCESS';
    result: ResultType;
}>

export type FetchInProgress = Readonly<{
    status: 'IN_PROGRESS';
    fetchId: number;
}>

export type FetchFailed = Readonly<{
    status: 'FAILED';
    error: string;
}>

export type Coordinate = {
    latitude: number;
    longitude: number;
}

export type Place = {
    coordinate: Coordinate;
    address: string;
}

export type Route = {
    points: Coordinate[];
    distance: number;
    time: number;
}

export type PlaceFetchResult = FetchResult<Place>
export type FetchedPlaces = Readonly<{ [key: string]: PlaceFetchResult | undefined }>

export type RouteFetchResult = FetchResult<Route>
export type FetchedRoutes = Readonly<{
    [key: string]: Readonly<{ [key: string]: RouteFetchResult | undefined }> | undefined;
}>

export type Waypoint = Readonly<{
    address: string;
    uuid: string;
    selected?: number;
}>
type EditorPaneAttributes = {
    displayName: string;
    iconName: string;
}

export const attributesForEditorPane = (editorPane: EditorPane): EditorPaneAttributes => {
    switch (editorPane) {
        case EditorPane.Waypoints:
            return {
                displayName: 'Waypoints',
                iconName: 'stream',
            }
        case EditorPane.BulkEdit:
            return {
                displayName: 'Bulk Edit',
                iconName: 'pencil-alt',
            }
        case EditorPane.Navigate:
            return {
                displayName: 'Navigate',
                iconName: 'directions',
            }
        case EditorPane.Import:
            return {
                displayName: 'Import',
                iconName: 'arrow-alt-circle-down',
            }
        case EditorPane.Optimize:
            return {
                displayName: 'Optimize',
                iconName: 'star-half-alt',
            }
    }
}

export enum EditorPane {
    Waypoints = 'list',
    BulkEdit = 'bulkEdit',
    Import = 'import',
    Navigate = 'urls',
    Optimize = 'optimizer',
}

export type Waypoints = ReadonlyArray<Waypoint>

export type AppState = Readonly<{
    waypoints: Waypoints;
    fetchedPlaces: FetchedPlaces;
    fetchedRoutes: FetchedRoutes;
    autofitIsEnabled: boolean;
    editorPane: EditorPane;
    editorIsHidden: boolean;
    importInProgress: boolean;
    optimizationInProgress: boolean;
    error: string | null;
}>
