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
export type FetchedPlaces = ReadonlyMap<string, PlaceFetchResult>

export type RouteFetchResult = FetchResult<Route>
export type FetchedRoutes = ReadonlyMap<string, ReadonlyMap<string, RouteFetchResult>>

export type Waypoint = Readonly<{
    address: string;
    uuid: string;
    selected?: number;
}>

export enum EditorPane {
    List = 'list',
    BulkEdit = 'bulkEdit',
    Import = 'import',
    Links = 'urls',
    Optimizer = 'optimizer',
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
