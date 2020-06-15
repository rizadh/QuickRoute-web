import { Waypoint, Waypoints } from '../state';
import { waypointsReducer } from './waypointsReducer';

const TEST_WAYPOINT: Waypoint = {
    address: 'TEST ADDRESS',
    uuid: 'TEST UUID',
};
const INITIAL_STATE: Waypoints = [];

const ONE_WAYPOINT_STATE: Waypoints = [TEST_WAYPOINT];

const TWO_WAYPOINTS_STATE: Waypoints = [
    { address: 'ONE', uuid: 'ONE' },
    { address: 'TWO', uuid: 'TWo' },
];

const TWO_WAYPOINTS_STATE_REVERSED: Waypoints = [
    { address: 'TWO', uuid: 'TWo' },
    { address: 'ONE', uuid: 'ONE' },
];

describe('waypointsReducer', () => {
    it('should return the initial state', () => {
        expect(waypointsReducer(undefined, { type: 'REVERSE_WAYPOINTS' })).toEqual(INITIAL_STATE);
    });

    it('should handle REPLACE_WAYPOINTS', () => {
        expect(
            waypointsReducer(INITIAL_STATE, {
                type: 'REPLACE_WAYPOINTS',
                waypoints: [TEST_WAYPOINT],
            }),
        ).toEqual(ONE_WAYPOINT_STATE);
    });

    it('should handle ADD_WAYPOINTS', () => {
        expect(
            waypointsReducer(INITIAL_STATE, {
                type: 'ADD_WAYPOINT',
                waypoint: TEST_WAYPOINT,
            }),
        ).toEqual(ONE_WAYPOINT_STATE);
    });

    it('should handle DELETE_WAYPOINT', () => {
        expect(waypointsReducer(ONE_WAYPOINT_STATE, { type: 'DELETE_WAYPOINT', index: 0 })).toEqual(INITIAL_STATE);
    });

    it('should handle REVERSE_WAYPOINTS', () => {
        expect(waypointsReducer(TWO_WAYPOINTS_STATE, { type: 'REVERSE_WAYPOINTS' })).toEqual(
            TWO_WAYPOINTS_STATE_REVERSED,
        );
    });

    it.todo('should handle SET_ADDRESS');
    it.todo('should handle MOVE_WAYPOINT');
    it.todo('should handle MOVE_SELECTED_WAYPOINTS');
    it.todo('should handle SELECT_WAYPOINT');
    it.todo('should handle TOGGLE_WAYPOINT_SELECTION');
    it.todo('should handle SELECT_WAYPOINT_RANGE');
});
