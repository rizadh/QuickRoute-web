import copyToClipboard from 'copy-text-to-clipboard'
import chunk from 'lodash/chunk'
import { stringify } from 'query-string'
import React, { useCallback, useContext, useMemo } from 'react'
import { WaypointEditorTemplate } from '.'
import { AppStateContext } from '../../context/AppStateContext'
import { useCompactMode } from '../../hooks/useCompactMode'
import { Button } from '../Button'

export const LinksPane = () => {
    const {
        state: { waypoints },
        dispatch,
    } = useContext(AppStateContext)
    const compactMode = useCompactMode()

    const navigationLinks = useMemo(() => {
        return chunk(waypoints, 10)
            .map(chunkedWaypoints => chunkedWaypoints.map(w => w.address))
            .map(addresses => {
                const destination = addresses.pop()
                const parameters = {
                    api: 1,
                    destination,
                    travelmode: 'driving',
                    waypoints: addresses.length > 0 ? addresses.join('|') : undefined,
                }

                return 'https://www.google.com/maps/dir/?' + stringify(parameters)
            })
    }, [waypoints])

    const openUrl = useCallback(
        (index: number) => () => {
            window.open(navigationLinks[index])
        },
        [navigationLinks],
    )

    const openAllLinks = useCallback(() => {
        navigationLinks.forEach(url => window.open(url))
    }, [navigationLinks])

    const copyLink = useCallback(
        (index: number) => () => {
            copyToClipboard(navigationLinks[index])
        },
        [navigationLinks],
    )

    const copyAllLinks = useCallback(() => {
        copyToClipboard(navigationLinks.join('\n'))
    }, [navigationLinks])

    const shareLink = useCallback(
        (index: number) => async () => {
            try {
                await (navigator as INavigator).share({
                    url: navigationLinks[index],
                })
            } catch (e) {
                if (e instanceof Error && e.name !== 'AbortError') {
                    dispatch({
                        type: 'ERROR_OCCURRED',
                        error: new Error(`Share failed: ${e.message}`),
                    })
                }
            }
        },
        [navigationLinks],
    )

    const shareAllLinks = useCallback(async () => {
        try {
            await (navigator as INavigator).share({
                title: 'Navigation Links',
                text: navigationLinks.join('\n'),
            })
        } catch (e) {
            if (e instanceof Error && e.name !== 'AbortError') {
                dispatch({
                    type: 'ERROR_OCCURRED',
                    error: new Error(`Share failed: ${e.message}`),
                })
            }
        }
    }, [navigationLinks])

    const insufficientWaypoints = waypoints.length === 0

    const body = insufficientWaypoints ? (
        <div className="text text-warning" role="alert">
            Add one or more waypoints to generate links
        </div>
    ) : (
        <>
            {navigationLinks.map((url, index) => (
                <div key={url} className="input-row">
                    <input type="text" value={url} readOnly={true} />
                    {(navigator as INavigator).share && (
                        <Button onClick={shareLink(index)} type="primary" title="Share this link">
                            <i className="fas fa-fw fa-share" />
                        </Button>
                    )}
                    <Button onClick={copyLink(index)} type="primary" title="Copy this link to clipboard">
                        <i className="fas fa-fw fa-clipboard" />
                    </Button>
                    <Button onClick={openUrl(index)} type="primary" title="Open this link">
                        <i className="fas fa-fw fa-external-link-alt" />
                    </Button>
                </div>
            ))}
        </>
    )

    const footer = (
        <>
            {(navigator as INavigator).share && (
                <Button type="primary" onClick={shareAllLinks} disabled={insufficientWaypoints}>
                    <i className="fas fa-fw fa-share" />
                    {compactMode ? ' Share' : ' Share All'}
                </Button>
            )}
            <Button type="primary" onClick={copyAllLinks} disabled={insufficientWaypoints}>
                <i className="fas fa-fw fa-clipboard" />
                {compactMode ? ' Copy' : ' Copy All'}
            </Button>
            <Button type="primary" onClick={openAllLinks} disabled={insufficientWaypoints}>
                <i className="fas fa-fw fa-external-link-alt" />
                {compactMode ? ' Open' : ' Open All'}
            </Button>
        </>
    )

    return <WaypointEditorTemplate body={body} footer={footer} />
}
