import { AppReducer } from '.'

export const autofitIsEnabledReducer: AppReducer<boolean> = (autofitIsEnabled = true, action) => {
    switch (action.type) {
        case 'ENABLE_AUTOFIT':
            return true
        case 'DISABLE_AUTOFIT':
            return false
    }

    return autofitIsEnabled
}
