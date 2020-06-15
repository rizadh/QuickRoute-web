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
