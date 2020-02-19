import { hot } from 'react-hot-loader'

import React from 'react'
import { useSelector } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import { ProgressBar } from '../components/ProgressBar'
import { AppState } from '../redux/state'
import { WaypointEditor } from './editor/WaypointEditor'
import { MapContainer } from './map/MapContainer'

export const App = hot(module)(() => {
    const editorIsHidden = useSelector((state: AppState) => state.editorIsHidden)

    return (
        <>
            <MapContainer />
            <CSSTransition in={!editorIsHidden} timeout={200} unmountOnExit={true} classNames="transition">
                <WaypointEditor />
            </CSSTransition>
            <ProgressBar />
        </>
    )
})
