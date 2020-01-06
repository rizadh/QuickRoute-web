import React, { useCallback, useContext } from 'react'
import { AppStateContext } from '../context/AppStateContext'
import { useCompactMode } from '../hooks/useCompactMode'
import { Button } from './Button'
import { RouteInformationBar } from './RouteInformationBar'

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
                <Button type="frosted" onClick={showEditorPane}>
                    <RouteInformationBar /> <i className={`fas fa-fw fa-chevron-${compactMode ? 'up' : 'down'}`} />
                </Button>
            )}
            {!compactMode &&
                (mutedMapIsEnabled ? (
                    <Button type="primary" onClick={unmuteMap}>
                        <i className="fas fa-fw fa-map-marked" /> Use Regular Map
                    </Button>
                ) : (
                    <Button type="primary" onClick={muteMap}>
                        <i className="fas fa-fw fa-map" /> Use Muted Map
                    </Button>
                ))}
            <Button type="warning" onClick={enableAutofit} disabled={autofitIsEnabled}>
                <i className="fas fa-fw fa-expand" />
                {!compactMode && ' Auto-Fit'}
            </Button>
        </div>
    )
}
