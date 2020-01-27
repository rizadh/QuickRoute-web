import React, { Dispatch, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { appVersion } from '../..'
import { useCompactMode } from '../../hooks/useCompactMode'
import { AppAction } from '../../redux/actionTypes'
import { AppState, EditorPane } from '../../redux/state'
import { PrimaryButton, SecondaryButton } from '../Button'
import { RouteInformationBar } from '../RouteInformationBar'
import { BulkEditPane } from './BulkEditPane'
import { ImportPane } from './ImportPane'
import { LinksPane } from './LinksPane'
import { OptimizePane } from './OptimizePane'
import { WaypointsPane } from './WaypointsPane'

import './WaypointEditor.scss'

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
        <div id="waypoint-editor">
            <div id="waypoint-editor-header">
                <SecondaryButton title="Minimize editor" id="waypoint-editor-hide-button" onClick={hideEditorPane}>
                    <i className={'fas fa-fw fa-chevron-' + (compactMode ? 'down' : 'up')} />
                </SecondaryButton>
                <div id="waypoint-editor-header-items">
                    <div id="app-title">
                        QuickRoute
                        <div id="app-version">
                            v{appVersion} by <a href="https://github.com/rizadh">@rizadh</a>
                        </div>
                    </div>
                    <div id="pane-selector">
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
                    </div>
                </div>
            </div>
            <div id="waypoint-editor-body">
                {error && (
                    <div className="text text-danger" role="alert">
                        {error.message}
                    </div>
                )}
                {body}
            </div>
            <div id="waypoint-editor-footer">
                <div id="waypoint-editor-footer-items">{footer}</div>
                <RouteInformationBar />
            </div>
        </div>
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
