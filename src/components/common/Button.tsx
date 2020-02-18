import React, { ButtonHTMLAttributes, SyntheticEvent, useCallback } from 'react'
import styled from 'styled-components'

const StyledButton = styled.button`
    --local-btn-background-color: var(--tertiary-fill-color);
    --local-btn-text-color: var(--primary-text-color);

    padding: var(--standard-padding);
    border-radius: var(--standard-border-radius);
    border: var(--standard-border);

    font-weight: 500;
    line-height: var(--standard-control-line-height);

    background-color: var(--local-btn-background-color);
    color: var(--local-btn-text-color);

    transition: opacity 0.2s;

    position: relative;
    overflow: hidden;

    &.transition-enter {
        transform: scale(0.8);
        opacity: 0;
    }

    &.transition-enter-active {
        transform: none;
        opacity: 1;

        transition: opacity 0.2s, transform 0.2s;
    }

    &.transition-exit {
        transform: none;
        opacity: 1;
    }

    &.transition-exit-active {
        opacity: 0;

        transition: opacity 0.2s;
    }

    &::after {
        content: "";

        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        transition: background-color 0.2s;
    }

    &:enabled {
        cursor: pointer;

        @media (hover: hover) {
            &:hover::after {
                background-color: var(--button-hover-highlight-color);
            }
        }

        &:active::after {
            background-color: var(--button-active-highlight-color);
        }
    }

    &:focus {
        outline: none;
    }

    &:disabled {
        opacity: 0.5;
    }
`

const Button = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
    const preventFocus = useCallback((e: SyntheticEvent) => e.preventDefault(), [])

    return <StyledButton {...props} onMouseDown={preventFocus} />
}

export const PrimaryButton = styled(Button)`
    --local-btn-background-color: var(--accent-color);
    --local-btn-text-color: white;
`

export const SecondaryButton = styled(Button)`
    --local-btn-background-color: var(--tertiary-fill-color);
    --local-btn-text-color: var(--primary-text-color);
`

export const DangerButton = styled(Button)`
    --local-btn-background-color: var(--error-color);
    --local-btn-text-color: white;
`

export const WarningButton = styled(Button)`
    --local-btn-background-color: var(--apple-system-yellow);
    --local-btn-text-color: rgba(0, 0, 0, 0.6);
`
