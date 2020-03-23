import { AppReducer } from './appReducer'

export const optimizeDialogIsShownReducer: AppReducer<boolean> = (optimizeDialogIsShown = false, action) => {
    switch (action.type) {
        case 'SHOW_OPTIMIZE_DIALOG':
            return true
        case 'HIDE_OPTIMIZE_DIALOG':
            return false
    }

    return optimizeDialogIsShown
}
