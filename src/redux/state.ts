export type FetchResult<ResultType> = FetchSuccess<ResultType> | FetchInProgress | FetchFailed

export type FetchSuccess<ResultType> = Readonly<{
    status: 'SUCCESS'
    result: ResultType
}>

export const fetchSuccess = <ResultType>(result: ResultType): FetchSuccess<ResultType>  => ({
    status: 'SUCCESS',
    result
})

export type FetchInProgress = Readonly<{
    status: 'IN_PROGRESS'
    fetchId: number
}>

export const fetchInProgress = (fetchId: number): FetchInProgress => ({
    status: 'IN_PROGRESS',
    fetchId
})

export type FetchFailed = Readonly<{
    status: 'FAILED'
    error: Error
}>

export const fetchFailed = (error: Error): FetchFailed => ({
    status: 'FAILED',
    error
})

export type FetchedPlaces = ReadonlyMap<string, FetchResult<mapkit.Place>>

export type FetchedRoutes = ReadonlyMap<string, ReadonlyMap<string, FetchResult<mapkit.Route>>>

export type Waypoint = Readonly<{
    address: string
    uuid: string
}>

export type AppState = Readonly<{
    waypoints: ReadonlyArray<Waypoint>
    fetchedPlaces: FetchedPlaces
    fetchedRoutes: FetchedRoutes
    autofitIsEnabled: boolean
}>