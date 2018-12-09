import * as React from 'react'
import { Store, Unsubscribe } from 'redux'
import AppState, { Waypoint } from '../redux/state'
import AppAction from '../redux/actionTypes'
import { isEqual } from 'lodash'
import { geocodeSuccess, geocodeFailure, setRouteInformation, disableAutofit, beginMapUpdate, finishMapUpdate } from '../redux/actions'
import store from '../redux/store';

interface MapViewProps {
    store: Store<AppState, AppAction>
}

const geocoder = new mapkit.Geocoder({ getsUserLocation: true })
const placeCache = new Map<string, mapkit.Place>()
const geocodeRequests = new Map<string, number>()

export default class MapView extends React.Component<MapViewProps> {
    element?: HTMLElement
    map?: mapkit.Map
    unsubscribeCallback?: Unsubscribe
    addresses: string[] = []

    geocodeWaypoint = async (address: string) => {
        const cachedPlace = placeCache.get(address)
        if (cachedPlace) return cachedPlace

        return new Promise<mapkit.Place>((resolve, reject) => {
            const previousRequestId = geocodeRequests.get(address)
            if (previousRequestId) geocoder.cancel(previousRequestId)

            const requestId = geocoder.lookup(address, (error, data) => {
                if (error) {
                    reject(error)
                    return
                }

                const place = data.results[0]
                if (!place) {
                    reject(`No results for lookup: '${address}'`)
                    return
                }

                placeCache.set(address, place)

                resolve(place)
            })

            geocodeRequests.set(address, requestId)
        })
    }

    updateMap = async (waypoints: Waypoint[]) => {
        if (!this.element) return
        if (!this.map) return

        const newAddresses = waypoints.map(w => w.address)
        if (isEqual(this.addresses, newAddresses)) {
            this.centerMap()
            return
        }
        this.addresses = newAddresses

        this.props.store.dispatch(beginMapUpdate())

        const places = await Promise.all(this.addresses.map(async (address, index) => {
            try {
                const place = await this.geocodeWaypoint(address)
                this.props.store.dispatch(geocodeSuccess(index))
                return place
            } catch (error) {
                this.props.store.dispatch(geocodeFailure(index))
                throw error
            }
        }))
        const routes = await Promise.all(places.slice(0, -1).map((waypoint, index) => routeBetween(waypoint, places[index + 1])))

        this.props.store.dispatch(setRouteInformation({
            distance: routes.reduce((prev, curr) => prev + curr.distance, 0),
            time: routes.reduce((prev, curr) => prev + curr.expectedTravelTime, 0)
        }))

        const annotations = places.map((place, index) => new mapkit.MarkerAnnotation(place.coordinate, {
            title: this.addresses[index],
            glyphText: `${index + 1}`,
            subtitle: place.formattedAddress,
            animates: false
        }))
        // TODO: Implement easy-selection feature
        // annotations.forEach((annotation, index) => {
        //     annotation.addEventListener('select', annotation => {
        //     })
        // })
        const overlays = routes.map(route =>
            new mapkit.PolylineOverlay(route.polyline.points, {
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

        this.props.store.dispatch(finishMapUpdate())
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

        this.map = new mapkit.Map(this.element, {
            showsMapTypeControl: false,
            showsScale: mapkit.FeatureVisibility.Visible,
            showsPointsOfInterest: false,
            isRotationEnabled: false,
            padding: new mapkit.Padding({ top: 0, left: 0, right: 0, bottom: 48 })
        })

        this.map.addEventListener('zoom-start', () => {
            this.props.store.dispatch(disableAutofit())
        })

        this.map.addEventListener('scroll-start', () => {
            this.props.store.dispatch(disableAutofit())
        })

        this.unsubscribeCallback = this.props.store.subscribe(() => {
            const appState = this.props.store.getState()

            if (appState.mapIsUpdating)
                this.element && this.element.classList.add('updating')
            else
                this.element && this.element.classList.remove('updating')

            this.updateMap(appState.waypoints)
        })
    }

    componentWillUnmount() {
        if (this.map) this.map.destroy()
        if (this.unsubscribeCallback) this.unsubscribeCallback()
    }

    render() {
        return <div
            ref={e => this.element = e || undefined}
            className="mapview"
        />
    }
}

const directions = new mapkit.Directions();
const routeCache = new Map<string, mapkit.Route>()
async function routeBetween(origin: mapkit.Place, destination: mapkit.Place): Promise<mapkit.Route> {
    const cachedRoute = routeCache.get(origin.formattedAddress + destination.formattedAddress)
    if (cachedRoute) return cachedRoute

    return new Promise<mapkit.Route>((resolve, reject) => {
        directions.route({ origin, destination }, (error, data) => {
            if (error) {
                reject(error)
                return
            }

            const route = data.routes[0]
            if (!route) {
                reject(error)
                return
            }

            routeCache.set(origin.formattedAddress + destination.formattedAddress, route)

            resolve(route)
        })
    })
}