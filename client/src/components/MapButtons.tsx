import React, { useCallback, useContext } from 'react'
import { AppStateContext } from '../context/AppStateContext'
import { preventFocus } from './util/preventFocus'

export const MapButtons = () => {
    const {
        state: { autofitIsEnabled, mutedMapIsEnabled, editorIsHidden, importInProgress, optimizationInProgress },
        dispatch,
    } = useContext(AppStateContext)

    const operationInProgress = importInProgress || optimizationInProgress

    const enableAutofit = useCallback(() => dispatch({ type: 'ENABLE_AUTOFIT' }), [])
    const muteMap = useCallback(() => dispatch({ type: 'USE_MUTED_MAP' }), [])
    const unmuteMap = useCallback(() => dispatch({ type: 'USE_REGULAR_MAP' }), [])
    const showEditorPane = useCallback(() => dispatch({ type: 'SHOW_EDITOR_PANE' }), [])
    const hideEditorPane = useCallback(() => dispatch({ type: 'HIDE_EDITOR_PANE' }), [])

    return (
        <div id="map-buttons">
            {editorIsHidden ? (
                <button className="btn btn-primary" onClick={showEditorPane} onMouseDown={preventFocus}>
                    <i className="fas fa-fw fa-columns" /> Show Editor
                </button>
            ) : (
                <button
                    className="btn btn-primary"
                    onClick={hideEditorPane}
                    onMouseDown={preventFocus}
                    disabled={operationInProgress}
                >
                    <i className="fas fa-fw fa-window-maximize" /> Hide Editor
                </button>
            )}
            {mutedMapIsEnabled ? (
                <button className="btn btn-primary" onClick={unmuteMap} onMouseDown={preventFocus}>
                    <i className="fas fa-fw fa-map-marked" /> Use Regular Map
                </button>
            ) : (
                <button className="btn btn-primary" onClick={muteMap} onMouseDown={preventFocus}>
                    <i className="fas fa-fw fa-map" /> Use Muted Map
                </button>
            )}
            {!autofitIsEnabled && (
                <button className="btn btn-warning" onClick={enableAutofit} onMouseDown={preventFocus}>
                    <i className="fas fa-fw fa-expand" /> Auto-Fit
                </button>
            )}
        </div>
    )
}
