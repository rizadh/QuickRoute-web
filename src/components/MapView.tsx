import * as React from 'react'
import { Store, Unsubscribe } from 'redux'
import AppState from '../redux/state'
import AppAction from '../redux/actionTypes'
import { isEqual } from 'lodash'
import { disableAutofit } from '../redux/actions'
import { routeInformation } from '../redux/selectors'
import { fetchedRoutesKey } from '../redux/reducer'

type MapViewProps = {
    store: Store<AppState, AppAction>
}

export default class MapView extends React.Component<MapViewProps> {
    element?: HTMLElement
    map?: mapkit.Map
    loadingIndicator?: HTMLElement
    unsubscribeCallback?: Unsubscribe
    addresses: string[] = []
    places: string[] = []
    routes: string[] = []
    autofitIsEnabled: boolean = false

    updateMap = () => {
        if (!this.map) return
        if (!this.element) return

        const state = this.props.store.getState()
        const status = routeInformation(state).status

        if (status == 'FETCHING') {
            this.element.classList.add('updating')
            if (this.loadingIndicator) this.loadingIndicator.hidden = false
            return
        }

        this.element.classList.remove('updating')
        if (this.loadingIndicator) this.loadingIndicator.hidden = true

        if (status == 'FAILED') return

        if (
            isEqual(this.addresses, state.waypoints.map(w => w.address))
            && isEqual(this.places, Object.keys(state.fetchedPlaces))
            && isEqual(this.routes, Object.keys(state.fetchedRoutes))
        ) {
            if (this.autofitIsEnabled !== state.autofitIsEnabled) {
                this.autofitIsEnabled = state.autofitIsEnabled
                this.centerMap()
            }

            return
        }

        this.addresses = state.waypoints.map(w => w.address)
        this.places = Object.keys(state.fetchedPlaces)
        this.routes = Object.keys(state.fetchedRoutes)

        const annotations = this.addresses
            .map(address => state.fetchedPlaces[address])
            .filter((p): p is mapkit.Place => !!p)
            .map((place, index) => new mapkit.MarkerAnnotation(place.coordinate, {
                title: this.addresses[index],
                glyphText: `${index + 1}`,
                subtitle: place.formattedAddress,
                animates: false
            }))

        const overlays = state.waypoints
            .map((waypoint, index, waypoints) => {
                if (index === 0) return
                const previousWaypoint = waypoints[index - 1]
                const forwardRoute = state.fetchedRoutes[fetchedRoutesKey(previousWaypoint.address, waypoint.address)]
                if (forwardRoute) return forwardRoute.polyline
            })
            .filter((p): p is mapkit.PolylineOverlay => p !== undefined)
            .map(polyline =>
                new mapkit.PolylineOverlay(polyline.points, {
                    style: new mapkit.Style({
                        lineWidth: 5,
                        strokeOpacity: 0.75
                    })
                })
            )

        this.map.annotations && this.map.removeAnnotations(this.map.annotations)
        this.map.overlays && this.map.removeOverlays(this.map.overlays)

        this.map.addAnnotations(annotations)
        this.map.addOverlays(overlays)
        this.centerMap()
    }

    centerMap = () => {
        if (!this.map) return
        if (!this.props.store.getState().autofitIsEnabled) return

        this.map.showItems([...this.map.annotations || [], ...this.map.overlays], {
            animate: true, padding: new mapkit.Padding({
                top: 64,
                right: 64,
                bottom: 64,
                left: 64,
            })
        })
    }

    componentDidMount() {
        mapkit.init({
            authorizationCallback: done => fetch('https://route-planner.rizadh.com/token/')
                .then(res => res.text())
                .then(done)
        })

        const map = new mapkit.Map(this.element, {
            showsMapTypeControl: false,
            showsScale: mapkit.FeatureVisibility.Visible,
            showsPointsOfInterest: false,
            isRotationEnabled: false,
            padding: new mapkit.Padding({ top: 0, left: 0, right: 0, bottom: 48 })
        })

        const mapDidMove = () => {
            if (map.annotations && map.annotations.length > 0
                || map.overlays && map.overlays.length > 0)
                this.props.store.dispatch(disableAutofit())
        }

        map.addEventListener('zoom-start', mapDidMove)
        map.addEventListener('scroll-start', mapDidMove)

        this.map = map

        this.unsubscribeCallback = this.props.store.subscribe(this.updateMap)
    }

    componentWillUnmount() {
        if (this.map) this.map.destroy()
        if (this.unsubscribeCallback) this.unsubscribeCallback()
    }

    render() {
        return <>
            <div
                ref={e => this.element = e || undefined}
                className="mapview"
            />
            <div ref={e => this.loadingIndicator = e || undefined}
                className="loading-indicator rounded p-3 frosted text-dark"
                hidden>
                <i className="fas fa-spin fa-circle-notch"></i>
            </div>
        </>
    }
}
