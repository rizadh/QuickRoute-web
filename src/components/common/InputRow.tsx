import styled from 'styled-components';

export const InputRow = styled.div`
    display: flex;
    align-items: center;

    > :not(:last-child) {
        margin-right: calc(var(--standard-margin) / 2);
    }

    > input,
    > textarea {
        flex-grow: 1;
        min-width: 0;
    }

    > :not(input, textarea) {
        flex-shrink: 0;
    }
`;
