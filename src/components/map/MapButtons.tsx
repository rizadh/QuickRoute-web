import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import styled from 'styled-components'
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

    const enableAutofit = useCallback(() => dispatch({ type: 'ENABLE_AUTOFIT' }), [])
    const showEditorPane = useCallback(() => dispatch({ type: 'SHOW_EDITOR_PANE' }), [])

    return (
        <Container>
            <CSSTransition timeout={200} in={editorIsHidden} classNames="transition" unmountOnExit={true}>
                <PrimaryButton onClick={showEditorPane}>
                    <i className={`fas fa-fw fa-${attributesForEditorPane(editorPane).iconName}`} />
                </PrimaryButton>
            </CSSTransition>
            <CSSTransition timeout={200} in={!autofitIsEnabled} classNames="transition" unmountOnExit={true}>
                <WarningButton onClick={enableAutofit}>
                    <i className="fas fa-fw fa-route" /> Show Route
                </WarningButton>
            </CSSTransition>
        </Container>
    )
}
