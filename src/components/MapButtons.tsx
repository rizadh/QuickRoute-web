import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useCompactMode } from '../hooks/useCompactMode'
import { AppAction } from '../redux/actionTypes'
import { AppState } from '../redux/state'
import { FrostedButton, PrimaryButton, WarningButton } from './Button'
import { RouteInformationBar } from './RouteInformationBar'

import './MapButtons.scss'

export const MapButtons = () => {
    const autofitIsEnabled = useSelector((state: AppState) => state.autofitIsEnabled)
    const mutedMapIsEnabled = useSelector((state: AppState) => state.mutedMapIsEnabled)
    const editorIsHidden = useSelector((state: AppState) => state.editorIsHidden)
    const dispatch: Dispatch<AppAction> = useDispatch()
    const compactMode = useCompactMode()

    const enableAutofit = useCallback(() => dispatch({ type: 'ENABLE_AUTOFIT' }), [])
    const muteMap = useCallback(() => dispatch({ type: 'USE_MUTED_MAP' }), [])
    const unmuteMap = useCallback(() => dispatch({ type: 'USE_REGULAR_MAP' }), [])
    const showEditorPane = useCallback(() => dispatch({ type: 'SHOW_EDITOR_PANE' }), [])

    return (
        <div id="map-buttons">
            {editorIsHidden && (
                <FrostedButton onClick={showEditorPane}>
                    <RouteInformationBar /> <i className={`fas fa-fw fa-chevron-${compactMode ? 'up' : 'down'}`} />
                </FrostedButton>
            )}
            {!compactMode &&
                (mutedMapIsEnabled ? (
                    <PrimaryButton onClick={unmuteMap}>
                        <i className="fas fa-fw fa-map-marked" /> Use Regular Map
                    </PrimaryButton>
                ) : (
                    <PrimaryButton onClick={muteMap}>
                        <i className="fas fa-fw fa-map" /> Use Muted Map
                    </PrimaryButton>
                ))}
            <WarningButton onClick={enableAutofit} disabled={autofitIsEnabled}>
                <i className="fas fa-fw fa-expand" />
                {!compactMode && ' Auto-Fit'}
            </WarningButton>
        </div>
    )
}
