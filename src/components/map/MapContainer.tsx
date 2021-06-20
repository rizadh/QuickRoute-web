import React from 'react'
import { useSelector } from 'react-redux'
import { animated, useSpring } from 'react-spring'
import styled from 'styled-components'
import { useCompactMode } from '../../hooks/useCompactMode'
import { AppState } from '../../redux/state'
import { MapButtons } from './MapButtons'
import { MapView } from './MapView'

const Container = animated(styled.div`
    position: absolute;
    left: 0;
    right: 0;
    height: 100%;
    display: flex;
    flex-grow: 1;
`)

export const MapContainer = () => {
    const editorIsHidden = useSelector((state: AppState) => state.editorIsHidden)
    const compactMode = useCompactMode()
    const showMap = !compactMode || editorIsHidden

    const props = useSpring({
        transform: `translateX(${showMap ? 0 : 50}%)`,
        config: { mass: 1, tension: 350, friction: 35 },
    })

    return (
        <Container style={props}>
            <MapView />
            <MapButtons />
        </Container>
    )
}
