import { AppReducer } from './appReducer'

export const navigationDialogIsShownReducer: AppReducer<boolean> = (navigationDialogIsShown = false, action) => {
    switch (action.type) {
        case 'SHOW_NAVIGATION_DIALOG':
            return true
        case 'HIDE_NAVIGATION_DIALOG':
            return false
    }

    return navigationDialogIsShown
}
