import React, { useCallback, useContext, useEffect } from 'react'
import { appVersion } from '../..'
import { AppStateContext } from '../../context/AppStateContext'
import { useCompactMode } from '../../hooks/useCompactMode'
import { EditorPane } from '../../redux/state'
import { RouteInformationBar } from '../RouteInformationBar'
import { preventFocus } from '../util/preventFocus'
import { BulkEditPane } from './BulkEditPane'
import { ImportPane } from './ImportPane'
import { LinksPane } from './LinksPane'
import { OptimizePane } from './OptimizePane'
import { Waypointspane } from './WaypointsPane'

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
                {compactMode && (
                    <button
                        title="Minimize editor"
                        id="waypoint-editor-hide-button"
                        className="btn btn-secondary"
                        onClick={hideEditorPane}
                        onMouseDown={preventFocus}
                    >
                        <i className={'fas fa-chevron-down'} />
                    </button>
                )}
                <div id="waypoint-editor-header-items">
                    <div id="app-title">QuickRoute</div>
                    <div id="app-version">
                        {appVersion} by <a href="https://github.com/rizadh">@rizadh</a>
                    </div>
                    <div id="pane-selector">
                        <button
                            className={'btn btn-' + (editorPane === EditorPane.List ? 'primary' : 'secondary')}
                            onClick={editorPane === EditorPane.List ? undefined : setEditorPaneList}
                            onMouseDown={preventFocus}
                            disabled={paneIsBusy}
                        >
                            <i className="fas fa-fw fa-th-list" /> Waypoints
                        </button>
                        <button
                            className={'btn btn-' + (editorPane === EditorPane.BulkEdit ? 'primary' : 'secondary')}
                            onClick={editorPane === EditorPane.BulkEdit ? undefined : setEditorPaneBulkEdit}
                            onMouseDown={preventFocus}
                            disabled={paneIsBusy}
                        >
                            <i className="fas fa-fw fa-list-alt" /> Bulk Edit
                        </button>
                        <button
                            className={'btn btn-' + (editorPane === EditorPane.Links ? 'primary' : 'secondary')}
                            onClick={editorPane === EditorPane.Links ? undefined : setEditorPaneLinks}
                            onMouseDown={preventFocus}
                            disabled={paneIsBusy}
                        >
                            <i className="fas fa-fw fa-link" /> Links
                        </button>
                        <button
                            className={'btn btn-' + (editorPane === EditorPane.Import ? 'primary' : 'secondary')}
                            onClick={editorPane === EditorPane.Import ? undefined : setEditorPaneImport}
                            onMouseDown={preventFocus}
                            disabled={paneIsBusy}
                        >
                            <i className="fas fa-fw fa-cloud-download-alt" /> Import
                        </button>
                        <button
                            className={'btn btn-' + (editorPane === EditorPane.Optimizer ? 'primary' : 'secondary')}
                            onClick={editorPane === EditorPane.Optimizer ? undefined : setEditorPaneOptimizer}
                            onMouseDown={preventFocus}
                            disabled={paneIsBusy}
                        >
                            <i className="fas fa-fw fa-star" /> Optimize
                        </button>
                    </div>
                </div>
            </div>
            <div id="waypoint-editor-body">
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error.message}
                    </div>
                )}
                {body}
            </div>
            <div id="waypoint-editor-footer">
                {footer}
                <RouteInformationBar />
                {!compactMode && (
                    <button
                        title="Minimize editor"
                        id="waypoint-editor-hide-button"
                        className="btn btn-secondary"
                        onClick={hideEditorPane}
                        onMouseDown={preventFocus}
                    >
                        <i className={'fas fa-chevron-up'} />
                    </button>
                )}
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
            return <Waypointspane />
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
