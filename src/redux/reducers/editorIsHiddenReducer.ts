import { AppReducer } from './appReducer'

export const editorIsHiddenReducer: AppReducer<boolean> = (editorIsHidden = false, action) => {
    switch (action.type) {
        case 'HIDE_EDITOR_PANE':
            return true
        case 'SHOW_EDITOR_PANE':
            return false
    }

    return editorIsHidden
}
