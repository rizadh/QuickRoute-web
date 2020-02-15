import isMobileFn from 'ismobilejs'
import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useInput } from '../hooks/useInput'
import { AppAction } from '../redux/actionTypes'
import { AppState } from '../redux/state'
import { Alert, WarningAlert } from './Alert'
import { DangerButton, PrimaryButton } from './Button'
import { Input } from './Input'
import { InputRow } from './InputRow'
import { Link } from './Link'
import { WaypointEditorTemplate } from './WaypointEditor'

export const ImportPane = () => {
    const importInProgress = useSelector((state: AppState) => state.importInProgress)
    const waypoints = useSelector((state: AppState) => state.waypoints)
    const dispatch: Dispatch<AppAction> = useDispatch()

    const {
        value: driverNumberFieldValue,
        props: driverNumberFieldProps,
        valueIsValid: driverNumberIsValid,
    } = useInput({
        predicate: value => !!value,
    })

    const { value: passwordFieldValue, props: passwordFieldProps, valueIsValid: passwordIsValid } = useInput({
        predicate: value => !!value,
    })

    const importWaypoints = useCallback(
        () =>
            dispatch({ type: 'IMPORT_WAYPOINTS', driverNumber: driverNumberFieldValue, password: passwordFieldValue }),
        [driverNumberFieldValue, passwordFieldValue],
    )

    const cancelImport = useCallback(
        () => dispatch({ type: 'IMPORT_WAYPOINTS_CANCEL', driverNumber: driverNumberFieldValue }),
        [driverNumberFieldValue],
    )

    const isMobileDevice = isMobileFn().any

    const body = (
        <>
            <Alert>
                Waypoints are imported from{' '}
                <Link href="http://pickup.atripcocourier.com/ccwap/(S())/cc.aspx">Atripco</Link>
            </Alert>
            <InputRow>
                <Input
                    type="text"
                    placeholder="Driver number"
                    {...driverNumberFieldProps}
                    disabled={importInProgress}
                    autoFocus={!isMobileDevice}
                />
            </InputRow>
            <InputRow>
                <Input type="password" placeholder="Password" {...passwordFieldProps} disabled={importInProgress} />
            </InputRow>
            {waypoints.length > 0 && <WarningAlert>Existing waypoints will be replaced</WarningAlert>}
        </>
    )

    const footer = importInProgress ? (
        <>
            <PrimaryButton disabled={true}>
                <i className="fas fa-fw fa-spin fa-circle-notch" /> Importing
            </PrimaryButton>
            <DangerButton onClick={cancelImport}>
                <i className="fas fa-ban" /> Cancel
            </DangerButton>
        </>
    ) : (
        <PrimaryButton onClick={importWaypoints} disabled={!driverNumberIsValid || !passwordIsValid}>
            <i className="fas fa-fw fa-cloud-download-alt" /> Import
        </PrimaryButton>
    )

    return <WaypointEditorTemplate body={body} footer={footer} />
}
