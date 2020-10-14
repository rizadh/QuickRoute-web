import styled from 'styled-components'

export const Input = styled.input`
    padding: var(--standard-padding);
    border-radius: var(--standard-border-radius);

    appearance: none;
    outline: none;

    box-shadow: none;

    line-height: var(--standard-control-line-height);

    color: var(--primary-text-color);

    transition: background-color 0.2s, border 0.2s;
    background-color: var(--input-color);
    border: var(--standard-border);
    border-color: var(--input-border-color);

    &::placeholder {
        color: var(--secondary-text-color);
    }

    @media (hover: hover) {
        &:not(:read-only):hover {
            background-color: var(--input-focus-color);
        }
    }

    &:not(:read-only):focus {
        background-color: var(--input-focus-color);
        border-color: var(--accent-color);
    }

    :read-only {
        background-color: var(--input-disabled-color);
        color: var(--secondary-text-color);
    }
`

export const Checkbox = styled.input`
    appearance: none;

    width: 24px;
    height: 24px;

    background-color: var(--input-color);

    &:checked {
        background-color: var(--accent-color);

        &::after {
            content: '\u2713';
        }
    }

    border-radius: calc(var(--standard-border-radius) / 2);
    border: var(--standard-border);

    font-weight: 500;
    line-height: var(--standard-control-line-height);

    transition: opacity 0.2s;

    position: relative;
    overflow: hidden;

    &::after {
        content: '';

        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        text-align: center;
        color: white;

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
