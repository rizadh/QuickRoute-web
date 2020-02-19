import { hot } from 'react-hot-loader'

import React from 'react'
import { ProgressBar } from '../components/ProgressBar'
import { WaypointEditor } from './editor/WaypointEditor'
import { MapContainer } from './map/MapContainer'

export const App = hot(module)(() => (
    <>
        <MapContainer />
        <WaypointEditor />
        <ProgressBar />
    </>
))
