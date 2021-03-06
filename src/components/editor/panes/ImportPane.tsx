import isMobileFn from 'ismobilejs'
import React, { Dispatch, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useInput } from '../../../hooks/useInput'
import { AppAction } from '../../../redux/actionTypes'
import { AppState } from '../../../redux/state'
import { Alert, WarningAlert } from '../../common/Alert'
import { Button, Variant } from '../../common/Button'
import { Input } from '../../common/Input'
import { InputRow } from '../../common/InputRow'
import { Link } from '../../common/Link'
import { Body, Footer } from '../Editor'

export const ImportPane = () => {
    const importInProgress = useSelector((state: AppState) => state.importInProgress)
    const waypoints = useSelector((state: AppState) => state.waypoints)
    const dispatch: Dispatch<AppAction> = useDispatch()

    const driverNumberField = useInput({ predicate: value => !!value })
    const passwordField = useInput({ predicate: value => !!value })

    const importWaypoints = useCallback(
        () =>
            dispatch({
                type: 'IMPORT_WAYPOINTS',
                driverNumber: driverNumberField.value,
                password: passwordField.value,
            }),
        [dispatch, driverNumberField.value, passwordField.value],
    )

    const cancelImport = useCallback(
        () => dispatch({ type: 'IMPORT_WAYPOINTS_CANCEL', driverNumber: driverNumberField.value }),
        [dispatch, driverNumberField.value],
    )

    const isMobileDevice = isMobileFn().any

    return (
        <>
            <Body>
                <Alert>
                    Waypoints are imported from{' '}
                    <Link href="http://pickup.atripcocourier.com/ccwap/(S())/cc.aspx">Atripco</Link>
                </Alert>
                <InputRow>
                    <Input
                        type="text"
                        placeholder="Driver number"
                        {...driverNumberField.props}
                        disabled={importInProgress}
                        autoFocus={!isMobileDevice}
                    />
                </InputRow>
                <InputRow>
                    <Input
                        type="password"
                        placeholder="Password"
                        {...passwordField.props}
                        disabled={importInProgress}
                    />
                </InputRow>
                {waypoints.length > 0 && <WarningAlert>Existing waypoints will be replaced</WarningAlert>}
            </Body>

            <Footer>
                {importInProgress ? (
                    <>
                        <Button variant={Variant.Primary} disabled={true}>
                            <i className="fas fa-fw fa-spin fa-circle-notch" /> Importing
                        </Button>
                        <Button variant={Variant.Danger} onClick={cancelImport}>
                            <i className="fas fa-ban" /> Cancel
                        </Button>
                    </>
                ) : (
                    <Button
                        variant={Variant.Primary}
                        onClick={importWaypoints}
                        disabled={!driverNumberField.valueIsValid || !passwordField.valueIsValid}
                    >
                        <i className="fas fa-fw fa-arrow-alt-circle-down" /> Import
                    </Button>
                )}
            </Footer>
        </>
    )
}
