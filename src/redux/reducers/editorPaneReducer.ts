import { EditorPane } from '../state'
import { AppReducer } from './appReducer'

export const editorPaneReducer: AppReducer<EditorPane> = (editorPane = EditorPane.Waypoints, action) => {
    switch (action.type) {
        case 'SET_EDITOR_PANE':
            return action.editorPane
        case 'HIDE_IMPORT_DIALOG':
            return EditorPane.Waypoints
    }

    return editorPane
}
