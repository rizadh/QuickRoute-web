import * as React from 'react'
import { Store } from 'redux'
import ProgressBar from '../components/ProgressBar'
import {AppAction} from '../redux/actionTypes'
import {AppState} from '../redux/state'
import AutofitButton from './AutofitButton'
import MapView from './MapView'
import MapViewStatusbar from './MapViewStatusbar'
import WaypointEditor from './WaypointEditor'

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
