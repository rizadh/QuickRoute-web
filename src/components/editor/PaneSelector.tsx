import React, { ButtonHTMLAttributes, Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { useCompactMode } from '../../hooks/useCompactMode'
import { AppAction } from '../../redux/actionTypes'
import { AppState, attributesForEditorPane, EditorPane } from '../../redux/state'
import { Button, Variant } from '../common/Button'

const Wrapper = styled.div`
    margin: var(--standard-margin);
    clear: both;
`

const Container = styled.div`
    margin: calc(var(--standard-margin) / -4);
`

type SelectorButtonProps = {
    pane: EditorPane
    className?: ButtonHTMLAttributes<HTMLButtonElement>['className']
}

const SelectorButton = styled(({ pane, className }: SelectorButtonProps) => {
    const selected = useSelector((state: AppState) => state.editorPane === pane)
    const paneIsBusy = useSelector(
        ({ importInProgress, optimizationInProgress }: AppState) => importInProgress || optimizationInProgress,
    )
    const dispatch: Dispatch<AppAction> = useDispatch()
    const setPane = useCallback(() => dispatch({ type: 'SET_EDITOR_PANE', editorPane: pane }), [])
    const compactMode = useCompactMode()

    const attributes = attributesForEditorPane(pane)

    return (
        <Button
            variant={selected ? Variant.Primary : Variant.Secondary}
            className={className}
            disabled={paneIsBusy}
            onClick={selected ? undefined : setPane}
        >
            <i className={`fas fa-fw fa-${attributes.iconName}`} />
            {!compactMode && ` ${attributes.displayName}`}
        </Button>
    )
})`
    margin: calc(var(--standard-margin) / 4);

    line-height: 1;
`

export const PaneSelector = () => (
    <Wrapper>
        <Container>
            <SelectorButton pane={EditorPane.Waypoints} />
            <SelectorButton pane={EditorPane.BulkEdit} />
            <SelectorButton pane={EditorPane.Navigate} />
            <SelectorButton pane={EditorPane.Import} />
            <SelectorButton pane={EditorPane.Optimize} />
            <SelectorButton pane={EditorPane.Export} />
        </Container>
    </Wrapper>
)
