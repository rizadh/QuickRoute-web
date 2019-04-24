import { createContext, Dispatch } from 'react'
import { AppAction } from '../redux/actionTypes'
import { initialState } from '../redux/reducer'
import { AppState } from '../redux/state'

export const AppStateContext = createContext<{
    state: AppState;
    dispatch: Dispatch<AppAction>;
}>({
    state: initialState,
    dispatch: _ => _,
})
