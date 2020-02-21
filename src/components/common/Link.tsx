import styled from 'styled-components'

export const Link = styled.a`
    color: var(--accent-color);
    text-decoration: none;

    @media (hover: hover) {
        :hover {
            text-decoration: underline;
        }
    }
`
