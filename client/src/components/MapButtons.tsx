import React, { useCallback, useContext } from 'react'
import { AppStateContext } from '../context/AppStateContext'
import { EditorVisibilityContext } from '../context/EditorVisibilityContext'
import {
    enableAutofit as enableAutofitActionCreator,
    muteMap as muteMapActionCreator,
    unmuteMap as unmuteMapActionCreator,
} from '../redux/actions'

export const MapButtons = () => {
    const { editorIsHidden, showEditor } = useContext(EditorVisibilityContext)
    const {
        state: { autofitIsEnabled, mutedMapIsEnabled },
        dispatch,
    } = useContext(AppStateContext)

    const enableAutofit = useCallback(() => dispatch(enableAutofitActionCreator()), [])
    const muteMap = useCallback(() => dispatch(muteMapActionCreator()), [])
    const unmuteMap = useCallback(() => dispatch(unmuteMapActionCreator()), [])

    return (
        <div id="map-buttons">
            {mutedMapIsEnabled ? (
                <button className="btn btn-primary" onClick={unmuteMap}>
                    <i className="fas fa-map-marked" /> Use Regular Map
                </button>
            ) : (
                <button className="btn btn-primary" onClick={muteMap}>
                    <i className="fas fa-map" /> Use Muted Map
                </button>
            )}
            {editorIsHidden && (
                <button className="btn btn-primary" onClick={showEditor}>
                    <i className="fas fa-columns" /> Show Editor
                </button>
            )}
            {!autofitIsEnabled && (
                <button className="btn btn-warning" onClick={enableAutofit}>
                    <i className="fas fa-expand" /> Auto-Fit
                </button>
            )}
        </div>
    )
}
