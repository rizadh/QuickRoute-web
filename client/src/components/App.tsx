import React, { createContext } from 'react'
import { Store } from 'redux'
import ProgressBar from '../components/ProgressBar'
import { useEditorCollapsed } from '../hooks/editorCollapsed'
import { AppAction } from '../redux/actionTypes'
import { AppState } from '../redux/state'
import MapButtons from './MapButtons'
import MapView from './MapView'
import MapViewStatusbar from './MapViewStatusbar'
import WaypointEditor from './WaypointEditor'

type AppProps = {
    store: Store<AppState, AppAction>
}

export const AppContext = createContext({
    editorIsCollapsed: false,
    collapseEditor: () => { return },
    uncollapseEditor: () => { return },
})

export const App = (props: AppProps) => (
    <AppContext.Provider value={useEditorCollapsed()}>
        <MapView store={props.store} />
        <ProgressBar />
        <MapButtons />
        <MapViewStatusbar />
        <WaypointEditor />
    </AppContext.Provider>
)
