import copyToClipboard from 'copy-text-to-clipboard'
import { chunk } from 'lodash'
import { stringify } from 'query-string'
import * as React from 'react'
import { connect } from 'react-redux'
import Textarea from 'react-textarea-autosize'
import { appVersion } from '..'
import { EditorVisibilityContext } from '../context/EditorVisibilityContext'
import { createAndReplaceWaypoints, createWaypoint, reverseWaypoints } from '../redux/actions'
import { AppAction } from '../redux/actionTypes'
import { routeInformation, RouteInformation } from '../redux/selectors'
import { AppState, FetchedPlaces, Waypoint } from '../redux/state'
import { isValidAddress, parseAddress } from '../redux/validator'
import WaypointList from './WaypointList'

type WaypointEditorState = {
    editorMode: 'REGULAR' | 'BULK' | 'IMPORT' | 'IMPORTING' | 'SHOW_URLS' | 'OPTIMIZER' | 'OPTIMIZING'
    errorMessage: string,
    bulkEditFieldValue: string
    newWaypointFieldValue: string
    driverNumberFieldValue: string
    startPointFieldValue: string,
    endPointFieldValue: string
}

type WaypointEditorStateProps = {
    waypoints: ReadonlyArray<Waypoint>
    routeInformation: RouteInformation
    fetchedPlaces: FetchedPlaces
}

type WaypointEditorDispatchProps = {
    createAndReplaceWaypoints(addresses: ReadonlyArray<string>): void
    createWaypoint(address: string): void
    reverseWaypoints(): void
}

type WaypointEditorProps = WaypointEditorStateProps & WaypointEditorDispatchProps

class WaypointEditor extends React.Component<WaypointEditorProps, WaypointEditorState> {
    state: WaypointEditorState = {
        editorMode: 'REGULAR',
        errorMessage: '',
        bulkEditFieldValue: '',
        newWaypointFieldValue: '',
        driverNumberFieldValue: '',
        startPointFieldValue: '',
        endPointFieldValue: '',
    }

    // Regular Functions

    handleNewWaypointFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            newWaypointFieldValue: e.currentTarget.value,
        })
    }

    handleNewWaypointFieldKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isValidAddress(this.state.newWaypointFieldValue)) {
            this.addNewWaypoint()
        }
    }

    get canAddNewWaypoint() {
        return isValidAddress(this.state.newWaypointFieldValue)
    }

    addNewWaypoint = () => {
        this.props.createWaypoint(this.state.newWaypointFieldValue)
        this.setState({ newWaypointFieldValue: '' })
    }

    // Bulk Edit Functions

    beginBulkEdit = () => {
        this.setState({
            editorMode: 'BULK',
            errorMessage: '',
            bulkEditFieldValue: this.props.waypoints.map(w => w.address).join('\n'),
        })
    }

    handleBulkEditFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({
            bulkEditFieldValue: e.currentTarget.value,
        })
    }

    handleBulkEditFieldKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.shiftKey) this.commitBulkEdit()
    }

    commitBulkEdit = () => {
        const waypoints = this.state.bulkEditFieldValue
            .split('\n')
            .filter(isValidAddress)
            .map(parseAddress)

        this.props.createAndReplaceWaypoints(waypoints)

        this.setState({ editorMode: 'REGULAR', errorMessage: '' })
    }

    cancelBulkEdit = () => {
        this.setState({ editorMode: 'REGULAR', errorMessage: '' })
    }

    // Import Functions

    beginImportMode = () => {
        this.setState({ editorMode: 'IMPORT', errorMessage: '' })
    }

    handleDriverNumberFieldKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') this.executeImport()
    }

    handleDriverNumberFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            driverNumberFieldValue: e.currentTarget.value,
        })
    }

    executeImport = async () => {
        this.setState({ editorMode: 'IMPORTING', errorMessage: '' })

        type FetchedWaypoint = { address: string, city: string, postalCode: string }
        type WaypointsResponse = {
            date: string
            driverNumber: string
            waypoints: {
                dispatched: ReadonlyArray<FetchedWaypoint>
                inprogress: ReadonlyArray<FetchedWaypoint>
            }
        }

        const url = '/waypoints/' + this.state.driverNumberFieldValue
        const httpResponse = await fetch(url)
        if (!httpResponse.ok) {
            this.setState({
                editorMode: 'REGULAR',
                errorMessage: `Failed to import waypoints for driver ${this.state.driverNumberFieldValue} ` +
                    `(ERROR: '${await httpResponse.text()}')`,
            })
            return
        }
        const jsonResponse = await httpResponse.text()
        const response = JSON.parse(jsonResponse) as WaypointsResponse
        const waypoints = [...response.waypoints.dispatched, ...response.waypoints.inprogress]
        const addresses = waypoints.map(w => `${w.address} ${w.postalCode}`)
        this.props.createAndReplaceWaypoints(addresses)

        this.setState({ editorMode: 'REGULAR', errorMessage: '' })
    }

    cancelImportMode = () => this.setState({ editorMode: 'REGULAR', errorMessage: '' })

    // URLs Functions

    showUrls = () => {
        this.setState({ editorMode: 'SHOW_URLS', errorMessage: '' })
    }

    hideUrls = () => this.setState({ editorMode: 'REGULAR', errorMessage: '' })

    openUrl = (index: number) => () => {
        window.open(this.navigationUrls[index])
    }

    openAllUrls = () => {
        this.navigationUrls.forEach(url => window.open(url))
    }

    copyUrl = (index: number) => () => {
        copyToClipboard(this.navigationUrls[index])
    }

    copyAllUrls = () => {
        copyToClipboard(this.navigationUrls.join('\n'))
    }

    get navigationUrls() {
        return chunk(this.props.waypoints, 10)
            .map(waypoints => waypoints.map(w => w.address))
            .map(addresses => {
                const destination = addresses.pop()
                const parameters = {
                    api: 1,
                    destination,
                    travelmode: 'driving',
                    waypoints: addresses.length > 0 ? addresses.join('|') : undefined,
                }

                return 'https://www.google.com/maps/dir/?' + stringify(parameters)
            })
    }

    // PDF Functions

    generatePdf = async () => {
        const response = await fetch('/pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ waypoints: this.props.waypoints.map(w => w.address) }),
        })

        if (!response.ok) {
            this.setState({
                editorMode: 'REGULAR',
                errorMessage: `Failed to generate PDF (ERROR: '${await response.text()}')`,
            })
            return
        }

        const url = window.URL.createObjectURL(await response.blob())

        const a = document.createElement('a')
        a.href = url
        a.style.display = 'none'
        document.body.appendChild(a)
        a.download = 'waypoints.pdf'
        a.click()
        a.remove()

        window.URL.revokeObjectURL(url)
    }

    // Optimizer Functions

    showOptimizer = () => {
        this.setState({ editorMode: 'OPTIMIZER', errorMessage: '' })
    }

    hideOptimizer = () => this.setState({ editorMode: 'REGULAR', errorMessage: '' })

    get defaultStartPoint() {
        return this.state.endPointFieldValue ||
            this.props.waypoints[0].address
    }

    get defaultEndPoint() {
        return this.state.startPointFieldValue ||
            this.props.waypoints[this.props.waypoints.length - 1].address
    }

    handleStartPointFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            startPointFieldValue: e.currentTarget.value,
        })
    }

    handleEndPointFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            endPointFieldValue: e.currentTarget.value,
        })
    }

    optimizeTime = () => this.optimize('TIME')
    optimizeDistance = () => this.optimize('DISTANCE')

    optimize = async (optimizationParameter: 'TIME' | 'DISTANCE') => {
        this.setState({ editorMode: 'OPTIMIZING', errorMessage: '' })

        const startPoint = this.state.startPointFieldValue || this.state.endPointFieldValue
        const endPoint = this.state.endPointFieldValue || this.state.startPointFieldValue

        let waypoints: string[]
        if (startPoint) {
            waypoints = [
                startPoint,
                ...this.props.waypoints.map(w => w.address),
                endPoint,
            ]
        } else waypoints = this.props.waypoints.map(w => w.address)

        try {
            const costMatrix = await this.getCostMatrix(waypoints, optimizationParameter)

            const response = await fetch('/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ costMatrix }),
            })

            interface IOptimizeResponse { result: number[] }

            if (!response.ok) {
                this.setState({
                    editorMode: 'REGULAR',
                    errorMessage: `Failed to optimize route (ERROR: '${await response.text()}')`,
                })
                return
            }

            const jsonResponse: IOptimizeResponse = await response.json()
            const optimalOrdering = startPoint ?
                jsonResponse.result.slice(1, -1).map(i => i - 1) :
                jsonResponse.result

            this.props.createAndReplaceWaypoints(optimalOrdering.map(i => this.props.waypoints[i].address))

            this.setState({ editorMode: 'REGULAR', errorMessage: '' })
        } catch (e) {
            this.setState({
                editorMode: 'REGULAR',
                errorMessage: `Failed to optimize route (ERROR: '${e}')`,
            })
        }

    }

    async getCostMatrix(waypoints: string[], optimizationParameter: 'DISTANCE' | 'TIME'): Promise<number[][]> {
        const geocoder = new mapkit.Geocoder({ getsUserLocation: true })
        const directions = new mapkit.Directions()

        return await Promise.all(waypoints.map(async waypointA =>
            await Promise.all(waypoints.map(waypointB => new Promise<number>(async (resolve, reject) => {
                if (waypointA === waypointB) return resolve(0)

                let placeA: mapkit.Place
                let placeB: mapkit.Place

                const fetchedPlaceA = this.props.fetchedPlaces.get(waypointA)

                if (fetchedPlaceA && fetchedPlaceA.status === 'SUCCESS') {
                    placeA = fetchedPlaceA.result
                } else {
                    placeA = await new Promise((resolvePlace, rejectPlace) => {
                        geocoder.lookup(waypointA, (error, data) => {
                            if (error) return rejectPlace(error)

                            const place = data.results[0]
                            if (!place) return rejectPlace(new Error(`Place '${waypointA}' not found`))

                            resolvePlace(place)
                        })
                    })
                }

                const fetchedPlaceB = this.props.fetchedPlaces.get(waypointB)

                if (fetchedPlaceB && fetchedPlaceB.status === 'SUCCESS') {
                    placeB = fetchedPlaceB.result
                } else {
                    placeB = await new Promise((resolvePlace, rejectPlace) => {
                        geocoder.lookup(waypointB, (error, data) => {
                            if (error) return rejectPlace(error)

                            const place = data.results[0]
                            if (!place) return rejectPlace(new Error(`Place '${waypointB}' not found`))

                            resolvePlace(place)
                        })
                    })
                }

                directions.route({ origin: placeA, destination: placeB }, (error, data) => {
                    if (error) return reject(error)

                    const route = data.routes[0]

                    if (!route) {
                        return reject(new Error(`No routes returned: ` +
                            `origin = '${waypointA}', destination = '${waypointB}'`))
                    }

                    switch (optimizationParameter) {
                        case 'DISTANCE':
                            return resolve(route.distance)
                        case 'TIME':
                            return resolve(route.expectedTravelTime)
                    }
                })
            }))),
        ))
    }

    // Content Helper Functions

    get headerTitle(): string {
        switch (this.state.editorMode) {
            case 'REGULAR':
                return 'Waypoints'
            case 'BULK':
                return 'Bulk Edit'
            case 'IMPORT':
            case 'IMPORTING':
                return 'Import Waypoints'
            case 'SHOW_URLS':
                return 'Show Links'
            case 'OPTIMIZER':
            case 'OPTIMIZING':
                return 'Optimizer'
        }
    }

    get bodyItems(): JSX.Element | JSX.Element[] {
        switch (this.state.editorMode) {
            case 'REGULAR':
                return (
                    <>
                        <div
                            className="alert alert-danger"
                            role="alert"
                            hidden={this.props.routeInformation.status !== 'FAILED'}
                        >
                            Route could not be found
                        </div>
                        <div
                            className="alert alert-info"
                            role="alert"
                            hidden={this.props.waypoints.length > 0}
                        >
                            Enter an address to begin
                        </div>
                        <div
                            className="alert alert-info"
                            role="alert"
                            hidden={this.props.waypoints.length !== 1}
                        >
                            Enter another address to show route information
                        </div>
                        <WaypointList />
                        <div className="input-row">
                            <input
                                type="text"
                                placeholder="New waypoint"
                                value={this.state.newWaypointFieldValue}
                                onChange={this.handleNewWaypointFieldChange}
                                onKeyPress={this.handleNewWaypointFieldKeyPress}
                                autoFocus={true}
                            />
                            <button
                                onClick={this.addNewWaypoint}
                                disabled={!this.canAddNewWaypoint}
                                className="btn btn-primary"
                            >
                                <i className="fas fa-plus" />
                            </button>
                        </div>
                    </>
                )
            case 'BULK':
                return (
                    <>
                        <div className="alert alert-info" role="alert">
                            Enter one address per line
                        </div>
                        <div className="input-row">
                            <Textarea
                                minRows={3}
                                onChange={this.handleBulkEditFieldChange}
                                onKeyPress={this.handleBulkEditFieldKeyPress}
                                value={this.state.bulkEditFieldValue}
                                autoFocus={true}
                            />
                        </div>
                    </>
                )
            case 'IMPORT':
            case 'IMPORTING':
                return (
                    <>
                        <div
                            className="alert alert-info"
                            role="alert"
                        >
                            Waypoints are imported from Atripco
                        </div>
                        <div className="input-row">
                            <input
                                type="text"
                                placeholder="Driver number"
                                value={this.state.driverNumberFieldValue}
                                onChange={this.handleDriverNumberFieldChange}
                                onKeyPress={this.handleDriverNumberFieldKeyPress}
                                disabled={this.state.editorMode === 'IMPORTING'}
                                autoFocus={true}
                            />
                        </div>
                    </>
                )
            case 'SHOW_URLS':
                return this.navigationUrls.map((url, index) => (
                    <div key={url} className="input-row">
                        <input
                            type="text"
                            value={url}
                            readOnly={true}
                        />
                        <button
                            onClick={this.copyUrl(index)}
                            className="btn btn-primary"
                        >
                            <i className="far fa-clipboard" />
                        </button>
                        <button
                            onClick={this.openUrl(index)}
                            className="btn btn-primary"
                        >
                            <i className="fas fa-external-link-alt" />
                        </button>
                    </div>
                ))
            case 'OPTIMIZER':
            case 'OPTIMIZING':
                return (
                    <>
                        <div
                            className="alert alert-info"
                            role="alert"
                        >
                            Note that the route found will be the most optimal route from start point to end point
                            passing through all waypoints along the way.
                        </div>
                        <div className="input-row">
                            <input
                                type="text"
                                placeholder={`Start Point (default: ${this.defaultStartPoint})`}
                                value={this.state.startPointFieldValue}
                                onChange={this.handleStartPointFieldChange}
                                disabled={this.state.editorMode === 'OPTIMIZING'}
                                autoFocus={true}
                            />
                        </div>
                        <div className="input-row">
                            <input
                                type="text"
                                placeholder={`End Point (default: ${this.defaultEndPoint})`}
                                value={this.state.endPointFieldValue}
                                onChange={this.handleEndPointFieldChange}
                                disabled={this.state.editorMode === 'OPTIMIZING'}
                            />
                        </div>
                    </>
                )
        }
    }

    get footerItems(): JSX.Element {
        switch (this.state.editorMode) {
            case 'REGULAR':
                return (
                    <>
                        <button className="btn btn-primary" onClick={this.beginBulkEdit}>
                            <i className="fas fa-list-alt" /> Bulk Edit
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={this.beginImportMode}
                        >
                            <i className="fas fa-cloud-download-alt" /> Import Waypoints
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={this.showUrls}
                            disabled={this.props.waypoints.length === 0}
                        >
                            <i className="fas fa-link" /> Show Links
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={this.generatePdf}
                            disabled={this.props.waypoints.length === 0}
                        >
                            <i className="fas fa-file-pdf" /> Generate PDF
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={this.props.reverseWaypoints}
                            disabled={this.props.waypoints.length < 2}
                        >
                            <i className="fas fa-exchange-alt" /> Reverse
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={this.showOptimizer}
                            disabled={this.props.waypoints.length < 3}
                        >
                            <i className="fas fa-star" /> Optimize
                        </button>
                        <EditorVisibilityContext.Consumer>
                            {context =>
                                // tslint:disable-next-line:jsx-no-multiline-js
                                <button
                                    className="btn btn-primary"
                                    onClick={context.hideEditor}
                                >
                                    <i className="far fa-window-maximize" /> Hide Editor
                                </button>
                            }
                        </EditorVisibilityContext.Consumer>
                    </>
                )
            case 'BULK':
                return (
                    <>
                        <button className="btn btn-primary" onClick={this.commitBulkEdit}>
                            <i className="fas fa-save" /> Save
                        </button>
                        <button className="btn btn-secondary" onClick={this.cancelBulkEdit}>
                            <i className="fas fa-chevron-left" /> Back
                        </button>
                    </>
                )
            case 'IMPORT':
                return (
                    <>
                        <button className="btn btn-primary" onClick={this.executeImport}>
                            <i className="fas fa-cloud-download-alt" /> Import
                        </button>
                        <button className="btn btn-secondary" onClick={this.cancelImportMode}>
                            <i className="fas fa-chevron-left" /> Back
                    </button>
                    </>
                )
            case 'IMPORTING':
                return (
                    <>
                        <button className="btn btn-primary" disabled={true}>
                            <i className="fas fa-spin fa-circle-notch" /> Importing
                        </button>
                    </>
                )
            case 'SHOW_URLS':
                return (
                    <>
                        <button className="btn btn-primary" onClick={this.openAllUrls}>
                            <i className="fas fa-external-link-alt" /> Open All
                        </button>
                        <button className="btn btn-primary" onClick={this.copyAllUrls}>
                            <i className="far fa-clipboard" /> Copy All
                        </button>
                        <button className="btn btn-secondary" onClick={this.hideUrls}>
                            <i className="fas fa-chevron-left" /> Back
                        </button>
                    </>
                )
            case 'OPTIMIZER':
                return (
                    <>
                        <button className="btn btn-primary" onClick={this.optimizeDistance}>
                            <i className="fas fa-ruler-combined" /> Optimize Distance
                        </button>
                        <button className="btn btn-primary" onClick={this.optimizeTime}>
                            <i className="fas fa-clock" /> Optimize Time
                        </button>
                        <button className="btn btn-secondary" onClick={this.hideOptimizer}>
                            <i className="fas fa-chevron-left" /> Back
                    </button>
                    </>
                )
            case 'OPTIMIZING':
                return (
                    <>
                        <button className="btn btn-primary" disabled={true}>
                            <i className="fas fa-spin fa-circle-notch" /> Optimizing (this may take a while)
                        </button>
                    </>
                )
        }
    }

    render() {
        return (
            <div id="waypoint-editor">
                <div id="waypoint-editor-header">
                    <div id="app-title">
                        Route Planner {appVersion} by <a href="https://github.com/rizadh">@rizadh</a>
                    </div>
                    <div id="waypoint-editor-title">{this.headerTitle}</div>
                </div>
                <div>
                    <div
                        className="alert alert-danger"
                        role="alert"
                        hidden={!this.state.errorMessage}
                    >
                        {this.state.errorMessage}
                    </div>
                    {this.bodyItems}
                </div>
                <div id="waypoint-editor-footer">
                    {this.footerItems}
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state: AppState): WaypointEditorStateProps => ({
    waypoints: state.waypoints,
    routeInformation: routeInformation(state),
    fetchedPlaces: state.fetchedPlaces,
})

const mapDispatchToProps = (dispatch: React.Dispatch<AppAction>): WaypointEditorDispatchProps => ({
    createAndReplaceWaypoints: waypoints => dispatch(createAndReplaceWaypoints(waypoints)),
    createWaypoint: waypoint => dispatch(createWaypoint(waypoint)),
    reverseWaypoints: () => dispatch(reverseWaypoints()),
})

export default connect(mapStateToProps, mapDispatchToProps)(WaypointEditor)
