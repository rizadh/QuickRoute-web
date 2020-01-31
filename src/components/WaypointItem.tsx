import React, { Dispatch, useCallback } from 'react'
import { Draggable, DraggableProvided } from 'react-beautiful-dnd'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { useInput } from '../hooks/useInput'
import { AppAction } from '../redux/actionTypes'
import { AppState } from '../redux/state'
import { isValidAddress } from '../redux/validator'
import { DangerButton, SecondaryButton } from './Button'

type WaypointItemProps = {
    index: number;
    isBeingDraggedAlong: boolean;
}

const StyledWaypointItem = styled.div<{ isBeingDraggedAlong: boolean }>`
    ${({ isBeingDraggedAlong }) => isBeingDraggedAlong && 'opacity: 0.5;'}

    display: flex;
    align-items: center;

    transition: opacity 0.2s;

    margin-right: var(--standard-margin);
    margin-bottom: var(--standard-margin);

    > * {
        border-radius: var(--standard-border-radius);
        padding: var(--standard-padding);
        line-height: var(--standard-control-line-height);
    }

    > :not(input) {
        flex-shrink: 0;
    }

    > input {
        flex-grow: 1;
        min-width: 0;
    }

    > :not(:last-child) {
        margin-right: calc(var(--standard-margin) / 2);
    }
`

const WaypointIndex = styled.span<{ isSelected: boolean }>`
    ${({ isSelected }) => isSelected && 'color: white;'}
    background-color: var(${({ isSelected }) => (isSelected ? '--apple-system-blue' : '--app-input-row-span-color')});
    border: 1px solid var(--app-border-color);

    font-variant-numeric: tabular-nums;

    i {
        opacity: ${({ isSelected }) => (isSelected ? '1' : '0.5')};
    }
`

const StyledSpan = styled.span`
    background-color: var(--app-input-row-span-color);
    border: 1px solid var(--app-border-color);
`

export const WaypointItem = ({ index, isBeingDraggedAlong }: WaypointItemProps) => {
    const dispatch: Dispatch<AppAction> = useDispatch()
    const waypoint = useSelector((state: AppState) => state.waypoints[index])
    const isOriginalAddress = (value: string) => value.trim() === waypoint.address

    const { value: waypointFieldValue, props: waypointFieldProps, resetValue: resetWaypointField } = useInput({
        initialValue: waypoint.address,
        predicate: value => !isOriginalAddress(value) && isValidAddress(value),
        onCommit: useCallback(newAddress => dispatch({ type: 'SET_ADDRESS', index, address: newAddress }), [index]),
    })

    const deleteWaypoint = useCallback(() => dispatch({ type: 'DELETE_WAYPOINT', index }), [index])

    const placeFetchResult = useSelector((state: AppState) => state.fetchedPlaces[waypoint.address])

    const incomingRouteFetchResult = useSelector((state: AppState) =>
        index !== 0
            ? state.fetchedRoutes[state.waypoints[index - 1].address]?.[state.waypoints[index].address]
            : undefined,
    )

    const outgoingRouteFetchResult = useSelector((state: AppState) =>
        index !== state.waypoints.length - 1
            ? state.fetchedRoutes[state.waypoints[index].address]?.[state.waypoints[index + 1].address]
            : undefined,
    )

    const itemWasClicked = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()

            if (e.shiftKey) {
                dispatch({ type: 'SELECT_WAYPOINT_RANGE', index })
            } else if (e.ctrlKey || e.metaKey) {
                dispatch({ type: 'TOGGLE_WAYPOINT_SELECTION', index })
            } else {
                dispatch({ type: 'SELECT_WAYPOINT', index })
            }
        },
        [index, dispatch],
    )

    const fetchIsInProgress =
        placeFetchResult?.status === 'IN_PROGRESS' ||
        incomingRouteFetchResult?.status === 'IN_PROGRESS' ||
        outgoingRouteFetchResult?.status === 'IN_PROGRESS'

    const fetchFailed =
        placeFetchResult?.status === 'FAILED' ||
        incomingRouteFetchResult?.status === 'FAILED' ||
        outgoingRouteFetchResult?.status === 'FAILED'

    const failureMessage =
        placeFetchResult?.status === 'FAILED'
            ? 'Could not find this waypoint'
            : incomingRouteFetchResult?.status === 'FAILED' && outgoingRouteFetchResult?.status === 'FAILED'
            ? 'Could not find route to or from this waypoint'
            : incomingRouteFetchResult?.status === 'FAILED'
            ? 'Could not find route from last waypoint'
            : outgoingRouteFetchResult?.status === 'FAILED'
            ? 'Could not find route to next waypoint'
            : undefined

    const failureIcon =
        placeFetchResult?.status === 'FAILED' ? (
            <i className="far fa-fw fa-dot-circle" />
        ) : incomingRouteFetchResult?.status === 'FAILED' && outgoingRouteFetchResult?.status === 'FAILED' ? (
            <i className="fas fa-fw fa-rotate-90 fa-exchange-alt" />
        ) : incomingRouteFetchResult?.status === 'FAILED' ? (
            <i className="fas fa-fw fa-long-arrow-alt-up" />
        ) : outgoingRouteFetchResult?.status === 'FAILED' ? (
            <i className="fas fa-fw fa-long-arrow-alt-down" />
        ) : null

    return (
        <Draggable index={index} draggableId={waypoint.uuid}>
            {(provided: DraggableProvided) => (
                <StyledWaypointItem
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    isBeingDraggedAlong={isBeingDraggedAlong}
                >
                    <WaypointIndex
                        isSelected={!!waypoint.selected}
                        title="Drag to reorder"
                        onClick={itemWasClicked}
                        {...provided.dragHandleProps}
                    >
                        <i className="fas fa-fw fa-grip-vertical" /> {index + 1}
                    </WaypointIndex>
                    <input className="form-control" {...waypointFieldProps} />
                    {!isOriginalAddress(waypointFieldValue) && (
                        <SecondaryButton onClick={resetWaypointField}>
                            <i className="fas fa-fw fa-undo" />
                        </SecondaryButton>
                    )}
                    {fetchFailed && (
                        <StyledSpan className="text-danger" title={failureMessage}>
                            {failureIcon}
                        </StyledSpan>
                    )}
                    {fetchIsInProgress && (
                        <StyledSpan className="text-secondary">
                            <i className="fas fa-fw fa-circle-notch fa-spin" />
                        </StyledSpan>
                    )}
                    <DangerButton onClick={deleteWaypoint} title="Delete waypoint">
                        <i className="fas fa-fw fa-trash" />
                    </DangerButton>
                </StyledWaypointItem>
            )}
        </Draggable>
    )
}
