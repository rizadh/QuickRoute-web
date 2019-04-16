import React, { useEffect, useRef, useState } from 'react'
import { Store } from 'redux'
import { disableAutofit } from '../redux/actions'
import { AppAction } from '../redux/actionTypes'
import { routeInformation } from '../redux/selectors'
import { AppState, FetchSuccess } from '../redux/state'

type MapViewProps = {
    store: Store<AppState, AppAction>
}

mapkit.init({
    authorizationCallback: done => fetch('/token')
        .then(res => res.text())
        .then(done),
})

const MapView = (props: MapViewProps) => {
    const mapviewRef = useRef<HTMLDivElement>(null)
    const loadingIndicatorRef = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<mapkit.Map>()
    const [appState, setAppState] = useState(props.store.getState())
    const { waypoints, fetchedPlaces, fetchedRoutes, autofitIsEnabled } = appState
    const status = routeInformation(appState).status

    useEffect(() => {
        if (mapviewRef.current == null) return

        const newMap = new mapkit.Map(mapviewRef.current, {
            showsMapTypeControl: false,
            showsScale: mapkit.FeatureVisibility.Visible,
            padding: new mapkit.Padding({ top: 0, left: 0, right: 0, bottom: 48 }),
        })

        const mapDidMove = () => {
            if (newMap.annotations && newMap.annotations.length > 0 || newMap.overlays && newMap.overlays.length > 0) {
                props.store.dispatch(disableAutofit())
            }
        }

        newMap.addEventListener('zoom-start', mapDidMove)
        newMap.addEventListener('scroll-start', mapDidMove)

        const unsubscribeCallback = props.store.subscribe(() => setAppState(props.store.getState()))

        setMap(newMap)

        return () => {
            newMap.destroy()
            unsubscribeCallback()
        }
    }, [])

    useEffect(() => {
        if (!mapviewRef.current) return

        if (status === 'FETCHING') {
            mapviewRef.current.classList.add('updating')
            if (loadingIndicatorRef.current) loadingIndicatorRef.current.hidden = false
        } else {
            mapviewRef.current.classList.remove('updating')
            if (loadingIndicatorRef.current) loadingIndicatorRef.current.hidden = true
        }
    }, [status])

    useEffect(() => {
        if (!map) return
        if (status === 'FETCHING') return

        const annotations = waypoints
            .map(({ address }) => fetchedPlaces.get(address))
            .filter((p): p is FetchSuccess<mapkit.Place> => !!p && p.status === 'SUCCESS')
            .map(({ result: { coordinate, formattedAddress } }, index) => new mapkit.MarkerAnnotation(coordinate, {
                glyphText: `${index + 1}`,
                title: waypoints[index].address,
                subtitle: formattedAddress,
                animates: false,
            }))

        const overlays = waypoints
            .map((waypoint, index) => {
                if (index === 0) return
                const previousWaypoint = waypoints[index - 1]
                const routesFromPreviousWaypoint = fetchedRoutes.get(previousWaypoint.address)
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

        if (map.annotations) map.removeAnnotations(map.annotations)
        if (map.overlays) map.removeOverlays(map.overlays)

        map.addAnnotations(annotations)
        map.addOverlays(overlays)
    }, [map, waypoints, fetchedPlaces, fetchedRoutes])

    useEffect(() => {
        if (autofitIsEnabled && map) {
            map.showItems([...map.annotations || [], ...map.overlays], {
                animate: true,
                padding: new mapkit.Padding({
                    top: 16,
                    right: 16,
                    bottom: 16,
                    left: 16,
                }),
            })
        }
    }, [map, waypoints, fetchedPlaces, fetchedRoutes, autofitIsEnabled])

    return (
        <>
            <div
                ref={mapviewRef}
                id="mapview"
            />
            <div
                ref={loadingIndicatorRef}
                id="loading-indicator"
                className="rounded p-3 frosted"
                hidden={true}
            >
                <i className="fas fa-spin fa-circle-notch" />
            </div>
        </>
    )
}

export default MapView
