import React, { useCallback, useContext, useState } from 'react'
import { AppStateContext } from '../../context/AppStateContext'
import { useInputField } from '../../hooks/useInputField'
import { createAndReplaceWaypoints, setEditorPane as setEditorPaneActionCreator } from '../../redux/actions'
import { EditorPane } from '../../redux/state'
import { WaypointEditorTemplate } from '../WaypointEditor'

export const ImportPane = () => {
    const { dispatch } = useContext(AppStateContext)
    const [errorMessage, setErrorMessage] = useState('')
    const {
        value: driverNumberFieldValue,
        changeHandler: handleDriverNumberFieldChange,
        keyPressHandler: handleDriverNumberFieldKeyPress,
    } = useInputField('', () => executeImport())
    const [importInProgress, setImportInProgress] = useState(false)

    const executeImport = useCallback(async () => {
        setImportInProgress(true)
        setErrorMessage('')

        type FetchedWaypoint = { address: string; city: string; postalCode: string }
        type WaypointsResponse = {
            date: string;
            driverNumber: string;
            waypoints: {
                dispatched: ReadonlyArray<FetchedWaypoint>;
                inprogress: ReadonlyArray<FetchedWaypoint>;
            };
        }

        const url = '/waypoints/' + driverNumberFieldValue
        const httpResponse = await fetch(url)
        if (!httpResponse.ok) {
            setImportInProgress(false)
            setErrorMessage(
                `Failed to import waypoints for driver ${driverNumberFieldValue} ` +
                    `(ERROR: '${await httpResponse.text()}')`,
            )
            return
        }
        const jsonResponse = await httpResponse.text()
        const response = JSON.parse(jsonResponse) as WaypointsResponse
        const waypoints = [...response.waypoints.dispatched, ...response.waypoints.inprogress]
        const addresses = waypoints.map(w => `${w.address} ${w.postalCode}`)
        dispatch(createAndReplaceWaypoints(addresses))
        dispatch(setEditorPaneActionCreator(EditorPane.List))
    }, [driverNumberFieldValue])

    return (
        <WaypointEditorTemplate
            paneIsBusy={importInProgress}
            errorMessage={errorMessage}
            body={
                <>
                    <div className="input-row">
                        <input
                            type="text"
                            placeholder="Driver number"
                            value={driverNumberFieldValue}
                            onChange={handleDriverNumberFieldChange}
                            onKeyPress={handleDriverNumberFieldKeyPress}
                            disabled={importInProgress}
                            autoFocus={true}
                        />
                    </div>
                    <div className="alert alert-info" role="alert">
                        Waypoints are imported from Atripco
                    </div>
                    <div className="alert alert-info" role="alert">
                        All existing waypoints will be replaced
                    </div>
                </>
            }
            footer={
                importInProgress ? (
                    <button className="btn btn-primary" disabled={true}>
                        <i className="fas fa-spin fa-circle-notch" /> Importing
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={executeImport}>
                        <i className="fas fa-cloud-download-alt" /> Import
                    </button>
                )
            }
        />
    )
}
