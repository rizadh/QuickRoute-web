import { hot } from 'react-hot-loader'

import React from 'react'
import { ProgressBar } from '../components/ProgressBar'
import { Editor } from './editor/Editor'
import { ErrorDialog } from './ErrorDialog'
import { MapContainer } from './map/MapContainer'
import { ImportDialog } from './ImportDialog'
import { useSelector } from 'react-redux'
import { AppState } from '../redux/state'
import { OptimizeDialog } from './OptimizeDialog'
import { NavigationDialog } from './NavigationDialog'

export const App = hot(module)(() => {
    const importDialogIsShown = useSelector((state: AppState) => state.importDialogIsShown)
    const optimizeDialogIsShown = useSelector((state: AppState) => state.optimizeDialogIsShown)
    const navigationDialogIsShown = useSelector((state: AppState) => state.navigationDialogIsShown)

    return (
        <>
            <MapContainer />
            <Editor />
            <ProgressBar />
            <ErrorDialog />
            {importDialogIsShown && <ImportDialog />}
            {optimizeDialogIsShown && <OptimizeDialog />}
            {navigationDialogIsShown && <NavigationDialog />}
        </>
    )
})
