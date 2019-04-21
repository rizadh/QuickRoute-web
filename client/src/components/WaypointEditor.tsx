import React, { createContext, useState } from 'react'
import { appVersion } from '..'
import { BulkEditPane } from './editorPanes/BulkEditPane'
import { ImportPane } from './editorPanes/ImportPane'
import { ListPane } from './editorPanes/ListPane'
import { OptimizerPane } from './editorPanes/OptimizerPane'
import { UrlsPane } from './editorPanes/UrlsPane'

export enum EditorPane {
    List,
    BulkEdit,
    Import,
    Urls,
    Optimizer,
}

type WaypointEditorTemplateProps = {
    title: string;
    errorMessage: string;
    body: JSX.Element;
    footer: JSX.Element;
}

export const WaypointEditorContext = createContext<(mode: EditorPane) => any>(m => m)

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
    const [editorMode, setEditorMode] = useState<EditorPane>(EditorPane.List)

    switch (editorMode) {
        case EditorPane.List:
            return (
                <WaypointEditorContext.Provider value={setEditorMode}>
                    <ListPane />
                </WaypointEditorContext.Provider>
            )
        case EditorPane.Urls:
            return (
                <WaypointEditorContext.Provider value={setEditorMode}>
                    <UrlsPane />
                </WaypointEditorContext.Provider>
            )
        case EditorPane.BulkEdit:
            return (
                <WaypointEditorContext.Provider value={setEditorMode}>
                    <BulkEditPane />
                </WaypointEditorContext.Provider>
            )
        case EditorPane.Import:
            return (
                <WaypointEditorContext.Provider value={setEditorMode}>
                    <ImportPane />
                </WaypointEditorContext.Provider>
            )
        case EditorPane.Optimizer:
            return (
                <WaypointEditorContext.Provider value={setEditorMode}>
                    <OptimizerPane />
                </WaypointEditorContext.Provider>
            )
    }
}
