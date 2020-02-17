import { hot } from 'react-hot-loader'

import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { ProgressBar } from '../components/ProgressBar'
import { useCompactMode } from '../hooks/useCompactMode'
import { AppState } from '../redux/state'
import { WaypointEditor } from './editor/WaypointEditor'
import { MapButtons } from './map/MapButtons'
import { MapContainer } from './map/MapContainer'
import { MapView } from './map/MapView'

const Container = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
`

export const App = hot(module)(() => {
    const editorIsHidden = useSelector((state: AppState) => state.editorIsHidden)
    const compactMode = useCompactMode()

    return (
        <Container>
            {!editorIsHidden && <WaypointEditor />}
            <MapContainer hidden={compactMode && !editorIsHidden}>
                <MapView />
                <MapButtons />
            </MapContainer>
            <ProgressBar />
        </Container>
    )
})
