import React, { useContext, useEffect } from 'react'
import { appVersion } from '..'
import { AppStateContext } from '../context/AppStateContext'
import { EditorPane } from '../redux/state'
import { BulkEditPane } from './editorPanes/BulkEditPane'
import { ImportPane } from './editorPanes/ImportPane'
import { ListPane } from './editorPanes/ListPane'
import { OptimizerPane } from './editorPanes/OptimizerPane'
import { UrlsPane } from './editorPanes/UrlsPane'

type WaypointEditorTemplateProps = {
    title: string;
    errorMessage: string;
    body: JSX.Element;
    footer: JSX.Element;
}

export const WaypointEditorTemplate = (props: WaypointEditorTemplateProps) => (
    <div id="waypoint-editor">
        <div id="waypoint-editor-header">
            <div id="app-title">
                Route Planner {appVersion} by <a href="https://github.com/rizadh">@rizadh</a>
            </div>
            <div id="waypoint-editor-title">{props.title}</div>
        </div>
        <div>
            {props.errorMessage && (
                <div className="alert alert-danger" role="alert">
                    {props.errorMessage}
                </div>
            )}
            {props.body}
        </div>
        <div id="waypoint-editor-footer">{props.footer}</div>
    </div>
)

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
        case EditorPane.Urls:
            return <UrlsPane />
        case EditorPane.BulkEdit:
            return <BulkEditPane />
        case EditorPane.Import:
            return <ImportPane />
        case EditorPane.Optimizer:
            return <OptimizerPane />
    }
}
