import React, { ButtonHTMLAttributes, SyntheticEvent, useCallback } from 'react';
import styled, { css } from 'styled-components';

export enum Variant {
    Primary,
    Secondary,
    Danger,
    Warning,
}

export const Button = styled((props: ButtonHTMLAttributes<HTMLButtonElement>) => {
    const preventFocus = useCallback((e: SyntheticEvent) => e.preventDefault(), []);

    return <button {...props} onMouseDown={preventFocus} />;
})`
    ${({ variant }: { variant: Variant }) => {
        switch (variant) {
            case Variant.Primary:
                return css`
                    background-color: var(--accent-color);
                    color: white;
                `;
            case Variant.Secondary:
                return css`
                    background-color: var(--tertiary-fill-color);
                    color: var(--primary-text-color);
                `;
            case Variant.Danger:
                return css`
                    background-color: var(--error-color);
                    color: white;
                `;
            case Variant.Warning:
                return css`
                    background-color: var(--apple-system-yellow);
                    color: rgba(0, 0, 0, 0.6);
                `;
        }
    }};

    padding: var(--standard-padding);
    border-radius: var(--standard-border-radius);
    border: var(--standard-border);

    font-weight: 500;
    line-height: var(--standard-control-line-height);

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
        content: '';

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
`;
