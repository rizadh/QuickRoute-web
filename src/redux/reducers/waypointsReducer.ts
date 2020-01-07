import { Draft, produce } from 'immer'
import { AppReducer } from '.'
import { AppAction } from '../actionTypes'
import { WaypointsState } from '../state'

export const waypointsReducer: AppReducer<WaypointsState> = produce(
    (waypoints: Draft<WaypointsState>, action: AppAction) => {
        switch (action.type) {
            case 'REPLACE_WAYPOINTS':
                waypoints.list = action.waypoints
                break
            case 'ADD_WAYPOINT':
                waypoints.list.push(action.waypoint)
                break
            case 'DELETE_WAYPOINT':
                waypoints.list.splice(action.index, 1)
                break
            case 'DELETE_SELECTED_WAYPOINTS':
                waypoints.list = waypoints.list.filter(({ uuid }) => !waypoints.selected.has(uuid))
                break
            case 'REVERSE_WAYPOINTS':
                waypoints.list.reverse()
                break
            case 'SET_ADDRESS':
                waypoints.list[action.index].address = action.address
                break
            case 'MOVE_WAYPOINT':
                if (action.sourceIndex === action.targetIndex) return

                const [removed] = waypoints.list.splice(action.sourceIndex, 1)

                waypoints.list.splice(action.targetIndex, 0, removed)
                break
            case 'MOVE_SELECTED_WAYPOINTS':
                const lowestIndex = waypoints.list.findIndex(({ uuid }) => waypoints.selected.has(uuid))
                const partitionIndex = lowestIndex < action.index ? action.index + 1 : action.index

                const waypointsBeforePartition = waypoints.list.filter(
                    ({ uuid }, index) => !waypoints.selected.has(uuid) && index < partitionIndex,
                )
                const movedWaypoints = waypoints.list.filter(waypoint => waypoints.selected.has(waypoint.uuid))
                const waypointsAfterPartition = waypoints.list.filter(
                    ({ uuid }, index) => !waypoints.selected.has(uuid) && index >= partitionIndex,
                )

                waypoints.list = [...waypointsBeforePartition, ...movedWaypoints, ...waypointsAfterPartition]

                break
            case 'SELECT_WAYPOINT': {
                const { uuid } = waypoints.list[action.index]

                const selectedCurrentWaypoints = waypoints.list.filter(({ uuid: currenUuid }) =>
                    waypoints.selected.has(currenUuid),
                )
                if (selectedCurrentWaypoints.length === 1 && waypoints.selected.has(uuid)) {
                    // TODO: Can be cleared directly with Immer v4.0
                    waypoints.selected = new Set()
                } else {
                    waypoints.selected = new Set([uuid])
                }

                waypoints.lastSelected = waypoints.list[action.index].uuid
                break
            }
            case 'DESELECT_ALL_WAYPOINTS':
                waypoints.selected = new Set()
                waypoints.lastSelected = ''
                break
            case 'TOGGLE_WAYPOINT_SELECTION': {
                // TODO: Can be set directly with Immer v4.0
                const newSelectedWaypoints = new Set<string>(waypoints.selected as Set<string>)

                const { uuid } = waypoints.list[action.index]

                if (waypoints.selected.has(uuid)) {
                    newSelectedWaypoints.delete(uuid)
                } else {
                    newSelectedWaypoints.add(uuid)
                }

                waypoints.lastSelected = uuid

                waypoints.selected = newSelectedWaypoints
                break
            }
            case 'SELECT_WAYPOINT_RANGE': {
                // TODO: Can be set directly with Immer v4.0
                const newSelectedWaypoints = new Set<string>(waypoints.selected as Set<string>)

                const lastSelectedWaypointIndex = waypoints.list.map(w => w.uuid).indexOf(waypoints.lastSelected)
                const lowerBound = Math.min(action.index, lastSelectedWaypointIndex)
                const upperBound = Math.max(action.index, lastSelectedWaypointIndex)

                for (let i = lowerBound; i < upperBound + 1; i++) {
                    newSelectedWaypoints.add(waypoints.list[i].uuid)
                }

                waypoints.selected = newSelectedWaypoints
                break
            }
        }
    },
    {
        list: [],
        lastSelected: '',
        selected: new Set(),
    } as WaypointsState,
)
