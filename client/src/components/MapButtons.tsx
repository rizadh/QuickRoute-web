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
        state: { autofitIsEnabled, mutedMapIsEnabled, editorIsHidden, importInProgress, optimizationInProgress },
        dispatch,
    } = useContext(AppStateContext)

    const operationInProgress = importInProgress || optimizationInProgress

    const enableAutofit = useCallback(() => dispatch(enableAutofitActionCreator()), [])
    const muteMap = useCallback(() => dispatch(muteMapActionCreator()), [])
    const unmuteMap = useCallback(() => dispatch(unmuteMapActionCreator()), [])
    const showEditorPane = useCallback(() => dispatch(showEditorPaneActionCreator()), [])
    const hideEditorPane = useCallback(() => dispatch(hideEditorPaneActionCreator()), [])

    return (
        <div id="map-buttons">
            {editorIsHidden ? (
                <button className="btn btn-primary" onClick={showEditorPane}>
                    <i className="fas fa-fw fa-columns" /> Show Editor
                </button>
            ) : (
                <button className="btn btn-primary" onClick={hideEditorPane} disabled={operationInProgress}>
                    <i className="fas fa-fw fa-window-maximize" /> Hide Editor
                </button>
            )}
            {mutedMapIsEnabled ? (
                <button className="btn btn-primary" onClick={unmuteMap}>
                    <i className="fas fa-fw fa-map-marked" /> Use Regular Map
                </button>
            ) : (
                <button className="btn btn-primary" onClick={muteMap}>
                    <i className="fas fa-fw fa-map" /> Use Muted Map
                </button>
            )}
            {!autofitIsEnabled && (
                <button className="btn btn-warning" onClick={enableAutofit}>
                    <i className="fas fa-fw fa-expand" /> Auto-Fit
                </button>
            )}
        </div>
    )
}
