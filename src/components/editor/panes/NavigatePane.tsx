import copyToClipboard from 'copy-text-to-clipboard';
import chunk from 'lodash/chunk';
import { stringify } from 'query-string';
import React, { Dispatch, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppAction } from '../../../redux/actionTypes';
import { AppState } from '../../../redux/state';
import { Alert, WarningAlert } from '../../common/Alert';
import { Button, Variant } from '../../common/Button';
import { Input } from '../../common/Input';
import { InputRow } from '../../common/InputRow';
import { Body, Footer } from '../Editor';

export const NavigatePane = () => {
    const waypoints = useSelector((state: AppState) => state.waypoints);
    const dispatch: Dispatch<AppAction> = useDispatch();

    const navigationLinks = useMemo(() => {
        return chunk(waypoints, 10)
            .map(chunkedWaypoints => chunkedWaypoints.map(w => w.address))
            .map(addresses => {
                const destination = addresses.pop();
                const parameters = {
                    api: 1,
                    destination,
                    travelmode: 'driving',
                    waypoints: addresses.length > 0 ? addresses.join('|') : undefined,
                };

                return 'https://www.google.com/maps/dir/?' + stringify(parameters);
            });
    }, [waypoints]);

    const openUrl = useCallback(
        (index: number) => () => {
            window.open(navigationLinks[index]);
        },
        [navigationLinks],
    );

    const openAllLinks = useCallback(() => {
        navigationLinks.forEach(url => window.open(url));
    }, [navigationLinks]);

    const copyLink = useCallback(
        (index: number) => () => {
            copyToClipboard(navigationLinks[index]);
        },
        [navigationLinks],
    );

    const copyAllLinks = useCallback(() => {
        copyToClipboard(navigationLinks.join('\n'));
    }, [navigationLinks]);

    const shareLink = useCallback(
        (index: number) => async () => {
            try {
                await navigator.share({
                    url: navigationLinks[index],
                });
            } catch (e) {
                if (e instanceof Error && e.name !== 'AbortError') {
                    dispatch({
                        type: 'ERROR_OCCURRED',
                        error: `Share failed: ${e.message}`,
                    });
                }
            }
        },
        [navigationLinks],
    );

    const shareAllLinks = useCallback(async () => {
        try {
            await navigator.share({
                title: 'Navigation Links',
                text: navigationLinks.join('\n'),
            });
        } catch (e) {
            if (e instanceof Error && e.name !== 'AbortError') {
                dispatch({
                    type: 'ERROR_OCCURRED',
                    error: `Share failed: ${e.message}`,
                });
            }
        }
    }, [navigationLinks]);

    const insufficientWaypoints = waypoints.length === 0;

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
                            {navigator.share && (
                                <Button variant={Variant.Primary} onClick={shareLink(index)} title="Share this link">
                                    <i className="fas fa-fw fa-share" />
                                </Button>
                            )}
                            <Button
                                variant={Variant.Primary}
                                onClick={copyLink(index)}
                                title="Copy this link to clipboard"
                            >
                                <i className="fas fa-fw fa-clipboard" />
                            </Button>
                            <Button variant={Variant.Primary} onClick={openUrl(index)} title="Open this link">
                                <i className="fas fa-fw fa-external-link-alt" />
                            </Button>
                        </InputRow>
                    ))}
                </Body>
            )}

            <Footer>
                {navigator.share && (
                    <Button variant={Variant.Primary} onClick={shareAllLinks} disabled={insufficientWaypoints}>
                        <i className="fas fa-fw fa-share" /> Share All
                    </Button>
                )}
                <Button variant={Variant.Primary} onClick={copyAllLinks} disabled={insufficientWaypoints}>
                    <i className="fas fa-fw fa-clipboard" /> Copy All
                </Button>
                <Button variant={Variant.Primary} onClick={openAllLinks} disabled={insufficientWaypoints}>
                    <i className="fas fa-fw fa-external-link-alt" /> Open All
                </Button>
            </Footer>
        </>
    );
};
