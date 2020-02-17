import styled, { css } from 'styled-components'

export const MapContainer = styled.div<{ hidden: boolean }>`
    position: relative;
    display: flex;
    flex-grow: 1;

    /* Must use 'display: none' because removing MapContainer leads to empty map */
    ${({ hidden }) =>
        hidden &&
        css`
            display: none;
        `}
`
