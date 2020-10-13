import { Draft, produce } from 'immer'
import { AppAction } from '../actionTypes'
import { Waypoints } from '../state'
import { AppReducer } from './appReducer'

export const waypointsReducer: AppReducer<Waypoints> = produce((waypoints: Draft<Waypoints>, action: AppAction) => {
    switch (action.type) {
        case 'REPLACE_WAYPOINTS':
            return action.waypoints
        case 'ADD_WAYPOINT':
            waypoints.push(action.waypoint)
            break
        case 'DELETE_WAYPOINT':
            waypoints.splice(action.index, 1)
            break
        case 'DELETE_SELECTED_WAYPOINTS':
            return waypoints.filter(({ selected }) => !selected)
        case 'REVERSE_WAYPOINTS':
            waypoints.reverse()
            break
        case 'SET_ADDRESS':
            waypoints[action.index].address = action.address
            break
        case 'MOVE_WAYPOINT': {
            if (action.sourceIndex === action.targetIndex) return

            const [removed] = waypoints.splice(action.sourceIndex, 1)

            waypoints.splice(action.targetIndex, 0, removed)
            break
        }
        case 'MOVE_SELECTED_WAYPOINTS': {
            const lowestIndex = waypoints.findIndex(({ selected }) => selected)
            const partitionIndex = lowestIndex < action.index ? action.index + 1 : action.index

            const waypointsBeforePartition = waypoints.filter(
                ({ selected }, index) => !selected && index < partitionIndex,
            )
            const movedWaypoints = waypoints.filter(({ selected }) => selected)
            const waypointsAfterPartition = waypoints.filter(
                ({ selected }, index) => !selected && index >= partitionIndex,
            )

            return [...waypointsBeforePartition, ...movedWaypoints, ...waypointsAfterPartition]
        }
        case 'SELECT_WAYPOINT': {
            const selectedWaypointsCount = waypoints.filter(({ selected }) => selected).length
            const waypointWasSelected = waypoints[action.index].selected
            for (const waypoint of waypoints) delete waypoint.selected
            if (!waypointWasSelected || selectedWaypointsCount > 1) waypoints[action.index].selected = action.time
            break
        }
        case 'DESELECT_ALL_WAYPOINTS':
            for (const waypoint of waypoints) delete waypoint.selected
            break
        case 'TOGGLE_WAYPOINT_SELECTION':
            if (waypoints[action.index].selected) delete waypoints[action.index].selected
            else waypoints[action.index].selected = Date.now()
            break
        case 'SELECT_WAYPOINT_RANGE': {
            const [lastSelectedWaypointIndex] = waypoints.reduce<[number, number | undefined]>(
                (prev, curr, index) =>
                    curr.selected && (!prev[1] || prev[1] < curr.selected) ? [index, curr.selected] : prev,
                [-1, undefined],
            )
            const lowerBound = Math.min(action.index, Math.max(lastSelectedWaypointIndex, 0))
            const upperBound = Math.max(action.index, lastSelectedWaypointIndex)

            for (let i = lowerBound; i < upperBound + 1; i++) {
                waypoints[i].selected = waypoints[i].selected ?? action.time
            }

            break
        }
        case 'SET_EDITOR_PANE':
            for (const waypoint of waypoints) delete waypoint.selected
            break
    }
}, [] as Waypoints)
