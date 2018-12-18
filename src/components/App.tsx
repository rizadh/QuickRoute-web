import * as React from 'react'
import WaypointEditor from './WaypointEditor'
import MapView from './MapView'
import { Store } from 'redux'
import AppState from '../redux/state'
import AppAction from '../redux/actionTypes'
import MapViewStatusbar from './MapViewStatusbar'
import AutofitButton from './AutofitButton'
import ProgressBar from '../components/ProgressBar'

type AppProps = {
    store: Store<AppState, AppAction>
}

export default class App extends React.Component<AppProps> {
    render() {
        return <>
            <MapView store={this.props.store} />
            <ProgressBar />
            <AutofitButton />
            <MapViewStatusbar />
            <WaypointEditor />
        </>
    }
}