import React from 'react'
import { Store } from 'redux'
import ProgressBar from '../components/ProgressBar'
import { EditorVisibilityContext } from '../context/EditorVisibilityContext'
import { useEditorVisibility } from '../hooks/useEditorCollapsed'
import { AppAction } from '../redux/actionTypes'
import { AppState } from '../redux/state'
import MapButtons from './MapButtons'
import MapView from './MapView'
import MapViewStatusbar from './MapViewStatusbar'
import WaypointEditor from './WaypointEditor'

type AppProps = {
    store: Store<AppState, AppAction>
}

export const App = (props: AppProps) => (
    <EditorVisibilityContext.Provider value={useEditorVisibility()}>
        <MapView store={props.store} />
        <ProgressBar />
        <MapButtons />
        <MapViewStatusbar />
        <WaypointEditor />
    </EditorVisibilityContext.Provider>
)
