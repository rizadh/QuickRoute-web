import React, { createContext, useEffect, useState } from 'react'
import { Store } from 'redux'
import ProgressBar from '../components/ProgressBar'
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
    setEditorIsCollapsed: (_: boolean) => { return },
})

export const App = (props: AppProps) => {
    const [editorIsCollapsed, setEditorIsCollapsed] = useState(false)

    useEffect(() => {
        const root = document.getElementById('root')
        if (!root) return

        if (editorIsCollapsed) {
            root.classList.add('editor-collapsed')
        } else {
            root.classList.remove('editor-collapsed')
        }
    }, [editorIsCollapsed])

    return (
        <AppContext.Provider value={{ editorIsCollapsed, setEditorIsCollapsed }}>
            <MapView store={props.store} />
            <ProgressBar />
            <MapButtons />
            <MapViewStatusbar />
            <WaypointEditor />
        </AppContext.Provider>
    )
}
