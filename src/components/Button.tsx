import React, { ButtonHTMLAttributes, SyntheticEvent, useCallback } from 'react'
import styled from 'styled-components'

export const Button = styled((props: ButtonHTMLAttributes<HTMLButtonElement>) => {
    const preventFocus = useCallback((e: SyntheticEvent) => e.preventDefault(), [])

    return <button {...props} onMouseDown={preventFocus} />
})`
    --local-btn-background-color: transparent;
    --local-btn-text-color: var(--app-text-color);

    padding: var(--standard-vertical-padding) var(--standard-horizontal-padding);
    border-radius: var(--standard-border-radius);
    border: 1px solid var(--app-border-color);

    line-height: var(--standard-control-line-height);

    background-color: var(--local-btn-background-color);
    color: var(--local-btn-text-color);

    transition: opacity 0.1s;

    position: relative;
    overflow: hidden;

    &::after {
        content: "";

        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        transition: background-color 0.1s;
    }

    &:enabled {
        cursor: pointer;

        &:hover::after {
            background-color: var(--app-button-hover-highlight-color);
        }

        &:active::after {
            background-color: var(--app-button-active-highlight-color);
        }
    }

    &:focus {
        outline: none;
    }

    &:disabled {
        opacity: 0.5;
    }
`

export const PrimaryButton = styled(Button)`
    --local-btn-background-color: var(--apple-system-blue);
    --local-btn-text-color: white;
`

export const SecondaryButton = styled(Button)`
    --local-btn-background-color: var(--app-form-control-focus-color);
`

export const DangerButton = styled(Button)`
    --local-btn-background-color: var(--apple-system-red);
    --local-btn-text-color: white;
`

export const WarningButton = styled(Button)`
    --local-btn-background-color: var(--apple-system-yellow);
    --local-btn-text-color: rgba(0, 0, 0, 0.6);
`

const frostedBlurRadius = '128px'

export const FrostedButton = styled(Button)`
    background-color: var(--app-frost-fallback-color);

    @supports (backdrop-filter: blur(${frostedBlurRadius})) {
        backdrop-filter: blur(${frostedBlurRadius});
        background-color: var(--app-frost-color);
    }
`
