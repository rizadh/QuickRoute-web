import copyToClipboard from 'copy-text-to-clipboard'
import chunk from 'lodash/chunk'
import { stringify } from 'query-string'
import React, { ButtonHTMLAttributes, Dispatch, useCallback, useMemo, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppAction } from '../../../redux/actionTypes'
import { AppState } from '../../../redux/state'
import { Alert, WarningAlert } from '../../common/Alert'
import { Button, Variant } from '../../common/Button'
import { Input } from '../../common/Input'
import { InputRow } from '../../common/InputRow'
import { Body, Footer } from '../Editor'

export const NavigatePane = () => {
    const waypoints = useSelector((state: AppState) => state.waypoints)
    const dispatch: Dispatch<AppAction> = useDispatch()

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
                await navigator.share({
                    url: navigationLinks[index],
                })
            } catch (e) {
                if (e instanceof Error && e.name !== 'AbortError') {
                    dispatch({
                        type: 'ERROR_OCCURRED',
                        error: `Share failed: ${e.message}`,
                    })
                }
            }
        },
        [dispatch, navigationLinks],
    )

    const shareAllLinks = useCallback(async () => {
        try {
            await navigator.share({
                title: 'Navigation Links',
                text: navigationLinks.join('\n'),
            })
        } catch (e) {
            if (e instanceof Error && e.name !== 'AbortError') {
                dispatch({
                    type: 'ERROR_OCCURRED',
                    error: `Share failed: ${e.message}`,
                })
            }
        }
    }, [dispatch, navigationLinks])

    const insufficientWaypoints = waypoints.length === 0

    return (
        <>
            {insufficientWaypoints ? (
                <Body>
                    <WarningAlert>Add one or more waypoints to generate links</WarningAlert>
                </Body>
            ) : (
                <Body>
                    <Alert>
                        Use the links below to navigate using Google Maps. Each link contains up to ten waypoints due to
                        Google&apos;s limitations
                    </Alert>
                    {navigationLinks.map((url, index) => (
                        <InputRow key={url}>
                            <Input type="text" value={url} readOnly={true} />
                            {/* TODO: Cleanup this navigator.share usage when possible */}
                            {(navigator.share as Navigator['share']) && (
                                <Button variant={Variant.Primary} onClick={shareLink(index)} title="Share this link">
                                    <i className="fas fa-fw fa-share" />
                                </Button>
                            )}
                            <CopyButton onClick={copyLink(index)}></CopyButton>
                            <Button variant={Variant.Primary} onClick={openUrl(index)} title="Open this link">
                                <i className="fas fa-fw fa-external-link-alt" />
                            </Button>
                        </InputRow>
                    ))}
                </Body>
            )}

            <Footer>
                {/* TODO: Cleanup this navigator.share usage when possible */}
                {(navigator.share as Navigator['share']) && (
                    <Button variant={Variant.Primary} onClick={shareAllLinks} disabled={insufficientWaypoints}>
                        <i className="fas fa-fw fa-share" /> Share All
                    </Button>
                )}
                <CopyButton onClick={copyAllLinks} disabled={insufficientWaypoints} label="Copy All"></CopyButton>
                <Button variant={Variant.Primary} onClick={openAllLinks} disabled={insufficientWaypoints}>
                    <i className="fas fa-fw fa-external-link-alt" /> Open All
                </Button>
            </Footer>
        </>
    )
}

type CopyButtonProps = {
    label?: string
}

const CopyButton = (props: ButtonHTMLAttributes<HTMLButtonElement> & CopyButtonProps) => {
    const [copied, setCopied] = useState(false)

    const originalOnClick = props.onClick
    const onClick = useCallback(
        event => {
            copyButtonRegistry.trigger()
            setCopied(true)

            return originalOnClick?.(event)
        },
        [originalOnClick],
    )

    useEffect(() => {
        copyButtonRegistry.register(setCopied)

        return () => void copyButtonRegistry.deregister(setCopied)
    }, [])

    return (
        <Button {...props} variant={copied ? Variant.Success : Variant.Primary} onClick={onClick}>
            <i className={'fas fa-fw fa-' + (copied ? 'check' : 'clipboard')} /> {props.label}
        </Button>
    )
}

type CopyButtonRegistryHandler = (copied: false) => void
class CopyButtonRegistry {
    private handlers = new Set<CopyButtonRegistryHandler>()

    trigger() {
        this.handlers.forEach(handler => handler(false))
    }

    register(handler: CopyButtonRegistryHandler) {
        this.handlers.add(handler)
    }

    deregister(handler: CopyButtonRegistryHandler) {
        this.handlers.delete(handler)
    }
}

const copyButtonRegistry = new CopyButtonRegistry()
