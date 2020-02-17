import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { appVersion } from '..'
import { useCompactMode } from '../hooks/useCompactMode'
import { AppAction } from '../redux/actionTypes'
import { AppState, EditorPane } from '../redux/state'
import { Alert, DangerAlert } from './Alert'
import { BulkEditPane } from './BulkEditPane'
import { Button, SecondaryButton } from './Button'
import { ImportPane } from './ImportPane'
import { InfoBar } from './InfoBar'
import { InputRow } from './InputRow'
import { Link } from './Link'
import { LinksPane } from './LinksPane'
import { OptimizePane } from './OptimizePane'
import { PaneSelector } from './PaneSelector'
import { compactBreakpoint } from './styleVariables'
import { WaypointsPane } from './WaypointsPane'

const Container = styled.div`
    position: relative;
    width: 420px;
    display: flex;
    flex-direction: column;

    border-right: var(--standard-border);

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
`

const Body = styled.div`
    padding: calc(var(--standard-margin) / 2);

    overflow: auto;
    -webkit-overflow-scrolling: touch;

    ${Alert}, ${InputRow} {
        padding: calc(var(--standard-margin) / 2);
    }
`

const Footer = styled.div`
    bottom: 0;
    flex-shrink: 0;

    border-top: var(--standard-border);

    padding: calc(var(--standard-margin) / 2);

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

const Spacer = styled.div`
    flex-grow: 1;
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
                    <i className={'fas fa-fw fa-chevron-' + (compactMode ? 'down' : 'left')} />
                </HideButton>
                <AppTitle>
                    QuickRoute
                    {!compactMode && (
                        <AppVersion>
                            v{appVersion} by <Link href="https://github.com/rizadh">@rizadh</Link>
                        </AppVersion>
                    )}
                </AppTitle>
                <PaneSelector />
            </Header>
            <Body>
                {error && <DangerAlert>{error.message}</DangerAlert>}
                {body}
            </Body>
            <Footer>{footer}</Footer>
            <Spacer />
            <InfoBar />
        </Container>
    )
}

export const WaypointEditor = () => {
    const editorPane = useSelector((state: AppState) => state.editorPane)

    switch (editorPane) {
        case EditorPane.List:
            return <WaypointsPane />
        case EditorPane.Links:
            return <LinksPane />
        case EditorPane.BulkEdit:
            return <BulkEditPane />
        case EditorPane.Import:
            return <ImportPane />
        case EditorPane.Optimizer:
            return <OptimizePane />
    }
}
