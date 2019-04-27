import copyToClipboard from 'copy-text-to-clipboard'
import { chunk } from 'lodash'
import { stringify } from 'query-string'
import React, { useCallback, useContext, useMemo } from 'react'
import { WaypointEditorTemplate } from '.'
import { AppStateContext } from '../../context/AppStateContext'

export const UrlsPane = () => {
    const {
        state: {
            waypoints: { list: waypoints },
        },
        dispatch,
    } = useContext(AppStateContext)

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
                    title: `Navigation Links (${index + 1} out of ${navigationLinks.length})`,
                    text: navigationLinks[index],
                })
            } catch (e) {
                if (e instanceof Error && e.name !== 'AbortError') {
                    dispatch({
                        type: 'ERROR_OCCURED',
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
                    type: 'ERROR_OCCURED',
                    error: new Error(`Share failed: ${e.message}`),
                })
            }
        }
    }, [navigationLinks])

    const insufficientWaypoints = waypoints.length === 0

    return (
        <WaypointEditorTemplate
            body={
                insufficientWaypoints ? (
                    <div className="alert alert-warning" role="alert">
                        Add one or more waypoints to generate links
                    </div>
                ) : (
                    <>
                        {navigationLinks.map((url, index) => (
                            <div key={url} className="input-row">
                                <input type="text" value={url} readOnly={true} />
                                {(navigator as INavigator).share && (
                                    <button onClick={shareLink(index)} className="btn btn-primary">
                                        <i className="fas fa-fw fa-share" />
                                    </button>
                                )}
                                <button onClick={copyLink(index)} className="btn btn-primary">
                                    <i className="fas fa-fw fa-clipboard" />
                                </button>
                                <button onClick={openUrl(index)} className="btn btn-primary">
                                    <i className="fas fa-fw fa-external-link-alt" />
                                </button>
                            </div>
                        ))}
                    </>
                )
            }
            footer={
                <>
                    <button className="btn btn-primary" onClick={openAllLinks} disabled={insufficientWaypoints}>
                        <i className="fas fa-fw fa-external-link-alt" /> Open All
                    </button>
                    <button className="btn btn-primary" onClick={copyAllLinks} disabled={insufficientWaypoints}>
                        <i className="fas fa-fw fa-clipboard" /> Copy All
                    </button>
                    {(navigator as INavigator).share && (
                        <button className="btn btn-primary" onClick={shareAllLinks} disabled={insufficientWaypoints}>
                            <i className="fas fa-fw fa-share" /> Share All
                        </button>
                    )}
                </>
            }
        />
    )
}
