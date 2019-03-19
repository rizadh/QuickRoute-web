import { zip } from 'lodash'
import * as React from 'react'
import { Store, Unsubscribe } from 'redux'
import { disableAutofit } from '../redux/actions'
import { AppAction } from '../redux/actionTypes'
import { routeInformation } from '../redux/selectors'
import { AppState, FetchSuccess, Waypoint } from '../redux/state'

type MapViewProps = {
    store: Store<AppState, AppAction>
}

export default class MapView extends React.Component<MapViewProps> {
    element?: HTMLElement
    map?: mapkit.Map
    loadingIndicator?: HTMLElement
    unsubscribeCallback?: Unsubscribe
    previousState?: AppState

    updateMap = () => {
        if (!this.map) return
        if (!this.element) return
        if (!this.loadingIndicator) return

        const previousState = this.previousState
        const currentState = this.props.store.getState()
        this.previousState = currentState

        if (previousState === currentState) return

        const status = routeInformation(currentState).status

        if (status === 'FETCHING') {
            this.element.classList.add('updating')
            if (this.loadingIndicator) this.loadingIndicator.hidden = false
        } else {
            this.element.classList.remove('updating')
            if (this.loadingIndicator) this.loadingIndicator.hidden = true
        }

        // TODO: Determine if the list of fetched places and routes has changed
        if (status !== 'FETCHED' && status !== 'NO_ROUTE') return

        if (previousState
            && this.waypointsAreSimilar(previousState.waypoints, currentState.waypoints)
            && previousState.fetchedPlaces === currentState.fetchedPlaces
            && previousState.fetchedRoutes === currentState.fetchedRoutes) {
            if (currentState.autofitIsEnabled) this.centerMap()
            return
        }

        const annotations = currentState.waypoints
            .map(({ address }) => currentState.fetchedPlaces.get(address))
            .filter((p): p is FetchSuccess<mapkit.Place> => !!p && p.status === 'SUCCESS')
            .map(({ result: { coordinate, formattedAddress } }, index) => new mapkit.MarkerAnnotation(coordinate, {
                glyphText: `${index + 1}`,
                title: currentState.waypoints[index].address,
                subtitle: formattedAddress,
                animates: false,
            }))

        const overlays = currentState.waypoints
            .map((waypoint, index, waypoints) => {
                if (index === 0) return
                const previousWaypoint = waypoints[index - 1]
                const routesFromPreviousWaypoint = currentState.fetchedRoutes.get(previousWaypoint.address)
                if (!routesFromPreviousWaypoint) return
                const forwardRoute = routesFromPreviousWaypoint.get(waypoint.address)
                if (forwardRoute && forwardRoute.status === 'SUCCESS') return forwardRoute.result.polyline
            })
            .filter((p): p is mapkit.PolylineOverlay => !!p)
            .map(polyline =>
                new mapkit.PolylineOverlay(polyline.points, {
                    style: new mapkit.Style({
                        lineWidth: 5,
                        strokeOpacity: 0.75,
                    }),
                }),
            )

        if (this.map.annotations) this.map.removeAnnotations(this.map.annotations)
        if (this.map.overlays) this.map.removeOverlays(this.map.overlays)

        this.map.addAnnotations(annotations)
        this.map.addOverlays(overlays)
        this.centerMap()
    }

    waypointsAreSimilar = (a: ReadonlyArray<Waypoint>, b: ReadonlyArray<Waypoint>) => {
        if (a.length !== b.length) return false

        for (const [itemA, itemB] of zip(a, b)) {
            if (!itemA || !itemB) return false

            if (itemA.address !== itemB.address) return false
        }

        return true
    }

    centerMap = () => {
        if (!this.map) return
        if (!this.element) return
        if (!this.props.store.getState().autofitIsEnabled) return

        this.map.showItems([...this.map.annotations || [], ...this.map.overlays], {
            animate: true,
            padding: new mapkit.Padding({
                top: 16,
                right: 16,
                bottom: 16,
                left: 16,
            }),
        })
    }

    componentDidMount() {
        mapkit.init({
            authorizationCallback: done => fetch('/token')
                .then(res => res.text())
                .then(done),
        })

        const map = new mapkit.Map(this.element, {
            showsMapTypeControl: false,
            showsScale: mapkit.FeatureVisibility.Visible,
            padding: new mapkit.Padding({ top: 0, left: 0, right: 0, bottom: 48 }),
        })

        const mapDidMove = () => {
            if (map.annotations && map.annotations.length > 0 || map.overlays && map.overlays.length > 0) {
                this.props.store.dispatch(disableAutofit())
            }
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
        return (
            <>
                <div
                    ref={e => this.element = e || undefined}
                    id="mapview"
                />
                <div
                    ref={e => this.loadingIndicator = e || undefined}
                    id="loading-indicator"
                    className="rounded p-3 frosted"
                    hidden={true}
                >
                    <i className="fas fa-spin fa-circle-notch" />
                </div>
            </>
        )
    }
}
