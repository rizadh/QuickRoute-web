import React, { Dispatch, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { appVersion } from '..'
import { useCompactMode } from '../hooks/useCompactMode'
import { AppAction } from '../redux/actionTypes'
import { AppState, EditorPane } from '../redux/state'
import { Alert, DangerAlert } from './Alert'
import { BulkEditPane } from './BulkEditPane'
import { PrimaryButton, SecondaryButton } from './Button'
import { ImportPane } from './ImportPane'
import { InfoBar } from './InfoBar'
import { InputRow } from './InputRow'
import { Link } from './Link'
import { LinksPane } from './LinksPane'
import { OptimizePane } from './OptimizePane'
import { compactBreakpoint, editorWidth } from './styleVariables'
import { WaypointsPane } from './WaypointsPane'

const Container = styled.div`
    position: absolute;
    display: flex;
    flex-direction: column;

    width: ${editorWidth}px;
    height: 100%;

    border-right: var(--border-width) solid var(--app-border-color);

    @media (max-width: ${compactBreakpoint}px) {
        width: 100%;

        border: none;
    }
`

const HeaderFooter = styled.div`
    z-index: 1;
    border-color: var(--app-border-color);
`

const Items = styled.div`
    padding-left: var(--standard-margin);
    padding-top: var(--standard-margin);
`

const HeaderFooterItems = styled(Items)`
    > * {
        margin-right: var(--standard-margin);
        margin-bottom: var(--standard-margin);
    }
`

const BodyItems = styled(Items)`
    flex-grow: 1;
    overflow: auto;
    -webkit-overflow-scrolling: touch;

    ${Alert},
    ${InputRow} {
        margin-right: var(--standard-margin);
        margin-bottom: var(--standard-margin);
    }
`

const Header = styled(HeaderFooter)`
    top: 0;
    border-bottom: var(--border-width) solid var(--app-border-color);
`

const Footer = styled(HeaderFooter)`
    bottom: 0;
    border-top: var(--border-width) solid var(--app-border-color);
`

const HideButton = styled(SecondaryButton)`
    position: absolute;
    z-index: 2;
    top: var(--standard-margin);
    right: var(--standard-margin);
    line-height: 1;
`

const AppTitle = styled.div`
    font-size: 24px;
    font-weight: 500;
`

const AppVersion = styled.div`
    font-size: 16px;
    color: var(--app-secondary-text-color);
`

const PaneSelector = styled.div`
    display: flex;
    flex-wrap: wrap;

    margin-right: calc(var(--standard-margin) / 2);
    margin-bottom: calc(var(--standard-margin) / 2);
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
    margin-right: calc(var(--standard-margin) / 2);
    margin-bottom: calc(var(--standard-margin) / 2);

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
                <HeaderFooterItems>
                    <AppTitle>
                        QuickRoute
                        {!compactMode && (
                            <AppVersion>
                                v{appVersion} by <Link href="https://github.com/rizadh">@rizadh</Link>
                            </AppVersion>
                        )}
                    </AppTitle>
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
                </HeaderFooterItems>
            </Header>
            <BodyItems>
                {error && <DangerAlert>{error.message}</DangerAlert>}
                {body}
            </BodyItems>
            <Footer>
                <HeaderFooterItems>{footer}</HeaderFooterItems>
                <InfoBar />
            </Footer>
        </Container>
    )
}

export const WaypointEditor = () => {
    const editorPane = useSelector((state: AppState) => state.editorPane)
    const editorIsHidden = useSelector((state: AppState) => state.editorIsHidden)

    useEffect(() => {
        const root = document.getElementById('root')
        if (!root) return

        if (editorIsHidden) root.classList.add('editor-hidden')
        else root.classList.remove('editor-hidden')
    }, [editorIsHidden])

    if (editorIsHidden) return null

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
