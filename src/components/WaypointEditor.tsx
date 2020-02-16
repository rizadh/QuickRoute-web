import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { appVersion } from '..'
import { useCompactMode } from '../hooks/useCompactMode'
import { AppAction } from '../redux/actionTypes'
import { AppState, EditorPane } from '../redux/state'
import { Alert, DangerAlert } from './Alert'
import { BulkEditPane } from './BulkEditPane'
import { PrimaryButton, SecondaryButton, StyledButton } from './Button'
import { ImportPane } from './ImportPane'
import { InfoBar } from './InfoBar'
import { InputRow } from './InputRow'
import { Link } from './Link'
import { LinksPane } from './LinksPane'
import { OptimizePane } from './OptimizePane'
import { compactBreakpoint } from './styleVariables'
import { WaypointsPane } from './WaypointsPane'

const Container = styled.div`
    position: relative;
    width: 420px;

    border-right: var(--standard-border);

    @media (max-width: ${compactBreakpoint}px) {
        width: 100%;

        border: none;
    }
`

const Header = styled.div`
    top: 0;
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
    border-top: var(--standard-border);

    padding: calc(var(--standard-margin) / 2);

    ${StyledButton}, ${InputRow} {
        margin: calc(var(--standard-margin) / 2);
    }

    ${InputRow} ${StyledButton} {
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

const PaneSelectorWrapper = styled.div`
    margin: var(--standard-margin);
`

const PaneSelector = styled.div`
    margin: calc(var(--standard-margin) / -4);
`

type PaneSelectorButtonProps = {
    pane: EditorPane;
    children?: React.ReactNode;
    className?: string;
}

const PaneSelectorButton = styled(({ pane, children, className }: PaneSelectorButtonProps) => {
    const selected = useSelector((state: AppState) => state.editorPane === pane)
    const paneIsBusy = useSelector(
        ({ importInProgress, optimizationInProgress }: AppState) => importInProgress || optimizationInProgress,
    )
    const dispatch: Dispatch<AppAction> = useDispatch()
    const setPane = useCallback(() => dispatch({ type: 'SET_EDITOR_PANE', editorPane: pane }), [])

    return selected ? (
        <PrimaryButton disabled={paneIsBusy} className={className}>
            {children}
        </PrimaryButton>
    ) : (
        <SecondaryButton disabled={paneIsBusy} className={className} onClick={setPane}>
            {children}
        </SecondaryButton>
    )
})`
    margin: calc(var(--standard-margin) / 4);

    line-height: 1;
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
                <PaneSelectorWrapper>
                    <PaneSelector>
                        <PaneSelectorButton pane={EditorPane.List}>
                            <i className="fas fa-fw fa-th-list" />
                            {!compactMode && ' Waypoints'}
                        </PaneSelectorButton>
                        <PaneSelectorButton pane={EditorPane.BulkEdit}>
                            <i className="fas fa-fw fa-list-alt" />
                            {!compactMode && ' Bulk Edit'}
                        </PaneSelectorButton>
                        <PaneSelectorButton pane={EditorPane.Links}>
                            <i className="fas fa-fw fa-link" />
                            {!compactMode && ' Links'}
                        </PaneSelectorButton>
                        <PaneSelectorButton pane={EditorPane.Import}>
                            <i className="fas fa-fw fa-cloud-download-alt" />
                            {!compactMode && ' Import'}
                        </PaneSelectorButton>
                        <PaneSelectorButton pane={EditorPane.Optimizer}>
                            <i className="fas fa-fw fa-star" />
                            {!compactMode && ' Optimize'}
                        </PaneSelectorButton>
                    </PaneSelector>
                </PaneSelectorWrapper>
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
