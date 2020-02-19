import React from 'react'
import { useSelector } from 'react-redux'
import styled, { css } from 'styled-components'
import { useCompactMode } from '../../hooks/useCompactMode'
import { AppState } from '../../redux/state'
import { MapButtons } from './MapButtons'
import { MapView } from './MapView'

const Container = styled.div<{ fullscreen: boolean }>`
    position: absolute;
    left: 420px;
    right: 0;
    height: 100%;
    display: flex;
    flex-grow: 1;

    transition: left 0.2s;

    ${({ fullscreen }) =>
        fullscreen &&
        css`
            left: 0;
        `}
`

export const MapContainer = () => {
    const editorIsHidden = useSelector((state: AppState) => state.editorIsHidden)
    const compactMode = useCompactMode()

    return (
        <Container fullscreen={compactMode || editorIsHidden}>
            <MapView />
            <MapButtons />
        </Container>
    )
}
