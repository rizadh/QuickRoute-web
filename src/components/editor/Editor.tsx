import React, { Dispatch, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { animated, useSpring } from 'react-spring'
import styled from 'styled-components'
import { appVersion } from '../..'
import { useCompactMode } from '../../hooks/useCompactMode'
import { AppAction } from '../../redux/actionTypes'
import { AppState } from '../../redux/state'
import { Alert } from '../common/Alert'
import { Button, Variant } from '../common/Button'
import { InputRow } from '../common/InputRow'
import { Link } from '../common/Link'
import compactBreakpoint from '../constants/compactBreakpoint'
import { InfoBar } from './InfoBar'
import b64toblob from 'b64-to-blob'
import { saveAs } from 'file-saver'
import isMobileFn from 'ismobilejs'
import { shallowEqual } from 'react-redux'
import { apolloClient } from '../..'
import { GeneratePdfQuery, GeneratePdfQueryVariables } from '../../generated/graphql'
import { useInput } from '../../hooks/useInput'
import { GeneratePDF } from '../../queries'
import { routeInformation } from '../../redux/selectors'
import { createWaypointFromAddress } from '../../redux/util/createWaypointFromAddress'
import { isValidAddress } from '../../redux/validator'
import { DangerAlert } from '../common/Alert'
import { Input } from '../common/Input'
import { WaypointList } from './WaypointList'

const Container = animated(styled.div`
    position: absolute;
    width: 420px;
    height: 100%;
    display: flex;
    flex-direction: column;

    background-color: var(--primary-fill-color);

    ${InfoBar.Container} {
        flex-shrink: 0;
    }

    @media (max-width: ${compactBreakpoint}px) {
        width: 100%;

        border: none;
    }
`)

const Header = styled.div`
    top: 0;
    flex-shrink: 0;

    border-bottom: var(--standard-border);
    border-right: var(--standard-border);

    @media (max-width: ${compactBreakpoint}px) {
        border-right: none;
    }

    background-color: var(--secondary-fill-color);
`

export const Body = styled.div`
    padding: calc(var(--standard-margin) / 2);

    overflow: auto;
    -webkit-overflow-scrolling: touch;

    border-right: var(--standard-border);

    @media (max-width: ${compactBreakpoint}px) {
        border-right: none;
    }

    ${Alert}, ${InputRow} {
        padding: calc(var(--standard-margin) / 2);
    }
`

export const Footer = styled.div`
    bottom: 0;
    flex-shrink: 0;
    flex-grow: 1;

    border-top: var(--standard-border);
    border-right: var(--standard-border);
    border-bottom: var(--standard-border);

    @media (max-width: ${compactBreakpoint}px) {
        border-right: none;
    }

    padding: calc(var(--standard-margin) / 2);

    background-color: var(--secondary-fill-color);

    button,
    ${InputRow} {
        margin: calc(var(--standard-margin) / 2);
    }

    ${InputRow} button {
        margin: initial;
    }
`

const HideButton = styled(Button)`
    float: right;
    margin: var(--standard-margin);
`

const AppTitle = styled.div`
    font-size: 24px;
    font-weight: 500;

    margin: var(--standard-margin);
`

const AppVersion = styled.div`
    font-size: 16px;
    color: var(--secondary-text-color);
`

const ActionButtons = styled.div`
    display: flex;
    position: sticky;
    top: 0;
    z-index: 1;

    flex-shrink: 0;

    border-right: var(--standard-border);
    border-top: var(--standard-border);

    @media (max-width: ${compactBreakpoint}px) {
        border-right: none;
    }

    background-color: var(--secondary-fill-color);
    padding: calc(var(--standard-margin) / 2) calc(var(--standard-margin) - var(--standard-horizontal-padding) / 2);
`

const Spacer = styled.div`
    flex-grow: 1;
`

export const Editor = () => {
    const isMobileDevice = isMobileFn().any

    // Redux State
    const editorIsHidden = useSelector((state: AppState) => state.editorIsHidden)
    const waypoints = useSelector((state: AppState) => state.waypoints)
    const currentRouteInformation = useSelector(routeInformation, shallowEqual)
    const compactMode = useCompactMode()
    const selectedWaypointsCount = waypoints.filter(waypoint => waypoint.selected).length
    const { props: waypointFieldProps, commitValue: addWaypoint, valueIsValid: waypointIsValid } = useInput({
        predicate: isValidAddress,
        onCommit: useCallback((waypoint: string) => {
            dispatch({ type: 'ADD_WAYPOINT', waypoint: createWaypointFromAddress(waypoint) })
            return true
        }, []),
        resetAfterCommit: true,
    })

    // Local State
    const [isBulkEditing, setIsBulkEditing] = useState(false)
    const props = useSpring({
        transform: `translateX(${editorIsHidden ? -100 : 0}%)`,
        config: { mass: 1, tension: 350, friction: 35 },
    })

    // Redux Actions
    const dispatch: Dispatch<AppAction> = useDispatch()
    const hideEditorPane = useCallback(() => dispatch({ type: 'HIDE_EDITOR_PANE' }), [])
    const reverseWaypoints = useCallback(() => dispatch({ type: 'REVERSE_WAYPOINTS' }), [])
    const deleteSelectedWaypoints = useCallback(() => dispatch({ type: 'DELETE_SELECTED_WAYPOINTS' }), [])
    const deselectAllWaypoints = useCallback(() => dispatch({ type: 'DESELECT_ALL_WAYPOINTS' }), [])
    const generatePdf = useCallback(async () => {
        dispatch({ type: 'CLEAR_ERROR' })

        try {
            const response = await apolloClient.query<GeneratePdfQuery, GeneratePdfQueryVariables>({
                query: GeneratePDF,
                variables: { waypoints: waypoints.map(w => w.address) },
            })

            saveAs(b64toblob(response.data.pdf), 'waypoints.pdf')
        } catch (error) {
            dispatch({
                type: 'ERROR_OCCURRED',
                error: `Failed to generate PDF (ERROR: '${error}')`,
            })
        }
    }, [waypoints])
    const shareWaypoints = useCallback(async () => {
        const searchParams = new URLSearchParams()
        searchParams.set('waypoints', waypoints.map(w => w.address).join(','))

        try {
            await (navigator as INavigator).share({
                url: location.origin + location.pathname + '?' + searchParams.toString(),
            })
        } catch (e) {
            if (e instanceof Error && e.name !== 'AbortError') {
                dispatch({
                    type: 'ERROR_OCCURRED',
                    error: `Share failed: ${e.message}`,
                })
            }
        }
    }, [waypoints])

    // Local Actions
    const startBulkEdit = useCallback(() => setIsBulkEditing(true), [])
    const cancelBulkEdit = useCallback(() => setIsBulkEditing(false), [])

    const leftButton = isBulkEditing ? (
        <Button variant={Variant.PrimaryPlain} onClick={cancelBulkEdit}>
            Cancel
        </Button>
    ) : (
        <Button variant={Variant.PrimaryPlain} onClick={reverseWaypoints}>
            <i className="fas fa-fw fa-rotate-90 fa-exchange-alt" /> Reverse
        </Button>
    )

    const rightButton = isBulkEditing ? (
        <Button variant={Variant.PrimaryPlain}>
            <b>Save</b>
        </Button>
    ) : (
        <Button variant={Variant.PrimaryPlain} onClick={startBulkEdit}>
            <i className="fas fa-fw fa-pencil-alt" /> Bulk Edit
        </Button>
    )

    return (
        <Container style={props}>
            <Header>
                <HideButton title="Minimize editor" onClick={hideEditorPane} variant={Variant.Primary}>
                    {compactMode ? (
                        <i className="fas fa-fw fa-map-marked" />
                    ) : (
                        <i className="fas fa-fw fa-chevron-left" />
                    )}
                </HideButton>

                <AppTitle>
                    QuickRoute
                    <AppVersion>
                        v{appVersion} by <Link href="https://github.com/rizadh">@rizadh</Link>
                    </AppVersion>
                </AppTitle>
                {/* <PaneSelector /> */}
            </Header>
            <Body>
                {currentRouteInformation.status === 'FAILED' && (
                    <DangerAlert>One or more waypoints could not be routed</DangerAlert>
                )}
                {waypoints.length === 0 && <Alert>Add a waypoint to begin</Alert>}
                {waypoints.length === 1 && <Alert>Add another waypoint to show route information</Alert>}
                <WaypointList />
            </Body>
            <ActionButtons>
                {leftButton}
                <Spacer />
                {rightButton}
            </ActionButtons>
            <Footer>
                {selectedWaypointsCount > 0 ? (
                    <>
                        <Button variant={Variant.Danger} onClick={deleteSelectedWaypoints}>
                            <i className="fas fa-fw fa-trash" /> Delete {selectedWaypointsCount}{' '}
                            {selectedWaypointsCount > 1 ? 'Waypoints' : 'Waypoint'}
                        </Button>
                        <Button variant={Variant.Primary} onClick={deselectAllWaypoints}>
                            <i className="fas fa-fw fa-ban" /> Cancel
                        </Button>
                    </>
                ) : (
                    <>
                        <InputRow>
                            <Input
                                type="text"
                                placeholder="New waypoint"
                                {...waypointFieldProps}
                                autoFocus={!isMobileDevice}
                            />
                            <Button
                                variant={Variant.Primary}
                                title="Add waypoint"
                                onClick={addWaypoint}
                                disabled={!waypointIsValid}
                            >
                                <i className="fas fa-fw fa-plus" />
                            </Button>
                        </InputRow>
                        <Button variant={Variant.Primary} onClick={generatePdf} disabled={waypoints.length === 0}>
                            <i className={'fas fa-fw fa-file-download'} /> Save PDF
                        </Button>
                        <Button variant={Variant.Primary} onClick={reverseWaypoints} disabled={waypoints.length < 2}>
                            <i className="fas fa-fw fa-exchange-alt" /> Reverse
                        </Button>
                        {(navigator as INavigator).share && (
                            <Button
                                variant={Variant.Primary}
                                onClick={shareWaypoints}
                                disabled={waypoints.length === 0}
                            >
                                <i className="fas fa-fw fa-share" /> Share
                            </Button>
                        )}
                    </>
                )}
            </Footer>
            <InfoBar />
        </Container>
    )
}
