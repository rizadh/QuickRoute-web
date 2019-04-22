import React, { useCallback, useContext } from 'react'
import Textarea from 'react-textarea-autosize'
import { AppStateContext } from '../../context/AppStateContext'
import { useInputField } from '../../hooks/useInputField'
import { createAndReplaceWaypoints, setEditorPane as setEditorPaneActionCreator } from '../../redux/actions'
import { EditorPane } from '../../redux/state'
import { isValidAddress, parseAddress } from '../../redux/validator'
import { WaypointEditorTemplate } from '../WaypointEditor'

export const BulkEditPane = () => {
    const { state, dispatch } = useContext(AppStateContext)

    const {
        value: bulkEditFieldValue,
        changeHandler: handleBulkEditFieldChange,
        keyPressHandler: handleBulkEditFieldKeyPress,
    } = useInputField(state.waypoints.map(w => w.address).join('\n'), event => event.shiftKey && commitBulkEdit())

    const commitBulkEdit = useCallback(() => {
        const waypoints = bulkEditFieldValue
            .split('\n')
            .filter(isValidAddress)
            .map(parseAddress)

        dispatch(createAndReplaceWaypoints(waypoints))
        dispatch(setEditorPaneActionCreator(EditorPane.List))
    }, [bulkEditFieldValue])

    return (
        <WaypointEditorTemplate
            paneIsBusy={false}
            errorMessage=""
            body={
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
                            autoFocus={true}
                        />
                    </div>
                </>
            }
            footer={
                <button className="btn btn-primary" onClick={commitBulkEdit}>
                    <i className="fas fa-save" /> Save
                </button>
            }
        />
    )
}
