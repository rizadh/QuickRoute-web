import React from 'react'
import { useSelector } from 'react-redux'
import styled, { css } from 'styled-components'
import { useCompactMode } from '../../hooks/useCompactMode'
import { AppState } from '../../redux/state'
import { MapButtons } from './MapButtons'
import { MapView } from './MapView'

const Container = styled.div<{ hidden: boolean }>`
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

export const MapContainer = () => {
    const editorIsHidden = useSelector((state: AppState) => state.editorIsHidden)
    const compactMode = useCompactMode()

    return (
        <Container hidden={compactMode && !editorIsHidden}>
            <MapView />
            <MapButtons />
        </Container>
    )
}
