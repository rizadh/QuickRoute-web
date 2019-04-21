import React, { useCallback, useContext } from 'react'
import { AppStateContext } from '../context/AppStateContext'
import { EditorVisibilityContext } from '../context/EditorVisibilityContext'
import { enableAutofit as enableAutofitActionCreator } from '../redux/actions'

export const MapButtons = () => {
    const { editorIsHidden, showEditor } = useContext(EditorVisibilityContext)
    const {
        state: { autofitIsEnabled },
        dispatch,
    } = useContext(AppStateContext)

    const enableAutofit = useCallback(() => dispatch(enableAutofitActionCreator()), [])

    return (
        <div id="map-buttons">
            {!autofitIsEnabled && (
                <button className="btn btn-warning" onClick={enableAutofit}>
                    <i className="fas fa-expand" /> Auto-Fit
                </button>
            )}
            {editorIsHidden && (
                <button className="btn btn-primary" onClick={showEditor}>
                    <i className="fas fa-columns" /> Show Editor
                </button>
            )}
        </div>
    )
}
