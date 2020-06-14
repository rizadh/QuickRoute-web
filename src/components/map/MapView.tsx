import { sortBy } from 'lodash'
import React, { Dispatch, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled, { css } from 'styled-components'
import { useAccentColor } from '../../hooks/useAccentColor'
import { useDarkMode } from '../../hooks/useDarkMode'
import { AppAction } from '../../redux/actionTypes'
import { routeInformation } from '../../redux/selectors'
import { AppState } from '../../redux/state'

const Container = styled.div<{ blur: boolean; editorHidden: boolean }>`
    width: 100%;
    height: 100%;

    transition: filter 0.2s;
    ${({ blur }) =>
        blur &&
        css`
            filter: opacity(0.2);

            * {
                pointer-events: none;
            }
        `}
`

export const MapView = () => {
    const mapviewRef = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<mapkit.Map>()
    const waypoints = useSelector((state: AppState) => state.waypoints)
    const selectedWaypointsCount = useSelector(
        (state: AppState) => state.waypoints.filter(waypoint => waypoint.selected).length,
    )
    const fetchedPlaces = useSelector((state: AppState) => state.fetchedPlaces)
    const fetchedRoutes = useSelector((state: AppState) => state.fetchedRoutes)
    const autofitIsEnabled = useSelector((state: AppState) => state.autofitIsEnabled)
    const editorIsHidden = useSelector((state: AppState) => state.editorIsHidden)
    const dispatch: Dispatch<AppAction> = useDispatch()
    const operationInProgress = useSelector(
        (state: AppState) => state.importInProgress || state.optimizationInProgress,
    )
    const status = useSelector((state: AppState) => routeInformation(state).status)
    const darkMode = useDarkMode()
    const accentColor = useAccentColor()
    const centerMap = useCallback(
        (animate: boolean) => void map?.showItems([...map.annotations, ...map.overlays], { animate }),
        [autofitIsEnabled, map],
    )

    // Initialize map 
    useEffect(() => {
        if (mapviewRef.current == null) return

        const newMap = new mapkit.Map(mapviewRef.current, {
            showsMapTypeControl: false,
            showsScale: mapkit.FeatureVisibility.Adaptive,
            showsPointsOfInterest: false,
            mapType: mapkit.Map.MapTypes.MutedStandard,
            padding: new mapkit.Padding({ top: 16 + 42, left: 0, right: 0, bottom: 0 }),
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

    // Update annotations and overlays 
    useEffect(() => {
        if (!map) return
        if (status === 'FETCHING') return
        if (operationInProgress) return

        const grayColor = 'rgb(142, 142, 147)'

        const annotations = sortBy(
            waypoints.map((waypoint, index) => ({ waypoint, index })),
            ({ waypoint: { selected } }) => selected ?? 0,
        ).map(({ waypoint, index }) => {
            const fetchedPlace = fetchedPlaces[waypoint.address]

            if (fetchedPlace?.status === 'SUCCESS') {
                const {
                    result: {
                        coordinate: { latitude, longitude },
                        address: formattedAddress,
                    },
                } = fetchedPlace

                const errorColor = getComputedStyle(document.documentElement).getPropertyValue('--error-color')

                return new mapkit.MarkerAnnotation(new mapkit.Coordinate(latitude, longitude), {
                    glyphText: `${index + 1}`,
                    title: waypoint.address,
                    subtitle: formattedAddress,
                    animates: false,
                    color: !selectedWaypointsCount || waypoint.selected ? errorColor : grayColor,
                })
            }
        })

        const overlays = sortBy(
            waypoints
                .filter((_, index) => index !== 0)
                .map((waypoint, index) => {
                    const previousWaypoint = waypoints[index]
                    const fetchedRoute = fetchedRoutes[previousWaypoint.address]?.[waypoint.address]
                    const selected = previousWaypoint.selected && waypoint.selected

                    return { fetchedRoute, selected }
                }),
            ({ selected }) => selected ?? 0,
        ).map(({ fetchedRoute, selected }) => {
            if (fetchedRoute?.status === 'SUCCESS') {
                const {
                    result: { points },
                } = fetchedRoute

                return new mapkit.PolylineOverlay(
                    points.map(({ latitude, longitude }) => new mapkit.Coordinate(latitude, longitude)),
                    {
                        style: new mapkit.Style({
                            lineWidth: 6,
                            strokeOpacity: !selectedWaypointsCount || selected ? 0.75 : 0.5,
                            strokeColor: !selectedWaypointsCount || selected ? accentColor : grayColor,
                        }),
                    },
                )
            }
        })

        map.annotations = annotations.filter((a): a is mapkit.MarkerAnnotation => !!a)
        map.overlays = overlays.filter((a): a is mapkit.PolygonOverlay => !!a)

        if (autofitIsEnabled) centerMap(true)
    }, [map, waypoints, fetchedPlaces, fetchedRoutes, darkMode])

    // Center map when autofit is enabled
    useEffect(() => {
        if (autofitIsEnabled) centerMap(true)
    }, [autofitIsEnabled])

    // Center map when map is resized with autofit enabled
    useEffect(() => {
        if (!mapviewRef.current || !autofitIsEnabled || !window.ResizeObserver) return

        const observer = new window.ResizeObserver(() => centerMap(false))
        observer.observe(mapviewRef.current)

        return () => observer.disconnect()
    }, [map, autofitIsEnabled])

    // Switch map color scheme based on dark mode
    useEffect(() => {
        if (map) map.colorScheme = darkMode ? mapkit.Map.ColorSchemes.Dark : mapkit.Map.ColorSchemes.Light
    }, [map, darkMode])

    return (
        <Container blur={status === 'FETCHING' || operationInProgress} editorHidden={editorIsHidden} ref={mapviewRef} />
    )
}
