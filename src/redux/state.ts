export type FetchedPlaces = {
    [key: string]: mapkit.Place | null
}

export type FetchedRoutes = {
    [key: string]: mapkit.Route | null
}

export type Waypoint = {
    address: string
    uuid: string
}

type AppState = {
    waypoints: Waypoint[]
    fetchedPlaces: FetchedPlaces
    fetchedRoutes: FetchedRoutes
    autofitIsEnabled: boolean
}

export default AppState