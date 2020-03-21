import { hot } from 'react-hot-loader'

import React from 'react'
import { ProgressBar } from '../components/ProgressBar'
import { Editor } from './editor/Editor'
import { ErrorDialog } from './ErrorDialog'
import { MapContainer } from './map/MapContainer'
import { ImportDialog } from './ImportDialog'
import { useSelector } from 'react-redux'
import { AppState } from '../redux/state'

export const App = hot(module)(() => {
    const importDialogIsShown = useSelector((state: AppState) => state.importDialogIsShown)

    return (
        <>
            <MapContainer />
            <Editor />
            <ProgressBar />
            <ErrorDialog />
            {importDialogIsShown && <ImportDialog />}
        </>
    )
})
