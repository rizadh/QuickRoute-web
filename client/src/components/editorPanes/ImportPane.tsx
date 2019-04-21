import React, { useCallback, useContext, useState } from 'react'
import { AppStateContext } from '../../context/AppStateContext'
import { createAndReplaceWaypoints } from '../../redux/actions'
import { EditorPane, WaypointEditorContext, WaypointEditorTemplate } from '../WaypointEditor'

export const ImportPane = () => {
    const { dispatch } = useContext(AppStateContext)
    const [errorMessage, setErrorMessage] = useState('')
    const [driverNumberFieldValue, setDriverNumberFieldValue] = useState('')
    const setEditorMode = useContext(WaypointEditorContext)
    const setEditorModeWaypointList = useCallback(() => setEditorMode(EditorPane.List), [setEditorMode])
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

        setEditorMode(EditorPane.List)
    }, [setEditorMode, driverNumberFieldValue])

    const handleDriverNumberFieldKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') executeImport()
    }

    const handleDriverNumberFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDriverNumberFieldValue(e.currentTarget.value)
    }

    return (
        <WaypointEditorTemplate
            title="Import Waypoints"
            errorMessage={errorMessage}
            body={
                <>
                    <div className="alert alert-info" role="alert">
                        Waypoints are imported from Atripco
                    </div>
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
                </>
            }
            footer={
                importInProgress ? (
                    <button className="btn btn-primary" disabled={true}>
                        <i className="fas fa-spin fa-circle-notch" /> Importing
                    </button>
                ) : (
                    <>
                        <button className="btn btn-primary" onClick={executeImport}>
                            <i className="fas fa-cloud-download-alt" /> Import
                        </button>
                        <button className="btn btn-secondary" onClick={setEditorModeWaypointList}>
                            <i className="fas fa-chevron-left" /> Back
                        </button>
                    </>
                )
            }
        />
    )
}
