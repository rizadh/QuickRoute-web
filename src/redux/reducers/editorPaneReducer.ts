import { AppReducer } from '.'
import { EditorPane } from '../state'

export const editorPaneReducer: AppReducer<EditorPane> = (editorPane = EditorPane.List, action) => {
    switch (action.type) {
        case 'SET_EDITOR_PANE':
            return action.editorPane
    }

    return editorPane
}
