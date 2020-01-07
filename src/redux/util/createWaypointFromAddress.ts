import uuid from 'uuid/v4'
import { Waypoint } from '../state'

export const createWaypointFromAddress = (address: string): Waypoint => ({
    address,
    uuid: uuid(),
})
