import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AppStateContext } from '../context/AppStateContext'
import { useCompactMode } from '../hooks/useCompactMode'
import { useDarkMode } from '../hooks/useDarkMode'
import { useWindowSize } from '../hooks/useWindowSize'
import { routeInformation } from '../redux/selectors'

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
    const darkMode = useDarkMode()
    const compactMode = useCompactMode()
    const windowSize = useWindowSize()
    const centerMap = (animate: boolean) => {
        if (!autofitIsEnabled || !map) return

        map.showItems([...(map.annotations || []), ...map.overlays], {
            animate,
            padding: new mapkit.Padding({
                top: compactMode ? 12 : 16,
                right: compactMode ? 12 : 16,
                bottom: compactMode ? 12 : 16,
                left: compactMode ? 12 : 16,
            }),
        })
    }

    useEffect(() => {
        if (mapviewRef.current == null) return

        const newMap = new mapkit.Map(mapviewRef.current, {
            showsMapTypeControl: false,
            showsScale: mapkit.FeatureVisibility.Adaptive,
        })

        const mapDidMove = () => {
            if (newMap.annotations.length > 0 || newMap.overlays.length > 0) {
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
            map.padding = new mapkit.Padding({ top: 0, left: 12, right: 0, bottom: 12 + 42 })
        } else if (editorIsHidden) {
            map.padding = new mapkit.Padding({ top: 16 + 42, left: 0, right: 0, bottom: 0 })
        } else {
            map.padding = new mapkit.Padding({ top: 16 + 42, left: 16 + 420 + 16, right: 0, bottom: 0 })
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

        const annotations = waypoints.map((waypoint, index) => {
            const fetchedPlace = fetchedPlaces.get(waypoint.address)

            if (fetchedPlace?.status === 'SUCCESS') {
                const {
                    result: {
                        coordinate: { latitude, longitude },
                        address: formattedAddress,
                    },
                } = fetchedPlace

                return new mapkit.MarkerAnnotation(new mapkit.Coordinate(latitude, longitude), {
                    glyphText: `${index + 1}`,
                    title: waypoints[index].address,
                    subtitle: formattedAddress,
                    animates: false,
                })
            }
        })

        const overlays = waypoints.map((waypoint, index) => {
            if (index === 0) return

            const fetchedRoute = fetchedRoutes.get(waypoints[index - 1].address)?.get(waypoint.address)

            if (fetchedRoute?.status === 'SUCCESS') {
                const {
                    result: { points },
                } = fetchedRoute

                return new mapkit.PolylineOverlay(
                    points.map(({ latitude, longitude }) => new mapkit.Coordinate(latitude, longitude)),
                    {
                        style: new mapkit.Style({
                            lineWidth: 6,
                            strokeOpacity: 0.75,
                        }),
                    },
                )
            }
        })

        map.annotations = annotations.filter((a): a is mapkit.MarkerAnnotation => !!a)
        map.overlays = overlays.filter((a): a is mapkit.PolygonOverlay => !!a)

        centerMap(true)
    }, [map, waypoints, fetchedPlaces, fetchedRoutes])

    useEffect(() => centerMap(true), [autofitIsEnabled])
    useEffect(() => centerMap(false), [map, windowSize.width, windowSize.height, editorIsHidden])

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
