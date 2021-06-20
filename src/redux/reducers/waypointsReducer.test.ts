import { Waypoints, EditorPane } from '../state'
import { waypointsReducer } from './waypointsReducer'
import { AppAction } from '../actionTypes'

const testWaypointsReducer = (initial: Waypoints | undefined, action: AppAction, final: Waypoints) =>
    expect(waypointsReducer(initial, action)).toEqual(final)

const currentTime = Date.now()

it('should return the initial state', () => {
    testWaypointsReducer(undefined, { type: 'REVERSE_WAYPOINTS' }, [])
    testWaypointsReducer(undefined, { type: 'DELETE_SELECTED_WAYPOINTS' }, [])
})

it('should handle REPLACE_WAYPOINTS', () => {
    testWaypointsReducer(
        [],
        {
            type: 'REPLACE_WAYPOINTS',
            waypoints: [
                {
                    address: 'TEST ADDRESS',
                    uuid: 'TEST UUID',
                },
            ],
        },
        [
            {
                address: 'TEST ADDRESS',
                uuid: 'TEST UUID',
            },
        ],
    )
    testWaypointsReducer(
        [
            {
                address: 'OLD ADDRESS',
                uuid: 'OLD UUID',
            },
        ],
        {
            type: 'REPLACE_WAYPOINTS',
            waypoints: [
                {
                    address: 'TEST ADDRESS',
                    uuid: 'TEST UUID',
                },
            ],
        },
        [
            {
                address: 'TEST ADDRESS',
                uuid: 'TEST UUID',
            },
        ],
    )
})

it('should handle ADD_WAYPOINTS', () => {
    testWaypointsReducer(
        [],
        {
            type: 'ADD_WAYPOINT',
            waypoint: {
                address: 'TEST ADDRESS',
                uuid: 'TEST UUID',
            },
        },
        [
            {
                address: 'TEST ADDRESS',
                uuid: 'TEST UUID',
            },
        ],
    )
    testWaypointsReducer(
        [
            {
                address: 'OLD ADDRESS',
                uuid: 'OLD UUID',
            },
        ],
        {
            type: 'ADD_WAYPOINT',
            waypoint: {
                address: 'TEST ADDRESS',
                uuid: 'TEST UUID',
            },
        },
        [
            {
                address: 'OLD ADDRESS',
                uuid: 'OLD UUID',
            },
            {
                address: 'TEST ADDRESS',
                uuid: 'TEST UUID',
            },
        ],
    )
})

it('should handle DELETE_WAYPOINT', () => {
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two' },
        ],
        { type: 'DELETE_WAYPOINT', index: 0 },
        [{ address: 'TWO', uuid: 'two' }],
    )
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two' },
        ],
        { type: 'DELETE_WAYPOINT', index: 1 },
        [{ address: 'ONE', uuid: 'one' }],
    )
})

it('should handle REVERSE_WAYPOINTS', () => {
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two' },
            { address: 'THREE', uuid: 'three' },
        ],
        { type: 'REVERSE_WAYPOINTS' },
        [
            { address: 'THREE', uuid: 'three' },
            { address: 'TWO', uuid: 'two' },
            { address: 'ONE', uuid: 'one' },
        ],
    )
})

it('should handle REVERSE_SELECTED_WAYPOINTS', () => {
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two' },
            { address: 'THREE', uuid: 'three' },
            { address: 'FOUR', uuid: 'four' },
            { address: 'FIVE', uuid: 'five' },
        ],
        { type: 'REVERSE_SELECTED_WAYPOINTS' },
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two' },
            { address: 'THREE', uuid: 'three' },
            { address: 'FOUR', uuid: 'four' },
            { address: 'FIVE', uuid: 'five' },
        ],
    )

    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two', selected: 1 },
            { address: 'THREE', uuid: 'three' },
            { address: 'FOUR', uuid: 'four', selected: 2 },
            { address: 'FIVE', uuid: 'five' },
        ],
        { type: 'REVERSE_SELECTED_WAYPOINTS' },
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'FOUR', uuid: 'four', selected: 2 },
            { address: 'THREE', uuid: 'three' },
            { address: 'TWO', uuid: 'two', selected: 1 },
            { address: 'FIVE', uuid: 'five' },
        ],
    )

    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one', selected: 1 },
            { address: 'TWO', uuid: 'two', selected: 2 },
            { address: 'THREE', uuid: 'three', selected: 3 },
            { address: 'FOUR', uuid: 'four', selected: 4 },
            { address: 'FIVE', uuid: 'five', selected: 5 },
        ],
        { type: 'REVERSE_SELECTED_WAYPOINTS' },
        [
            { address: 'FIVE', uuid: 'five', selected: 5 },
            { address: 'FOUR', uuid: 'four', selected: 4 },
            { address: 'THREE', uuid: 'three', selected: 3 },
            { address: 'TWO', uuid: 'two', selected: 2 },
            { address: 'ONE', uuid: 'one', selected: 1 },
        ],
    )
})

it('should handle SET_ADDRESS', () => {
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two' },
        ],
        { type: 'SET_ADDRESS', index: 0, address: '1' },
        [
            { address: '1', uuid: 'one' },
            { address: 'TWO', uuid: 'two' },
        ],
    )
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two' },
        ],
        { type: 'SET_ADDRESS', index: 1, address: '2' },
        [
            { address: 'ONE', uuid: 'one' },
            { address: '2', uuid: 'two' },
        ],
    )
})

it('should handle MOVE_WAYPOINT', () => {
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two' },
            { address: 'THREE', uuid: 'three' },
        ],
        { type: 'MOVE_WAYPOINT', sourceIndex: 0, targetIndex: 2 },
        [
            { address: 'TWO', uuid: 'two' },
            { address: 'THREE', uuid: 'three' },
            { address: 'ONE', uuid: 'one' },
        ],
    )
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two' },
            { address: 'THREE', uuid: 'three' },
        ],
        { type: 'MOVE_WAYPOINT', sourceIndex: 1, targetIndex: 0 },
        [
            { address: 'TWO', uuid: 'two' },
            { address: 'ONE', uuid: 'one' },
            { address: 'THREE', uuid: 'three' },
        ],
    )
})

it('should handle MOVE_SELECTED_WAYPOINTS', () => {
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two', selected: 1 },
            { address: 'THREE', uuid: 'three' },
            { address: 'FOUR', uuid: 'four', selected: 2 },
        ],
        { type: 'MOVE_SELECTED_WAYPOINTS', index: 0 },
        [
            { address: 'TWO', uuid: 'two', selected: 1 },
            { address: 'FOUR', uuid: 'four', selected: 2 },
            { address: 'ONE', uuid: 'one' },
            { address: 'THREE', uuid: 'three' },
        ],
    )
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two', selected: 1 },
            { address: 'THREE', uuid: 'three' },
            { address: 'FOUR', uuid: 'four', selected: 2 },
        ],
        { type: 'MOVE_SELECTED_WAYPOINTS', index: 1 },
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two', selected: 1 },
            { address: 'FOUR', uuid: 'four', selected: 2 },
            { address: 'THREE', uuid: 'three' },
        ],
    )
})

it('should handle SELECT_WAYPOINT', () => {
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two', selected: 1 },
            { address: 'THREE', uuid: 'three' },
            { address: 'FOUR', uuid: 'four', selected: 2 },
        ],
        { type: 'SELECT_WAYPOINT', index: 1, time: currentTime },
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two', selected: currentTime },
            { address: 'THREE', uuid: 'three' },
            { address: 'FOUR', uuid: 'four' },
        ],
    )
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two', selected: 1 },
            { address: 'THREE', uuid: 'three' },
            { address: 'FOUR', uuid: 'four', selected: 2 },
        ],
        { type: 'SELECT_WAYPOINT', index: 2, time: currentTime },
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two' },
            { address: 'THREE', uuid: 'three', selected: currentTime },
            { address: 'FOUR', uuid: 'four' },
        ],
    )
})

it('should handle TOGGLE_WAYPOINT_SELECTION', () => {
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two', selected: 1 },
            { address: 'THREE', uuid: 'three' },
            { address: 'FOUR', uuid: 'four', selected: 2 },
        ],
        { type: 'TOGGLE_WAYPOINT_SELECTION', index: 1, time: currentTime },
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two' },
            { address: 'THREE', uuid: 'three' },
            { address: 'FOUR', uuid: 'four', selected: 2 },
        ],
    )
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two', selected: 1 },
            { address: 'THREE', uuid: 'three' },
            { address: 'FOUR', uuid: 'four', selected: 2 },
        ],
        { type: 'TOGGLE_WAYPOINT_SELECTION', index: 2, time: currentTime },
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two', selected: 1 },
            { address: 'THREE', uuid: 'three', selected: currentTime },
            { address: 'FOUR', uuid: 'four', selected: 2 },
        ],
    )
})

it('should handle SELECT_WAYPOINT_RANGE', () => {
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two' },
            { address: 'THREE', uuid: 'three' },
            { address: 'FOUR', uuid: 'four' },
            { address: 'FIVE', uuid: 'five' },
            { address: 'SIX', uuid: 'six' },
        ],
        { type: 'SELECT_WAYPOINT_RANGE', index: 2, time: currentTime },
        [
            { address: 'ONE', uuid: 'one', selected: currentTime },
            { address: 'TWO', uuid: 'two', selected: currentTime },
            { address: 'THREE', uuid: 'three', selected: currentTime },
            { address: 'FOUR', uuid: 'four' },
            { address: 'FIVE', uuid: 'five' },
            { address: 'SIX', uuid: 'six' },
        ],
    )
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two', selected: 1 },
            { address: 'THREE', uuid: 'three' },
            { address: 'FOUR', uuid: 'four' },
            { address: 'FIVE', uuid: 'five' },
            { address: 'SIX', uuid: 'six' },
        ],
        { type: 'SELECT_WAYPOINT_RANGE', index: 3, time: currentTime },
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two', selected: 1 },
            { address: 'THREE', uuid: 'three', selected: currentTime },
            { address: 'FOUR', uuid: 'four', selected: currentTime },
            { address: 'FIVE', uuid: 'five' },
            { address: 'SIX', uuid: 'six' },
        ],
    )
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two', selected: 1 },
            { address: 'THREE', uuid: 'three' },
            { address: 'FOUR', uuid: 'four' },
            { address: 'FIVE', uuid: 'five' },
            { address: 'SIX', uuid: 'six', selected: 2 },
        ],
        { type: 'SELECT_WAYPOINT_RANGE', index: 3, time: currentTime },
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two', selected: 1 },
            { address: 'THREE', uuid: 'three' },
            { address: 'FOUR', uuid: 'four', selected: currentTime },
            { address: 'FIVE', uuid: 'five', selected: currentTime },
            { address: 'SIX', uuid: 'six', selected: 2 },
        ],
    )
})

it('should handle SET_EDITOR_PANE', () => {
    testWaypointsReducer(
        [
            { address: 'ONE', uuid: 'one', selected: 1 },
            { address: 'TWO', uuid: 'two', selected: 2 },
            { address: 'THREE', uuid: 'three', selected: 3 },
        ],
        { type: 'SET_EDITOR_PANE', editorPane: EditorPane.Waypoints },
        [
            { address: 'ONE', uuid: 'one' },
            { address: 'TWO', uuid: 'two' },
            { address: 'THREE', uuid: 'three' },
        ],
    )
})
