import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { animated, useTransition } from 'react-spring'
import styled from 'styled-components'
import { AppState } from '../redux/state'
import { Button, Variant } from './common/Button'

const Container = animated(styled.div`
    position: absolute;
    left: 0;
    right: 0;
    padding: var(--standard-margin);

    background-color: var(--error-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    border-bottom: var(--standard-border);

    color: white;
    font-weight: 500;
    overflow-wrap: break-word;

    display: flex;
    align-items: center;

    button {
        margin-right: var(--standard-margin);
        line-height: 1;
        flex-shrink: 0;
    }
`)

export const ErrorDialog = () => {
    const error = useSelector((state: AppState) => state.error)
    const dispatch = useDispatch()
    const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), [])

    const containerTransitions = useTransition(error, null, {
        from: { transform: 'translateY(-100%)', opacity: 0 },
        enter: { transform: 'translateY(0%)', opacity: 1 },
        leave: { transform: 'translateY(-100%)', opacity: 0 },
        config: { mass: 1, tension: 350, friction: 35 },
    })

    return (
        <>
            {containerTransitions.map(
                ({ item, key, props }) =>
                    item && (
                        <Container key={key} style={props}>
                            <Button variant={Variant.Secondary} onClick={clearError}>
                                <i className="fa fa-fw fa-times" />
                            </Button>
                            {item}
                        </Container>
                    ),
            )}
        </>
    )
}
