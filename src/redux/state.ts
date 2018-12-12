export type FetchedPlaces = {
    [key: string]: mapkit.Place | null
}

export type FetchedRoutes = {
    [key: string]: mapkit.Route | null
}

export default interface AppState {
    waypoints: string[]
    fetchedPlaces: FetchedPlaces
    fetchedRoutes: FetchedRoutes
    autofitIsEnabled: boolean
}