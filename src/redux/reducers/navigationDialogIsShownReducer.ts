import { AppReducer } from './appReducer'
import { EditorPane } from '../state'

export const navigationDialogIsShownReducer: AppReducer<boolean> = (navigationDialogIsShown = false, action) => {
    switch (action.type) {
        case 'SET_EDITOR_PANE':
            return action.editorPane === EditorPane.Navigation
        case 'SHOW_NAVIGATION_DIALOG':
            return true
        case 'HIDE_NAVIGATION_DIALOG':
            return false
    }

    return navigationDialogIsShown
}
