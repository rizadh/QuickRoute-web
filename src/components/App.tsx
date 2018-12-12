import * as React from 'react'
import WaypointEditor from './WaypointEditor'
import MapView from './MapView'
import { Store } from 'redux'
import AppState from '../redux/state'
import AppAction from '../redux/actionTypes'
import MapViewToolbar from './MapViewToolbar'
import AutofitButton from './AutofitButton'

interface AppProps {
    store: Store<AppState, AppAction>
}

export default class App extends React.Component<AppProps> {
    render() {
        return <>
            <MapView store={this.props.store} />
            <AutofitButton />
            <MapViewToolbar />
            <WaypointEditor />
        </>
    }
}