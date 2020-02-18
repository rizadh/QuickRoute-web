import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { appVersion } from '../..'
import { useCompactMode } from '../../hooks/useCompactMode'
import { AppAction } from '../../redux/actionTypes'
import { AppState, EditorPane } from '../../redux/state'
import { Alert, DangerAlert } from '../common/Alert'
import { Button, SecondaryButton } from '../common/Button'
import { InputRow } from '../common/InputRow'
import { Link } from '../common/Link'
import compactBreakpoint from '../constants/compactBreakpoint'
import { InfoBar } from './InfoBar'
import { BulkEditPane } from './panes/BulkEditPane'
import { ImportPane } from './panes/ImportPane'
import { NavigatePane } from './panes/NavigatePane'
import { OptimizePane } from './panes/OptimizePane'
import { WaypointsPane } from './panes/WaypointsPane'
import { PaneSelector } from './PaneSelector'

const Container = styled.div`
    position: relative;
    width: 420px;
    display: flex;
    flex-direction: column;

    ${InfoBar.Container} {
        flex-shrink: 0;
    }

    @media (max-width: ${compactBreakpoint}px) {
        width: 100%;

        border: none;
    }
`

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

const Body = styled.div`
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

const Footer = styled.div`
    bottom: 0;
    flex-shrink: 0;
    flex-grow: 1;

    border-top: var(--standard-border);
    border-right: var(--standard-border);

    @media (max-width: ${compactBreakpoint}px) {
        border-right: none;
    }

    padding: calc(var(--standard-margin) / 2);

    background-color: var(--secondary-fill-color);

    ${Button}, ${InputRow} {
        margin: calc(var(--standard-margin) / 2);
    }

    ${InputRow} ${Button} {
        margin: initial;
    }
`

const HideButton = styled(SecondaryButton)`
    position: absolute;
    z-index: 2;
    top: var(--standard-margin);
    right: var(--standard-margin);
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

type WaypointEditorTemplateProps = {
    body: JSX.Element;
    footer: JSX.Element;
}

export const WaypointEditorTemplate = ({ body, footer }: WaypointEditorTemplateProps) => {
    const error = useSelector((state: AppState) => state.error)
    const dispatch: Dispatch<AppAction> = useDispatch()
    const compactMode = useCompactMode()
    const hideEditorPane = useCallback(() => dispatch({ type: 'HIDE_EDITOR_PANE' }), [])

    return (
        <Container>
            <Header>
                <HideButton title="Minimize editor" onClick={hideEditorPane}>
                    <i className={'fas fa-fw fa-chevron-' + (compactMode ? 'up' : 'left')} />
                </HideButton>
                <AppTitle>
                    QuickRoute
                    <AppVersion>
                        v{appVersion} by <Link href="https://github.com/rizadh">@rizadh</Link>
                    </AppVersion>
                </AppTitle>
                <PaneSelector />
            </Header>
            <Body>
                {error && <DangerAlert>{error.message}</DangerAlert>}
                {body}
            </Body>
            <Footer>{footer}</Footer>
            <InfoBar />
        </Container>
    )
}

export const WaypointEditor = () => {
    const editorPane = useSelector((state: AppState) => state.editorPane)

    switch (editorPane) {
        case EditorPane.Waypoints:
            return <WaypointsPane />
        case EditorPane.Navigate:
            return <NavigatePane />
        case EditorPane.BulkEdit:
            return <BulkEditPane />
        case EditorPane.Import:
            return <ImportPane />
        case EditorPane.Optimize:
            return <OptimizePane />
    }
}
