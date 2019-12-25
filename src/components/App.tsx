import React from 'react'
import { ProgressBar } from '../components/ProgressBar'
import { AppStateContext } from '../context/AppStateContext'
import { useAppState } from '../hooks/useAppState'
import store from '../redux/store'
import { MapButtons } from './MapButtons'
import { MapView } from './MapView'
import { WaypointEditor } from './WaypointEditor'

export const App = () => {
    // TODO: Replace with useReducer() - Need to handle redux-observable epics
    const [state, dispatch] = useAppState(store)

    return (
        <AppStateContext.Provider value={{ state, dispatch }}>
            <MapView />
            <ProgressBar />
            <MapButtons />
            <WaypointEditor />
        </AppStateContext.Provider>
    )
}
