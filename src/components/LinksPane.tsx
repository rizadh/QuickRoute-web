import copyToClipboard from 'copy-text-to-clipboard'
import chunk from 'lodash/chunk'
import { stringify } from 'query-string'
import React, { Dispatch, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useCompactMode } from '../hooks/useCompactMode'
import { AppAction } from '../redux/actionTypes'
import { AppState } from '../redux/state'
import { WarningAlert } from './Alert'
import { PrimaryButton } from './Button'
import { InputRow } from './InputRow'
import { WaypointEditorTemplate } from './WaypointEditor'
import { Input } from './Input'

export const LinksPane = () => {
    const waypoints = useSelector((state: AppState) => state.waypoints)
    const dispatch: Dispatch<AppAction> = useDispatch()
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
        <WarningAlert>Add one or more waypoints to generate links</WarningAlert>
    ) : (
        <>
            {navigationLinks.map((url, index) => (
                <InputRow key={url}>
                    <Input type="text" value={url} readOnly={true} />
                    {(navigator as INavigator).share && (
                        <PrimaryButton onClick={shareLink(index)} title="Share this link">
                            <i className="fas fa-fw fa-share" />
                        </PrimaryButton>
                    )}
                    <PrimaryButton onClick={copyLink(index)} title="Copy this link to clipboard">
                        <i className="fas fa-fw fa-clipboard" />
                    </PrimaryButton>
                    <PrimaryButton onClick={openUrl(index)} title="Open this link">
                        <i className="fas fa-fw fa-external-link-alt" />
                    </PrimaryButton>
                </InputRow>
            ))}
        </>
    )

    const footer = (
        <>
            {(navigator as INavigator).share && (
                <PrimaryButton onClick={shareAllLinks} disabled={insufficientWaypoints}>
                    <i className="fas fa-fw fa-share" />
                    {compactMode ? ' Share' : ' Share All'}
                </PrimaryButton>
            )}
            <PrimaryButton onClick={copyAllLinks} disabled={insufficientWaypoints}>
                <i className="fas fa-fw fa-clipboard" />
                {compactMode ? ' Copy' : ' Copy All'}
            </PrimaryButton>
            <PrimaryButton onClick={openAllLinks} disabled={insufficientWaypoints}>
                <i className="fas fa-fw fa-external-link-alt" />
                {compactMode ? ' Open' : ' Open All'}
            </PrimaryButton>
        </>
    )

    return <WaypointEditorTemplate body={body} footer={footer} />
}
