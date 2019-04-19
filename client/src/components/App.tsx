import React from 'react'
import { ProgressBar } from '../components/ProgressBar'
import { AppStateContext } from '../context/AppStateContext'
import { EditorVisibilityContext } from '../context/EditorVisibilityContext'
import { useAppState } from '../hooks/useAppState'
import { useEditorVisibility } from '../hooks/useEditorCollapsed'
import store from '../redux/store'
import { MapButtons } from './MapButtons'
import { MapView } from './MapView'
import { MapViewStatusbar } from './MapViewStatusbar'
import WaypointEditor from './WaypointEditor'

export const App = () => {
    const editorVisibility = useEditorVisibility()
    const [state, dispatch] = useAppState(store)

    return (
        <EditorVisibilityContext.Provider value={editorVisibility}>
            <AppStateContext.Provider value={{ state, dispatch }}>
                <MapView />
                <ProgressBar />
                <MapButtons />
                {!editorVisibility.editorIsHidden && <MapViewStatusbar />}
                {!editorVisibility.editorIsHidden && <WaypointEditor />}
            </AppStateContext.Provider>
        </EditorVisibilityContext.Provider>
    )
}
