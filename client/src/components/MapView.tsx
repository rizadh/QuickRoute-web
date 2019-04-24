import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AppStateContext } from '../context/AppStateContext'
import { useMedia } from '../hooks/useMedia'
import { useWindowSize } from '../hooks/useWindowSize'
import { routeInformation } from '../redux/selectors'
import { FetchSuccess } from '../redux/state'

mapkit.init({
    authorizationCallback: done =>
        fetch('/token')
            .then(res => res.text())
            .then(done),
})

export const MapView = () => {
    const mapviewRef = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<mapkit.Map>()
    const { state, dispatch } = useContext(AppStateContext)
    const {
        waypoints,
        fetchedPlaces,
        fetchedRoutes,
        autofitIsEnabled,
        mutedMapIsEnabled,
        editorIsHidden,
        importInProgress,
        optimizationInProgress,
    } = state
    const operationInProgress = importInProgress || optimizationInProgress
    const status = useMemo(() => routeInformation(state).status, [state])
    const darkMode = useMedia('(prefers-color-scheme: dark)')
    const compactMode = useMedia('(max-width: 800px)')
    const windowSize = useWindowSize()
    const centerMap = (animated: boolean) => {
        if (!autofitIsEnabled || !map) return

        map.showItems([...(map.annotations || []), ...map.overlays], {
            animate: animated,
            padding: new mapkit.Padding({
                top: 16,
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
        })

        const mapDidMove = () => {
            if (
                (newMap.annotations && newMap.annotations.length > 0) ||
                (newMap.overlays && newMap.overlays.length > 0)
            ) {
                dispatch({ type: 'DISABLE_AUTOFIT' })
            }
        }

        newMap.addEventListener('zoom-start', mapDidMove)
        newMap.addEventListener('scroll-start', mapDidMove)

        setMap(newMap)

        return () => newMap.destroy()
    }, [])

    useEffect(() => {
        if (!map) return

        if (compactMode) {
            map.padding = new mapkit.Padding({ top: 0, left: 0, right: 0, bottom: 16 + 42 })
        } else if (editorIsHidden) {
            map.padding = new mapkit.Padding({ top: 16 + 42, left: 0, right: 0, bottom: 0 })
        } else {
            map.padding = new mapkit.Padding({ top: 16 + 42, left: 16 + 420 + 16, right: 16, bottom: 16 + 48 })
        }
    }, [editorIsHidden, map, compactMode])

    useEffect(() => {
        if (!mapviewRef.current) return

        if (status === 'FETCHING' || operationInProgress) mapviewRef.current.classList.add('updating')

        return () => {
            if (mapviewRef.current) mapviewRef.current.classList.remove('updating')
        }
    }, [status, operationInProgress])

    useEffect(() => {
        if (!map) return
        if (status === 'FETCHING') return
        if (operationInProgress) return

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

        if (map.annotations) map.removeAnnotations(map.annotations)
        if (map.overlays) map.removeOverlays(map.overlays)

        map.addAnnotations(annotations)
        map.addOverlays(overlays)

        centerMap(true)
    }, [map, waypoints, fetchedPlaces, fetchedRoutes])

    useEffect(() => centerMap(true), [map, autofitIsEnabled])
    useEffect(() => centerMap(false), [windowSize.width, windowSize.height, editorIsHidden])

    useEffect(() => {
        if (map) map.colorScheme = darkMode ? mapkit.Map.ColorSchemes.Dark : mapkit.Map.ColorSchemes.Light
    }, [map, darkMode])

    useEffect(() => {
        if (map) {
            map.mapType = mutedMapIsEnabled ? mapkit.Map.MapTypes.MutedStandard : mapkit.Map.MapTypes.Standard
            map.showsPointsOfInterest = !mutedMapIsEnabled
        }
    }, [map, mutedMapIsEnabled])

    return <div ref={mapviewRef} id="mapview" />
}
