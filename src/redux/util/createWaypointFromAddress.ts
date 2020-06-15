import { v4 as uuidv4 } from 'uuid'
import { Waypoint } from '../state'

export const createWaypointFromAddress = (address: string): Waypoint => ({
    address,
    uuid: uuidv4(),
})
