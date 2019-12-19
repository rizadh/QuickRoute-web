import isMobileFn from 'ismobilejs'
import React, { useCallback, useContext } from 'react'
import Textarea from 'react-textarea-autosize'
import { WaypointEditorTemplate } from '.'
import { AppStateContext } from '../../context/AppStateContext'
import { useInputField } from '../../hooks/useInputField'
import { EditorPane } from '../../redux/state'
import { createWaypointFromAddress } from '../../redux/util'
import { isValidAddress, parseAddress } from '../../redux/validator'
import { preventFocus } from '../util/preventFocus'

export const BulkEditPane = () => {
    const {
        state: {
            waypoints: { list: waypoints },
        },
        dispatch,
    } = useContext(AppStateContext)

    const {
        value: bulkEditFieldValue,
        changeHandler: handleBulkEditFieldChange,
        keyPressHandler: handleBulkEditFieldKeyPress,
    } = useInputField(waypoints.map(w => w.address).join('\n'), event => event.shiftKey && commitBulkEdit())

    const commitBulkEdit = useCallback(() => {
        const validAddresses = bulkEditFieldValue
            .split('\n')
            .filter(isValidAddress)
            .map(parseAddress)

        dispatch({ type: 'REPLACE_WAYPOINTS', waypoints: validAddresses.map(createWaypointFromAddress) })
        dispatch({ type: 'SET_EDITOR_PANE', editorPane: EditorPane.List })
    }, [bulkEditFieldValue])

    const isMobileDevice = isMobileFn().any

    const body = (
        <>
            <div className="alert alert-info" role="alert">
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
        <button className="btn btn-primary" onClick={commitBulkEdit} onMouseDown={preventFocus}>
            <i className="fas fa-fw fa-save" /> Save
        </button>
    )

    return <WaypointEditorTemplate body={body} footer={footer} />
}
