export type FetchResult<ResultType> = FetchSuccess<ResultType> | FetchInProgress | FetchFailed

export type FetchSuccess<ResultType> = Readonly<{
    status: 'SUCCESS';
    result: ResultType;
}>

export const fetchSuccess = <ResultType>(result: ResultType): FetchSuccess<ResultType> => ({
    status: 'SUCCESS',
    result,
})

export type FetchInProgress = Readonly<{
    status: 'IN_PROGRESS';
    fetchId: number;
}>

export const fetchInProgress = (fetchId: number): FetchInProgress => ({
    status: 'IN_PROGRESS',
    fetchId,
})

export type FetchFailed = Readonly<{
    status: 'FAILED';
    error: Error;
}>

export const fetchFailed = (error: Error): FetchFailed => ({
    status: 'FAILED',
    error,
})

export type PlaceFetchResult = FetchResult<mapkit.Place>
export type FetchedPlaces = ReadonlyMap<string, PlaceFetchResult>

export type RouteFetchResult = FetchResult<mapkit.Route>
export type FetchedRoutes = ReadonlyMap<string, ReadonlyMap<string, RouteFetchResult>>

export type Waypoint = Readonly<{
    address: string;
    uuid: string;
    isSelected: boolean;
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
    lastSelectedWaypointIndex: number;
    fetchedPlaces: FetchedPlaces;
    fetchedRoutes: FetchedRoutes;
    autofitIsEnabled: boolean;
    mutedMapIsEnabled: boolean;
    editorPane?: EditorPane;
}>
