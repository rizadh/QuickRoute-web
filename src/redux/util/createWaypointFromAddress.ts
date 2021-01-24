import { v4 as uuidv4 } from 'uuid'
import { Waypoint } from '../state'

export const createWaypointFromAddress = (address: string): Waypoint => ({
    address: address.replace(/\s+/g, ' ').trim(),
    uuid: uuidv4(),
})
