import React, { useCallback, useContext } from 'react'
import { WaypointEditorTemplate } from '.'
import { AppStateContext } from '../../context/AppStateContext'
import { useInputField } from '../../hooks/useInputField'
import { preventFocus } from '../util/preventFocus'
import isMobileFn from 'ismobilejs'

export const ImportPane = () => {
    const {
        state: {
            importInProgress,
            waypoints: { list: waypoints },
        },
        dispatch,
    } = useContext(AppStateContext)

    const {
        value: driverNumberFieldValue,
        changeHandler: handleDriverNumberFieldChange,
        keyPressHandler: handleDriverNumberFieldKeyPress,
    } = useInputField('', () => driverNumberFieldValue.length && importWaypoints())

    const importWaypoints = useCallback(
        () => dispatch({ type: 'IMPORT_WAYPOINTS', driverNumber: driverNumberFieldValue }),
        [driverNumberFieldValue],
    )

    const cancelImport = useCallback(
        () => dispatch({ type: 'IMPORT_WAYPOINTS_CANCEL', driverNumber: driverNumberFieldValue }),
        [driverNumberFieldValue],
    )

    const isMobileDevice = isMobileFn().any

    return (
        <WaypointEditorTemplate
            body={
                <>
                    <div className="alert alert-info" role="alert">
                        Waypoints are imported from{' '}
                        <a href="http://pickup.atripcocourier.com/ccwap/(S())/cc.aspx">Atripco</a>
                    </div>
                    <div className="input-row">
                        <input
                            type="text"
                            placeholder="Driver number"
                            value={driverNumberFieldValue}
                            onChange={handleDriverNumberFieldChange}
                            onKeyPress={handleDriverNumberFieldKeyPress}
                            disabled={importInProgress}
                            autoFocus={!isMobileDevice}
                        />
                    </div>
                    {waypoints.length > 0 && (
                        <div className="alert alert-warning" role="alert">
                            Existing waypoints will be replaced
                        </div>
                    )}
                </>
            }
            footer={
                importInProgress ? (
                    <>
                        <button className="btn btn-primary" disabled={true}>
                            <i className="fas fa-fw fa-spin fa-circle-notch" /> Importing
                        </button>
                        <button className="btn btn-danger" onClick={cancelImport} onMouseDown={preventFocus}>
                            <i className="fas fa-ban" /> Cancel
                        </button>
                    </>
                ) : (
                    <button
                        className="btn btn-primary"
                        onClick={importWaypoints}
                        onMouseDown={preventFocus}
                        disabled={!driverNumberFieldValue.length}
                    >
                        <i className="fas fa-fw fa-cloud-download-alt" /> Import
                    </button>
                )
            }
        />
    )
}
