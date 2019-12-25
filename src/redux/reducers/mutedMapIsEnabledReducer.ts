import { AppReducer } from '.'

export const mutedMapIsEnabledReducer: AppReducer<boolean> = (mutedMapIsEnabled = false, action) => {
    switch (action.type) {
        case 'USE_MUTED_MAP':
            return true
        case 'USE_REGULAR_MAP':
            return false
    }

    return mutedMapIsEnabled
}
