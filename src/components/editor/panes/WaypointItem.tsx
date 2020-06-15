import React, { Dispatch, useCallback } from 'react';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useInput } from '../../../hooks/useInput';
import { AppAction } from '../../../redux/actionTypes';
import { AppState } from '../../../redux/state';
import { isValidAddress } from '../../../redux/validator';
import { Button, Variant } from '../../common/Button';
import { Input } from '../../common/Input';
import { InputRow } from '../../common/InputRow';

const Container = styled(InputRow)`
    transition: opacity 0.2s;

    ${({ isBeingDraggedAlong }: { isBeingDraggedAlong: boolean }) => isBeingDraggedAlong && 'opacity: 0.5;'}
`;

const DragHandle = styled.span<{ isSelected: boolean }>`
    padding: var(--standard-padding);

    border: var(--standard-border);
    border-radius: var(--standard-border-radius);

    color: ${({ isSelected }) => (isSelected ? 'white' : 'var(--primary-text-color)')};
    line-height: var(--standard-control-line-height);
    font-variant-numeric: tabular-nums;
    font-weight: 500;

    background-color: var(${({ isSelected }) => (isSelected ? '--accent-color' : '--tertiary-fill-color')});
`;

const StatusIndicator = styled.span`
    padding: var(--standard-padding);

    background-color: var(--secondary-fill-color);

    border: var(--standard-border);
    border-radius: var(--standard-border-radius);

    line-height: var(--standard-control-line-height);
`;
const SecondaryStatusIndicator = styled(StatusIndicator)`
    color: var(--secondary-text-color);
`;
const DangerStatusIndicator = styled(StatusIndicator)`
    color: var(--error-color);
`;

type WaypointItemProps = {
    index: number;
    isBeingDraggedAlong: boolean;
};

export const WaypointItem = ({ index, isBeingDraggedAlong }: WaypointItemProps) => {
    const dispatch: Dispatch<AppAction> = useDispatch();
    const waypoint = useSelector((state: AppState) => state.waypoints[index]);
    const isOriginalAddress = (value: string) => value.trim() === waypoint.address;

    const {
        value: waypointFieldValue,
        props: waypointFieldProps,
        resetValue: resetWaypointField,
        commitValue: commitWaypointField,
    } = useInput({
        initialValue: waypoint.address,
        predicate: value => !isOriginalAddress(value) && isValidAddress(value),
        onCommit: useCallback(newAddress => dispatch({ type: 'SET_ADDRESS', index, address: newAddress }), [index]),
    });

    const deleteWaypoint = useCallback(() => dispatch({ type: 'DELETE_WAYPOINT', index }), [index]);

    const placeFetchResult = useSelector((state: AppState) => state.fetchedPlaces[waypoint.address]);

    const incomingRouteFetchResult = useSelector((state: AppState) =>
        index !== 0
            ? state.fetchedRoutes[state.waypoints[index - 1].address]?.[state.waypoints[index].address]
            : undefined,
    );

    const outgoingRouteFetchResult = useSelector((state: AppState) =>
        index !== state.waypoints.length - 1
            ? state.fetchedRoutes[state.waypoints[index].address]?.[state.waypoints[index + 1].address]
            : undefined,
    );

    const itemWasClicked = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();

            if (e.shiftKey) {
                dispatch({ type: 'SELECT_WAYPOINT_RANGE', index });
            } else if (e.ctrlKey || e.metaKey) {
                dispatch({ type: 'TOGGLE_WAYPOINT_SELECTION', index });
            } else {
                dispatch({ type: 'SELECT_WAYPOINT', index });
            }
        },
        [index, dispatch],
    );

    const fetchIsInProgress =
        placeFetchResult?.status === 'IN_PROGRESS' ||
        incomingRouteFetchResult?.status === 'IN_PROGRESS' ||
        outgoingRouteFetchResult?.status === 'IN_PROGRESS';

    const fetchFailed =
        placeFetchResult?.status === 'FAILED' ||
        incomingRouteFetchResult?.status === 'FAILED' ||
        outgoingRouteFetchResult?.status === 'FAILED';

    const failureMessage =
        placeFetchResult?.status === 'FAILED'
            ? 'Could not find this waypoint'
            : incomingRouteFetchResult?.status === 'FAILED' && outgoingRouteFetchResult?.status === 'FAILED'
            ? 'Could not find route to or from this waypoint'
            : incomingRouteFetchResult?.status === 'FAILED'
            ? 'Could not find route from last waypoint'
            : outgoingRouteFetchResult?.status === 'FAILED'
            ? 'Could not find route to next waypoint'
            : undefined;

    const failureIcon =
        placeFetchResult?.status === 'FAILED' ? (
            <i className="far fa-fw fa-dot-circle" />
        ) : incomingRouteFetchResult?.status === 'FAILED' && outgoingRouteFetchResult?.status === 'FAILED' ? (
            <i className="fas fa-fw fa-rotate-90 fa-exchange-alt" />
        ) : incomingRouteFetchResult?.status === 'FAILED' ? (
            <i className="fas fa-fw fa-long-arrow-alt-up" />
        ) : outgoingRouteFetchResult?.status === 'FAILED' ? (
            <i className="fas fa-fw fa-long-arrow-alt-down" />
        ) : null;

    return (
        <Draggable index={index} draggableId={waypoint.uuid}>
            {(provided: DraggableProvided) => (
                <Container
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    isBeingDraggedAlong={isBeingDraggedAlong}
                >
                    <DragHandle
                        isSelected={!!waypoint.selected}
                        title="Drag to reorder or click to select"
                        onClick={itemWasClicked}
                        {...provided.dragHandleProps}
                    >
                        <i className="fas fa-fw fa-grip-vertical" /> {index + 1}
                    </DragHandle>
                    <Input {...waypointFieldProps} />
                    {isOriginalAddress(waypointFieldValue) ? (
                        <>
                            {fetchFailed && (
                                <DangerStatusIndicator title={failureMessage}>{failureIcon}</DangerStatusIndicator>
                            )}
                            {fetchIsInProgress && (
                                <SecondaryStatusIndicator title="Loading">
                                    <i className="fas fa-fw fa-circle-notch fa-spin" />
                                </SecondaryStatusIndicator>
                            )}
                            <Button variant={Variant.Danger} onClick={deleteWaypoint} title="Delete waypoint">
                                <i className="fas fa-fw fa-trash-alt" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant={Variant.Secondary} onClick={resetWaypointField} title="Revert waypoint">
                                <i className="fas fa-fw fa-times" />
                            </Button>
                            <Button variant={Variant.Primary} onClick={commitWaypointField} title="Change waypoint">
                                <i className="fas fa-fw fa-check" />
                            </Button>
                        </>
                    )}
                </Container>
            )}
        </Draggable>
    );
};
