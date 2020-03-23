import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import styled from 'styled-components'
import { AppAction } from '../../redux/actionTypes'
import { AppState } from '../../redux/state'
import { Button, Variant } from '../common/Button'
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
    const dispatch: Dispatch<AppAction> = useDispatch()

    const enableAutofit = useCallback(() => dispatch({ type: 'ENABLE_AUTOFIT' }), [])
    const showEditorPane = useCallback(() => dispatch({ type: 'SHOW_EDITOR_PANE' }), [])

    return (
        <Container>
            <CSSTransition timeout={200} in={editorIsHidden} classNames="transition" unmountOnExit={true}>
                <Button variant={Variant.Primary} onClick={showEditorPane}>
                    <i className="fas fa-fw fa-list" />
                </Button>
            </CSSTransition>
            <CSSTransition timeout={200} in={!autofitIsEnabled} classNames="transition" unmountOnExit={true}>
                <Button variant={Variant.Warning} onClick={enableAutofit}>
                    <i className="fas fa-fw fa-route" /> Center Map
                </Button>
            </CSSTransition>
        </Container>
    )
}
