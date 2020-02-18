import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import styled from 'styled-components'
import { useCompactMode } from '../../hooks/useCompactMode'
import { AppAction } from '../../redux/actionTypes'
import { AppState, attributesForEditorPane } from '../../redux/state'
import { PrimaryButton, WarningButton } from '../common/Button'
import compactBreakpoint from '../constants/compactBreakpoint'

const Container = styled.div`
    position: absolute;
    top: 0;
    padding: calc(3 * var(--standard-margin) / 4);

    overflow: auto;
    -webkit-overflow-scrolling: touch;

    display: flex;

    @media (max-width: ${compactBreakpoint}px) {
        right: 0;
        flex-direction: row-reverse;
    }

    &::-webkit-scrollbar {
        display: none;
    }

    > button {
        margin: calc(var(--standard-margin) / 4);
    }
`

export const MapButtons = () => {
    const autofitIsEnabled = useSelector((state: AppState) => state.autofitIsEnabled)
    const editorIsHidden = useSelector((state: AppState) => state.editorIsHidden)
    const editorPane = useSelector((state: AppState) => state.editorPane)
    const dispatch: Dispatch<AppAction> = useDispatch()
    const compactMode = useCompactMode()

    const enableAutofit = useCallback(() => dispatch({ type: 'ENABLE_AUTOFIT' }), [])
    const showEditorPane = useCallback(() => dispatch({ type: 'SHOW_EDITOR_PANE' }), [])

    return (
        <Container>
            {editorIsHidden && (
                <PrimaryButton onClick={showEditorPane}>
                    {compactMode ? (
                        <i className={`fas fa-fw fa-${attributesForEditorPane(editorPane).iconName}`} />
                    ) : (
                        <i className="fas fa-fw fa-chevron-right" />
                    )}
                </PrimaryButton>
            )}
            <CSSTransition timeout={100} in={!autofitIsEnabled} classNames="transition" unmountOnExit={true}>
                <WarningButton onClick={enableAutofit}>
                    <i className="fas fa-fw fa-route" /> Show Route
                </WarningButton>
            </CSSTransition>
        </Container>
    )
}
