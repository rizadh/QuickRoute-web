import React, { useCallback, useContext } from 'react'
import { AppStateContext } from '../context/AppStateContext'
import {
    enableAutofit as enableAutofitActionCreator,
    muteMap as muteMapActionCreator,
    setEditorPane,
    unmuteMap as unmuteMapActionCreator,
} from '../redux/actions'
import { EditorPane } from '../redux/state'

export const MapButtons = () => {
    const {
        state: { autofitIsEnabled, mutedMapIsEnabled, editorPane },
        dispatch,
    } = useContext(AppStateContext)
    const editorIsHidden = !editorPane

    const enableAutofit = useCallback(() => dispatch(enableAutofitActionCreator()), [])
    const muteMap = useCallback(() => dispatch(muteMapActionCreator()), [])
    const unmuteMap = useCallback(() => dispatch(unmuteMapActionCreator()), [])
    const setEditorPaneList = useCallback(() => dispatch(setEditorPane(EditorPane.List)), [])
    const setEditorPaneNone = useCallback(() => dispatch(setEditorPane()), [])

    return (
        <div id="map-buttons">
            {editorIsHidden ? (
                <button className="btn btn-primary" onClick={setEditorPaneList}>
                    <i className="fas fa-columns" /> Show Editor
                </button>
            ) : (
                <button className="btn btn-primary" onClick={setEditorPaneNone}>
                    <i className="far fa-window-maximize" /> Hide Editor
                </button>
            )}
            {mutedMapIsEnabled ? (
                <button className="btn btn-primary" onClick={unmuteMap}>
                    <i className="fas fa-map-marked" /> Use Regular Map
                </button>
            ) : (
                <button className="btn btn-primary" onClick={muteMap}>
                    <i className="fas fa-map" /> Use Muted Map
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
