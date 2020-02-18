import React, { ButtonHTMLAttributes, Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { useCompactMode } from '../../hooks/useCompactMode'
import { AppAction } from '../../redux/actionTypes'
import { AppState, attributesForEditorPane, EditorPane } from '../../redux/state'
import { PrimaryButton, SecondaryButton } from '../common/Button'

const Wrapper = styled.div`
    margin: var(--standard-margin);
    clear: both;
`

const Container = styled.div`
    margin: calc(var(--standard-margin) / -4);
`

type SelectorButtonProps = {
    pane: EditorPane;
    className?: ButtonHTMLAttributes<HTMLButtonElement>['className'];
}

const SelectorButton = ({ pane, className }: SelectorButtonProps) => {
    const selected = useSelector((state: AppState) => state.editorPane === pane)
    const paneIsBusy = useSelector(
        ({ importInProgress, optimizationInProgress }: AppState) => importInProgress || optimizationInProgress,
    )
    const dispatch: Dispatch<AppAction> = useDispatch()
    const setPane = useCallback(() => dispatch({ type: 'SET_EDITOR_PANE', editorPane: pane }), [])
    const compactMode = useCompactMode()

    const Button = selected ? PrimaryButton : SecondaryButton

    const attributes = attributesForEditorPane(pane)

    return (
        <Button className={className} disabled={paneIsBusy} onClick={selected ? undefined : setPane}>
            <i className={`fas fa-fw fa-${attributes.iconName}`} />
            {!compactMode && ` ${attributes.displayName}`}
        </Button>
    )
}

const StyledSelectorButton = styled(SelectorButton)`
    margin: calc(var(--standard-margin) / 4);

    line-height: 1;
`

export const PaneSelector = () => (
    <Wrapper>
        <Container>
            <StyledSelectorButton pane={EditorPane.Waypoints} />
            <StyledSelectorButton pane={EditorPane.BulkEdit} />
            <StyledSelectorButton pane={EditorPane.Navigate} />
            <StyledSelectorButton pane={EditorPane.Import} />
            <StyledSelectorButton pane={EditorPane.Optimize} />
        </Container>
    </Wrapper>
)
