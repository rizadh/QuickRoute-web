import React, { useContext } from 'react'
import { AppStateContext } from '../context/AppStateContext'
import { EditorVisibilityContext } from '../context/EditorVisibilityContext'
import { enableAutofit } from '../redux/actions'

export const MapButtons = () => {
    const { editorIsHidden, showEditor } = useContext(EditorVisibilityContext)
    const {
        state: { autofitIsEnabled },
        dispatch,
    } = useContext(AppStateContext)

    return (
        <div id="map-buttons">
            {!autofitIsEnabled && (
                <button className="btn btn-warning" onClick={() => dispatch(enableAutofit())}>
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
