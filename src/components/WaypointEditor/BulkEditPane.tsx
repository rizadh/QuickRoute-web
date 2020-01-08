import isMobileFn from 'ismobilejs'
import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Textarea from 'react-textarea-autosize'
import { WaypointEditorTemplate } from '.'
import { useInputField } from '../../hooks/useInputField'
import { AppAction } from '../../redux/actionTypes'
import { AppState, EditorPane } from '../../redux/state'
import { createWaypointFromAddress } from '../../redux/util/createWaypointFromAddress'
import { isValidAddress } from '../../redux/validator'
import { Button } from '../Button'

export const BulkEditPane = () => {
    const waypoints = useSelector((state: AppState) => state.waypoints)
    const dispatch: Dispatch<AppAction> = useDispatch()

    const {
        value: bulkEditFieldValue,
        changeHandler: handleBulkEditFieldChange,
        keyPressHandler: handleBulkEditFieldKeyPress,
    } = useInputField(waypoints.map(w => w.address).join('\n'), event => event.shiftKey && commitBulkEdit())

    const commitBulkEdit = useCallback(() => {
        const validAddresses = bulkEditFieldValue
            .split('\n')
            .filter(isValidAddress)
            .map(address => address.trim())

        dispatch({ type: 'REPLACE_WAYPOINTS', waypoints: validAddresses.map(createWaypointFromAddress) })
        dispatch({ type: 'SET_EDITOR_PANE', editorPane: EditorPane.List })
    }, [bulkEditFieldValue])

    const isMobileDevice = isMobileFn().any

    const body = (
        <>
            <div className="text text-secondary" role="alert">
                Enter one address per line
            </div>
            <div className="input-row">
                <Textarea
                    minRows={3}
                    onChange={handleBulkEditFieldChange}
                    onKeyPress={handleBulkEditFieldKeyPress}
                    value={bulkEditFieldValue}
                    autoFocus={!isMobileDevice}
                />
            </div>
        </>
    )

    const footer = (
        <Button type="primary" onClick={commitBulkEdit}>
            <i className="fas fa-fw fa-save" /> Save
        </Button>
    )

    return <WaypointEditorTemplate body={body} footer={footer} />
}
