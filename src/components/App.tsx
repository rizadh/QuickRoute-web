import { hot } from 'react-hot-loader'

import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { ProgressBar } from '../components/ProgressBar'
import { AppState } from '../redux/state'
import { WaypointEditor } from './editor/WaypointEditor'
import { MapContainer } from './map/MapContainer'

const Container = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
`

export const App = hot(module)(() => {
    const editorIsHidden = useSelector((state: AppState) => state.editorIsHidden)

    return (
        <Container>
            {!editorIsHidden && <WaypointEditor />}
            <MapContainer />
            <ProgressBar />
        </Container>
    )
})
