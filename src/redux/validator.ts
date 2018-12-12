export const isValidWaypoint = (waypoint: string) => {
    return /[A-Za-z]+/.test(waypoint)
}

export const parseWaypoint = (waypoint: string) => {
    if (isValidWaypoint(waypoint))
        return waypoint.replace(/[^A-Za-z0-9\s]/g, "")

    return null
}