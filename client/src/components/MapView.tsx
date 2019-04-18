import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Store } from 'redux'
import { EditorVisibilityContext } from '../context/EditorVisibilityContext'
import { useMedia } from '../hooks/useMedia'
import { useWindowSize } from '../hooks/useWindowSize'
import { disableAutofit } from '../redux/actions'
import { AppAction } from '../redux/actionTypes'
import { routeInformation } from '../redux/selectors'
import { AppState, FetchSuccess } from '../redux/state'

type MapViewProps = {
    store: Store<AppState, AppAction>;
}

mapkit.init({
    authorizationCallback: done =>
        fetch('/token')
            .then(res => res.text())
            .then(done),
})

const MapView = (props: MapViewProps) => {
    const mapviewRef = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<mapkit.Map>()
    const [appState, setAppState] = useState(props.store.getState())
    const { waypoints, fetchedPlaces, fetchedRoutes, autofitIsEnabled } = appState
    const status = useMemo(() => routeInformation(appState).status, [appState])
    const darkMode = useMedia('(prefers-color-scheme: dark)')
    const windowSize = useWindowSize()
    const { editorIsHidden } = useContext(EditorVisibilityContext)
    const centerMap = (animated: boolean) => {
        if (!autofitIsEnabled || !map) return

        map.showItems([...(map.annotations || []), ...map.overlays], {
            animate: animated,
            padding: new mapkit.Padding({
                top: editorIsHidden ? 16 + 42 + 16 : 16,
                right: 16,
                bottom: 16,
                left: 16,
            }),
        })
    }

    useEffect(() => {
        if (mapviewRef.current == null) return

        const newMap = new mapkit.Map(mapviewRef.current, {
            showsMapTypeControl: false,
            showsScale: mapkit.FeatureVisibility.Visible,
            padding: new mapkit.Padding({ top: 0, left: 0, right: 0, bottom: 48 }),
        })

        const mapDidMove = () => {
            if (
                (newMap.annotations && newMap.annotations.length > 0) ||
                (newMap.overlays && newMap.overlays.length > 0)
            ) {
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
        if (!map) return

        map.padding = editorIsHidden
            ? new mapkit.Padding({ top: 0, left: 0, right: 0, bottom: 0 })
            : new mapkit.Padding({ top: 16, left: 16 + 420 + 16, right: 16, bottom: 16 + 48 })
    }, [editorIsHidden, map])

    useEffect(() => {
        if (!mapviewRef.current) return

        if (status === 'FETCHING') mapviewRef.current.classList.add('updating')

        return () => {
            if (mapviewRef.current) mapviewRef.current.classList.remove('updating')
        }
    }, [status])

    useEffect(() => {
        if (!map) return
        if (status === 'FETCHING') return

        const annotations = waypoints
            .map(({ address }) => fetchedPlaces.get(address))
            .filter((p): p is FetchSuccess<mapkit.Place> => !!p && p.status === 'SUCCESS')
            .map(
                ({ result: { coordinate, formattedAddress } }, index) =>
                    new mapkit.MarkerAnnotation(coordinate, {
                        glyphText: `${index + 1}`,
                        title: waypoints[index].address,
                        subtitle: formattedAddress,
                        animates: false,
                    }),
            )

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
            .map(
                polyline =>
                    new mapkit.PolylineOverlay(polyline.points, {
                        style: new mapkit.Style({
                            lineWidth: 6,
                            strokeOpacity: 0.75,
                        }),
                    }),
            )

        map.addAnnotations(annotations)
        map.addOverlays(overlays)

        centerMap(true)

        return () => {
            if (map.annotations) map.removeAnnotations(map.annotations)
            if (map.overlays) map.removeOverlays(map.overlays)
        }
    }, [map, waypoints, fetchedPlaces, fetchedRoutes])

    useEffect(() => centerMap(true), [map, autofitIsEnabled])
    useEffect(() => centerMap(false), [windowSize.width, windowSize.height, editorIsHidden])

    useEffect(() => {
        if (map) map.colorScheme = darkMode ? mapkit.Map.ColorSchemes.Dark : mapkit.Map.ColorSchemes.Light
    }, [map, darkMode])

    return <div ref={mapviewRef} id="mapview" />
}

export default MapView
