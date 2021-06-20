import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { animated, useSpring } from 'react-spring'
import { CSSTransition } from 'react-transition-group'
import styled from 'styled-components'
import { useCompactMode } from '../../hooks/useCompactMode'
import { AppAction } from '../../redux/actionTypes'
import { AppState, attributesForEditorPane } from '../../redux/state'
import { Button, Variant } from '../common/Button'
import compactBreakpoint from '../constants/compactBreakpoint'

const Container = animated(styled.div<{ fullscreen: boolean }>`
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
`)

export const MapButtons = () => {
    const autofitIsEnabled = useSelector((state: AppState) => state.autofitIsEnabled)
    const editorIsHidden = useSelector((state: AppState) => state.editorIsHidden)
    const editorPane = useSelector((state: AppState) => state.editorPane)
    const compactMode = useCompactMode()
    const fullscreen = compactMode || editorIsHidden
    const dispatch: Dispatch<AppAction> = useDispatch()

    const enableAutofit = useCallback(() => dispatch({ type: 'ENABLE_AUTOFIT' }), [dispatch])
    const showEditorPane = useCallback(() => dispatch({ type: 'SHOW_EDITOR_PANE' }), [dispatch])

    const props = useSpring({
        transform: `translateX(${fullscreen ? 0 : 420}px)`,
        config: { mass: 1, tension: 350, friction: 35 },
    })

    return (
        <Container style={props} fullscreen={fullscreen}>
            {editorIsHidden && (
                <Button variant={Variant.Primary} onClick={showEditorPane}>
                    <i className={`fas fa-fw fa-${attributesForEditorPane(editorPane).iconName}`} />
                </Button>
            )}
            <CSSTransition timeout={200} in={!autofitIsEnabled} classNames="transition" unmountOnExit={true}>
                <Button variant={Variant.Warning} onClick={enableAutofit}>
                    <i className="fas fa-fw fa-route" /> Center Map
                </Button>
            </CSSTransition>
        </Container>
    )
}
