import React, { useCallback, useContext, useEffect } from 'react'
import { appVersion } from '../..'
import { AppStateContext } from '../../context/AppStateContext'
import { useCompactMode } from '../../hooks/useCompactMode'
import { EditorPane } from '../../redux/state'
import { Button } from '../Button'
import { RouteInformationBar } from '../RouteInformationBar'
import { BulkEditPane } from './BulkEditPane'
import { ImportPane } from './ImportPane'
import { LinksPane } from './LinksPane'
import { OptimizePane } from './OptimizePane'
import { WaypointsPane } from './WaypointsPane'

type WaypointEditorTemplateProps = {
    body: JSX.Element;
    footer: JSX.Element;
}

export const WaypointEditorTemplate = (props: WaypointEditorTemplateProps) => {
    const {
        state: { editorPane, importInProgress, optimizationInProgress, error },
        dispatch,
    } = useContext(AppStateContext)
    const compactMode = useCompactMode()

    const paneIsBusy = importInProgress || optimizationInProgress

    const { body, footer } = props

    const setEditorPaneList = useCallback(() => dispatch({ type: 'SET_EDITOR_PANE', editorPane: EditorPane.List }), [])
    const setEditorPaneBulkEdit = useCallback(
        () => dispatch({ type: 'SET_EDITOR_PANE', editorPane: EditorPane.BulkEdit }),
        [],
    )
    const setEditorPaneLinks = useCallback(
        () => dispatch({ type: 'SET_EDITOR_PANE', editorPane: EditorPane.Links }),
        [],
    )
    const setEditorPaneImport = useCallback(
        () => dispatch({ type: 'SET_EDITOR_PANE', editorPane: EditorPane.Import }),
        [],
    )
    const setEditorPaneOptimizer = useCallback(
        () => dispatch({ type: 'SET_EDITOR_PANE', editorPane: EditorPane.Optimizer }),
        [],
    )
    const hideEditorPane = useCallback(() => dispatch({ type: 'HIDE_EDITOR_PANE' }), [])

    return (
        <div id="waypoint-editor">
            <div id="waypoint-editor-header">
                <Button
                    title="Minimize editor"
                    id="waypoint-editor-hide-button"
                    type="secondary"
                    onClick={hideEditorPane}
                >
                    <i className={'fas fa-fw fa-chevron-' + (compactMode ? 'down' : 'up')} />
                </Button>
                <div id="waypoint-editor-header-items">
                    <div id="app-title">
                        QuickRoute
                        <div id="app-version">
                            v{appVersion} by <a href="https://github.com/rizadh">@rizadh</a>
                        </div>
                    </div>
                    <div id="pane-selector">
                        <Button
                            type={editorPane === EditorPane.List ? 'primary' : 'secondary'}
                            onClick={editorPane === EditorPane.List ? undefined : setEditorPaneList}
                            disabled={paneIsBusy}
                        >
                            <i className="fas fa-fw fa-th-list" />
                            {!compactMode && ' Waypoints'}
                        </Button>
                        <Button
                            type={editorPane === EditorPane.BulkEdit ? 'primary' : 'secondary'}
                            onClick={editorPane === EditorPane.BulkEdit ? undefined : setEditorPaneBulkEdit}
                            disabled={paneIsBusy}
                        >
                            <i className="fas fa-fw fa-list-alt" />
                            {!compactMode && ' Bulk Edit'}
                        </Button>
                        <Button
                            type={editorPane === EditorPane.Links ? 'primary' : 'secondary'}
                            onClick={editorPane === EditorPane.Links ? undefined : setEditorPaneLinks}
                            disabled={paneIsBusy}
                        >
                            <i className="fas fa-fw fa-link" />
                            {!compactMode && ' Links'}
                        </Button>
                        <Button
                            type={editorPane === EditorPane.Import ? 'primary' : 'secondary'}
                            onClick={editorPane === EditorPane.Import ? undefined : setEditorPaneImport}
                            disabled={paneIsBusy}
                        >
                            <i className="fas fa-fw fa-cloud-download-alt" />
                            {!compactMode && ' Import'}
                        </Button>
                        <Button
                            type={editorPane === EditorPane.Optimizer ? 'primary' : 'secondary'}
                            onClick={editorPane === EditorPane.Optimizer ? undefined : setEditorPaneOptimizer}
                            disabled={paneIsBusy}
                        >
                            <i className="fas fa-fw fa-star" />
                            {!compactMode && ' Optimize'}
                        </Button>
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
                {footer}
                <RouteInformationBar />
            </div>
        </div>
    )
}

export const WaypointEditor = () => {
    const {
        state: { editorPane, editorIsHidden },
    } = useContext(AppStateContext)

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
