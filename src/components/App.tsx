import { hot } from 'react-hot-loader'

import React from 'react'
import { Provider } from 'react-redux'
import { ProgressBar } from '../components/ProgressBar'
import store from '../redux/store'
import { MapButtons } from './MapButtons'
import { MapView } from './MapView'
import { WaypointEditor } from './WaypointEditor'

export const App = hot(module)(() => (
    <Provider store={store}>
        <MapView />
        <ProgressBar />
        <MapButtons />
        <WaypointEditor />
    </Provider>
))
