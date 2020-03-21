import { AppReducer } from './appReducer'
import { EditorPane } from '../state'

export const importDialogIsShownReducer: AppReducer<boolean> = (importDialogIsShown = false, action) => {
    switch (action.type) {
        case 'SET_EDITOR_PANE':
            return action.editorPane === EditorPane.Import
        case 'SHOW_IMPORT_DIALOG':
            return true
        case 'HIDE_IMPORT_DIALOG':
            return false
    }

    return importDialogIsShown
}
