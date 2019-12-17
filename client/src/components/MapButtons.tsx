import React, { useCallback, useContext } from 'react'
import { AppStateContext } from '../context/AppStateContext'
import { useCompactMode } from '../hooks/useCompactMode'
import { RouteInformationBar } from './RouteInformationBar'
import { preventFocus } from './util/preventFocus'

export const MapButtons = () => {
    const {
        state: { autofitIsEnabled, mutedMapIsEnabled, editorIsHidden },
        dispatch,
    } = useContext(AppStateContext)
    const compactMode = useCompactMode()

    const enableAutofit = useCallback(() => dispatch({ type: 'ENABLE_AUTOFIT' }), [])
    const muteMap = useCallback(() => dispatch({ type: 'USE_MUTED_MAP' }), [])
    const unmuteMap = useCallback(() => dispatch({ type: 'USE_REGULAR_MAP' }), [])
    const showEditorPane = useCallback(() => dispatch({ type: 'SHOW_EDITOR_PANE' }), [])

    return (
        <div id="map-buttons">
            {editorIsHidden && (
                <button className="btn btn-frosted" onClick={showEditorPane}>
                    <RouteInformationBar collapsed={true} />{' '}
                    <i className={`fas fa-fw fa-chevron-${compactMode ? 'up' : 'down'}`} />
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
