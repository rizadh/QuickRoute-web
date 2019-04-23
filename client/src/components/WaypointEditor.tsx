import React, { useCallback, useContext, useEffect } from 'react'
import { appVersion } from '..'
import { AppStateContext } from '../context/AppStateContext'
import { setEditorPane } from '../redux/actions'
import { EditorPane } from '../redux/state'
import { BulkEditPane } from './editorPanes/BulkEditPane'
import { ImportPane } from './editorPanes/ImportPane'
import { ListPane } from './editorPanes/ListPane'
import { OptimizerPane } from './editorPanes/OptimizerPane'
import { UrlsPane } from './editorPanes/UrlsPane'

type WaypointEditorTemplateProps = {
    paneIsBusy: boolean;
    errorMessage: string;
    body: JSX.Element;
    footer: JSX.Element;
}

export const WaypointEditorTemplate = (props: WaypointEditorTemplateProps) => {
    const {
        state: { editorPane },
        dispatch,
    } = useContext(AppStateContext)

    const { paneIsBusy, errorMessage, body, footer } = props

    const setEditorPaneList = useCallback(() => dispatch(setEditorPane(EditorPane.List)), [])
    const setEditorPaneBulkEdit = useCallback(() => dispatch(setEditorPane(EditorPane.BulkEdit)), [])
    const setEditorPaneLinks = useCallback(() => dispatch(setEditorPane(EditorPane.Links)), [])
    const setEditorPaneImport = useCallback(() => dispatch(setEditorPane(EditorPane.Import)), [])
    const setEditorPaneOptimizer = useCallback(() => dispatch(setEditorPane(EditorPane.Optimizer)), [])

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
                        onClick={setEditorPaneList}
                        disabled={paneIsBusy}
                    >
                        Waypoints
                    </button>
                    <button
                        className={'btn btn-' + (editorPane === EditorPane.BulkEdit ? 'primary' : 'secondary')}
                        onClick={setEditorPaneBulkEdit}
                        disabled={paneIsBusy}
                    >
                        Bulk Edit
                    </button>
                    <button
                        className={'btn btn-' + (editorPane === EditorPane.Links ? 'primary' : 'secondary')}
                        onClick={setEditorPaneLinks}
                        disabled={paneIsBusy}
                    >
                        Links
                    </button>
                    <button
                        className={'btn btn-' + (editorPane === EditorPane.Import ? 'primary' : 'secondary')}
                        onClick={setEditorPaneImport}
                        disabled={paneIsBusy}
                    >
                        Import
                    </button>
                    <button
                        className={'btn btn-' + (editorPane === EditorPane.Optimizer ? 'primary' : 'secondary')}
                        onClick={setEditorPaneOptimizer}
                        disabled={paneIsBusy}
                    >
                        Optimize
                    </button>
                </div>
            </div>
            <div>
                {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
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
        state: { editorPane },
    } = useContext(AppStateContext)

    useEffect(() => {
        const root = document.getElementById('root')
        if (!root) return

        if (editorPane) {
            root.classList.remove('editor-hidden')
        } else {
            root.classList.add('editor-hidden')
        }
    }, [editorPane])

    if (!editorPane) return null

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
