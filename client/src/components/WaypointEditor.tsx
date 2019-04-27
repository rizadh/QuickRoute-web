import React, { useCallback, useContext, useEffect } from 'react'
import { appVersion } from '..'
import { AppStateContext } from '../context/AppStateContext'
import { EditorPane } from '../redux/state'
import { BulkEditPane } from './editorPanes/BulkEditPane'
import { ImportPane } from './editorPanes/ImportPane'
import { ListPane } from './editorPanes/ListPane'
import { OptimizerPane } from './editorPanes/OptimizerPane'
import { UrlsPane } from './editorPanes/UrlsPane'

type WaypointEditorTemplateProps = {
    body: JSX.Element;
    footer: JSX.Element;
}

export const WaypointEditorTemplate = (props: WaypointEditorTemplateProps) => {
    const {
        state: { editorPane, importInProgress, optimizationInProgress, error },
        dispatch,
    } = useContext(AppStateContext)
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

    return (
        <div id="waypoint-editor" className="frosted">
            <div id="waypoint-editor-header" className="frosted">
                <div id="app-title">Route Planner</div>
                <div id="app-version">
                    {appVersion} by <a href="https://github.com/rizadh">@rizadh</a>
                </div>
                <div id="pane-selector">
                    <button
                        className={'btn btn-' + (editorPane === EditorPane.List ? 'primary' : 'secondary')}
                        onClick={editorPane === EditorPane.List ? undefined : setEditorPaneList}
                        disabled={paneIsBusy}
                    >
                        <i className="fas fa-fw fa-th-list" /> Waypoints
                    </button>
                    <button
                        className={'btn btn-' + (editorPane === EditorPane.BulkEdit ? 'primary' : 'secondary')}
                        onClick={editorPane === EditorPane.BulkEdit ? undefined : setEditorPaneBulkEdit}
                        disabled={paneIsBusy}
                    >
                        <i className="fas fa-fw fa-list-alt" /> Bulk Edit
                    </button>
                    <button
                        className={'btn btn-' + (editorPane === EditorPane.Links ? 'primary' : 'secondary')}
                        onClick={editorPane === EditorPane.Links ? undefined : setEditorPaneLinks}
                        disabled={paneIsBusy}
                    >
                        <i className="fas fa-fw fa-link" /> Links
                    </button>
                    <button
                        className={'btn btn-' + (editorPane === EditorPane.Import ? 'primary' : 'secondary')}
                        onClick={editorPane === EditorPane.Import ? undefined : setEditorPaneImport}
                        disabled={paneIsBusy}
                    >
                        <i className="fas fa-fw fa-cloud-download-alt" /> Import
                    </button>
                    <button
                        className={'btn btn-' + (editorPane === EditorPane.Optimizer ? 'primary' : 'secondary')}
                        onClick={editorPane === EditorPane.Optimizer ? undefined : setEditorPaneOptimizer}
                        disabled={paneIsBusy}
                    >
                        <i className="fas fa-fw fa-star" /> Optimize
                    </button>
                </div>
            </div>
            <div>
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error.message}
                    </div>
                )}
                {body}
            </div>
            <div id="waypoint-editor-footer" className="frosted">
                {footer}
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
            return <ListPane />
        case EditorPane.Links:
            return <UrlsPane />
        case EditorPane.BulkEdit:
            return <BulkEditPane />
        case EditorPane.Import:
            return <ImportPane />
        case EditorPane.Optimizer:
            return <OptimizerPane />
    }
}
