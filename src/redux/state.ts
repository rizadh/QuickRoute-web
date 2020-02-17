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
    error: Error;
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
    mutedMapIsEnabled: boolean;
    editorPane: EditorPane;
    editorIsHidden: boolean;
    importInProgress: boolean;
    optimizationInProgress: boolean;
    error: Error | null;
}>
