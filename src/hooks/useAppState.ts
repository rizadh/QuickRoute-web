import { useEffect, useState } from 'react'
import { Dispatch, Store } from 'redux'
import { AppAction } from '../redux/actionTypes'
import { AppState } from '../redux/state'

export const useAppState = (store: Store<AppState>): [AppState, Dispatch<AppAction>] => {
    const [appState, setAppState] = useState(store.getState())

    useEffect(() => store.subscribe(() => setAppState(store.getState())), [store])

    return [appState, store.dispatch]
}
