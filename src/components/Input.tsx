import styled from 'styled-components'

export const Input = styled.input`
    padding: var(--standard-padding);
    border-radius: var(--standard-border-radius);

    appearance: none;
    outline: none;

    box-shadow: none;

    line-height: var(--standard-control-line-height);

    color: var(--app-primary-text-color);

    transition: background-color 0.2s, border 0.2s;
    background-color: var(--app-form-control-color);
    border: 1px solid var(--app-border-color);

    &::placeholder {
        color: var(--app-secondary-text-color);
    }

    &:not(:read-only):focus {
        background-color: var(--app-form-control-focus-color);

        border: 1px solid var(--apple-system-blue);
    }
`
