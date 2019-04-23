import React, { useCallback, useContext } from 'react'
import { AppStateContext } from '../context/AppStateContext'
import {
    enableAutofit as enableAutofitActionCreator,
    hideEditorPane as hideEditorPaneActionCreator,
    muteMap as muteMapActionCreator,
    showEditorPane as showEditorPaneActionCreator,
    unmuteMap as unmuteMapActionCreator,
} from '../redux/actions'

export const MapButtons = () => {
    const {
        state: { autofitIsEnabled, mutedMapIsEnabled, editorIsHidden },
        dispatch,
    } = useContext(AppStateContext)

    const enableAutofit = useCallback(() => dispatch(enableAutofitActionCreator()), [])
    const muteMap = useCallback(() => dispatch(muteMapActionCreator()), [])
    const unmuteMap = useCallback(() => dispatch(unmuteMapActionCreator()), [])
    const showEditorPane = useCallback(() => dispatch(showEditorPaneActionCreator()), [])
    const hideEditorPane = useCallback(() => dispatch(hideEditorPaneActionCreator()), [])

    return (
        <div id="map-buttons">
            {editorIsHidden ? (
                <button className="btn btn-primary" onClick={showEditorPane}>
                    <i className="fas fa-columns" /> Show Editor
                </button>
            ) : (
                <button className="btn btn-primary" onClick={hideEditorPane}>
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
