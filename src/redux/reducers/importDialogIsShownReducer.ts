import { AppReducer } from './appReducer'

export const importDialogIsShownReducer: AppReducer<boolean> = (importDialogIsShown = false, action) => {
    switch (action.type) {
        case 'SHOW_IMPORT_DIALOG':
            return true
        case 'HIDE_IMPORT_DIALOG':
            return false
    }

    return importDialogIsShown
}
