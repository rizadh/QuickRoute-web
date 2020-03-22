import { AppReducer } from './appReducer'
import { EditorPane } from '../state'

export const optimizeDialogIsShownReducer: AppReducer<boolean> = (optimizeDialogIsShown = false, action) => {
    switch (action.type) {
        case 'SET_EDITOR_PANE':
            return action.editorPane === EditorPane.Optimize
        case 'SHOW_OPTIMIZE_DIALOG':
            return true
        case 'HIDE_OPTIMIZE_DIALOG':
            return false
    }

    return optimizeDialogIsShown
}
