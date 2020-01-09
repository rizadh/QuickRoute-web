import { EditorPane } from '../state'
import { AppReducer } from './appReducer'

export const editorPaneReducer: AppReducer<EditorPane> = (editorPane = EditorPane.List, action) => {
    switch (action.type) {
        case 'SET_EDITOR_PANE':
            return action.editorPane
    }

    return editorPane
}
