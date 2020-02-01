import isMobileFn from 'ismobilejs'
import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Textarea from 'react-textarea-autosize'
import { useInput } from '../hooks/useInput'
import { AppAction } from '../redux/actionTypes'
import { AppState, EditorPane } from '../redux/state'
import { createWaypointFromAddress } from '../redux/util/createWaypointFromAddress'
import { isValidAddress } from '../redux/validator'
import { Alert } from './Alert'
import { PrimaryButton } from './Button'
import { InputRow } from './InputRow'
import { WaypointEditorTemplate } from './WaypointEditor'

export const BulkEditPane = () => {
    const waypoints = useSelector((state: AppState) => state.waypoints)
    const dispatch: Dispatch<AppAction> = useDispatch()

    const { props: bulkEditFieldProps, commitValue: commitBulkEdit } = useInput({
        initialValue: waypoints.map(w => w.address).join('\n'),
        acceptKeyboardEvent: event => event.shiftKey,
        onCommit: useCallback((value: string) => {
            const validAddresses = value
                .split('\n')
                .filter(isValidAddress)
                .map(address => address.trim())

            dispatch({ type: 'REPLACE_WAYPOINTS', waypoints: validAddresses.map(createWaypointFromAddress) })
            dispatch({ type: 'SET_EDITOR_PANE', editorPane: EditorPane.List })
        }, []),
    })

    const isMobileDevice = isMobileFn().any

    const body = (
        <>
            <Alert>Enter one address per line</Alert>
            <InputRow>
                <Textarea
                    minRows={3}
                    {...bulkEditFieldProps}
                    value={bulkEditFieldProps.value?.toString()}
                    autoFocus={!isMobileDevice}
                />
            </InputRow>
        </>
    )

    const footer = (
        <PrimaryButton onClick={commitBulkEdit}>
            <i className="fas fa-fw fa-save" /> Save
        </PrimaryButton>
    )

    return <WaypointEditorTemplate body={body} footer={footer} />
}
