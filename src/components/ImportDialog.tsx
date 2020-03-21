import isMobileFn from 'ismobilejs'
import React, { Dispatch, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useInput } from '../hooks/useInput'
import { AppAction } from '../redux/actionTypes'
import { AppState } from '../redux/state'
import { Alert, WarningAlert, DangerAlert } from './common/Alert'
import { Button, Variant } from './common/Button'
import { Input } from './common/Input'
import { InputRow } from './common/InputRow'
import { Link } from './common/Link'
import { PopupDialog } from './common/PopupDialog'
import { apolloClient } from '..'
import { ImportWaypoints } from '../queries'
import { ImportWaypointsQuery, ImportWaypointsQueryVariables } from '../generated/graphql'
import { createWaypointFromAddress } from '../redux/util/createWaypointFromAddress'

export const ImportDialog = () => {
    const isMobileDevice = isMobileFn().any

    const [isImporting, setIsImporting] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const waypointsLength = useSelector((state: AppState) => state.waypoints.length)
    const { value: driverValue, props: driverProps, valueIsValid: driverNumberIsValid } = useInput({
        predicate: value => !!value,
    })
    const { value: passwordValue, props: passwordProps, valueIsValid: passwordIsValid } = useInput({
        predicate: value => !!value,
    })

    const dispatch: Dispatch<AppAction> = useDispatch()
    const hideDialog = useCallback(() => !isImporting && dispatch({ type: 'HIDE_IMPORT_DIALOG' }), [isImporting])
    const beginImport = useCallback(async () => {
        setError(null)
        setIsImporting(true)

        try {
            const {
                importedWaypoints: { dispatched, inprogress },
            } = await importWaypoints(driverValue, passwordValue)

            if (dispatched.length === 0 && inprogress.length === 0) {
                const message =
                    `Driver ${driverValue} seems to have no active orders. Ensure the driver number entered is ` +
                    'correct and that the orders have been accepted.'
                setError(Error(message))
                setIsImporting(false)
                return
            }

            dispatch({
                type: 'REPLACE_WAYPOINTS',
                waypoints: [...dispatched, ...inprogress]
                    .map(w => `${extractAddress(w.address)} ${w.postalCode}`)
                    .map(createWaypointFromAddress),
            })
            dispatch({ type: 'HIDE_IMPORT_DIALOG' })
        } catch {
            const message =
                'Waypoints could not be imported. Ensure that your driver credentials were entered correctly or ' +
                'contact the developer if this problem persists.'
            setError(Error(message))
            setIsImporting(false)
        }
    }, [driverValue, passwordValue])
    const cancelImport = useCallback(() => {
        setIsImporting(false)
    }, [driverValue])

    const footer = isImporting ? (
        <>
            <Button variant={Variant.Primary} disabled={true}>
                <i className="fas fa-fw fa-spin fa-circle-notch" /> Importing
            </Button>
            <Button variant={Variant.Danger} onClick={cancelImport}>
                <i className="fas fa-ban" /> Cancel
            </Button>
        </>
    ) : (
        <Button variant={Variant.Primary} onClick={beginImport} disabled={!driverNumberIsValid || !passwordIsValid}>
            <i className="fas fa-fw fa-arrow-alt-circle-down" /> {error ? 'Retry Import' : 'Begin Import'}
        </Button>
    )

    return (
        <PopupDialog title="Import Waypoints" footer={footer} onClose={hideDialog}>
            <Alert>
                Waypoints are imported from{' '}
                <Link href="http://pickup.atripcocourier.com/ccwap/(S())/cc.aspx">Atripco</Link>
            </Alert>
            <InputRow>
                <Input
                    type="text"
                    placeholder="Driver number"
                    {...driverProps}
                    disabled={isImporting}
                    autoFocus={!isMobileDevice}
                />
            </InputRow>
            <InputRow>
                <Input type="password" placeholder="Password" {...passwordProps} disabled={isImporting} />
            </InputRow>
            {waypointsLength > 0 && <WarningAlert>Existing waypoints will be replaced</WarningAlert>}
            {error && <DangerAlert>{error.message}</DangerAlert>}
        </PopupDialog>
    )
}

const importWaypoints = async (driverNumber: string, password: string) => {
    try {
        const response = await apolloClient.query<ImportWaypointsQuery, ImportWaypointsQueryVariables>({
            query: ImportWaypoints,
            variables: { driverNumber, password },
        })

        return response.data
    } catch (error) {
        throw new Error(`Failed to import waypoints for driver ${driverNumber} (ERROR: '${error}')`)
    }
}

const extractAddress = (address: string) => {
    return /(\d+ [\w ]+)/.exec(address)?.[1] ?? address
}
