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

export type PlaceFetchResult = FetchResult<mapkit.Place>
export type FetchedPlaces = ReadonlyMap<string, PlaceFetchResult>

export type RouteFetchResult = FetchResult<mapkit.Route>
export type FetchedRoutes = ReadonlyMap<string, ReadonlyMap<string, RouteFetchResult>>

export type Waypoint = Readonly<{
    address: string;
    uuid: string;
}>

export enum EditorPane {
    List = 'list',
    BulkEdit = 'bulkEdit',
    Import = 'import',
    Links = 'urls',
    Optimizer = 'optimizer',
}

export type AppState = Readonly<{
    waypoints: ReadonlyArray<Waypoint>;
    lastSelectedWaypoint: string;
    selectedWaypoints: ReadonlySet<string>;
    fetchedPlaces: FetchedPlaces;
    fetchedRoutes: FetchedRoutes;
    autofitIsEnabled: boolean;
    mutedMapIsEnabled: boolean;
    editorPane: EditorPane;
    editorIsHidden: boolean;
    importInProgress: boolean;
    optimizationInProgress: boolean;
    error?: Error;
}>
