import copyToClipboard from 'copy-text-to-clipboard'
import { chunk } from 'lodash'
import { stringify } from 'query-string'
import * as React from 'react'
import { connect } from 'react-redux'
import Textarea from 'react-textarea-autosize'
import { createAndReplaceWaypoints, createWaypoint, reverseWaypoints } from '../redux/actions'
import { AppAction } from '../redux/actionTypes'
import { routeInformation, RouteInformation } from '../redux/selectors'
import { AppState, Waypoint } from '../redux/state'
import { isValidAddress, parseAddress } from '../redux/validator'
import WaypointList from './WaypointList'

type WaypointEditorState = {
    editorMode: 'REGULAR' | 'BULK' | 'IMPORT' | 'IMPORTING' | 'SHOW_URLS'
    bulkEditFieldValue: string
    newWaypointFieldValue: string
    driverNumberFieldValue: string
}

type WaypointEditorStateProps = {
    waypoints: ReadonlyArray<Waypoint>
    routeInformation: RouteInformation
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
        bulkEditFieldValue: '',
        newWaypointFieldValue: '',
        driverNumberFieldValue: '',
    }

    get canReverseWaypoints() {
        return this.props.waypoints.length >= 2
    }

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

    beginBulkEditing = () => {
        this.setState({
            editorMode: 'BULK',
            bulkEditFieldValue: this.props.waypoints.map(w => w.address).join('\n'),
        })
    }

    handleBulkEditFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({
            bulkEditFieldValue: e.currentTarget.value,
        })
    }

    handleBulkEditFieldKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.shiftKey) this.finishBulkEditing()
    }

    finishBulkEditing = () => {
        const waypoints = this.state.bulkEditFieldValue
            .split('\n')
            .filter(isValidAddress)
            .map(parseAddress)

        this.props.createAndReplaceWaypoints(waypoints)

        this.setState({ editorMode: 'REGULAR' })
    }

    cancelBulkEditing = () => {
        this.setState({
            editorMode: 'REGULAR',
        })
    }

    beginImportMode = () => {
        this.setState({
            editorMode: 'IMPORT',
        })
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
        this.setState({ editorMode: 'IMPORTING' })

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
        const jsonResponse = await httpResponse.text()
        const response = JSON.parse(jsonResponse) as WaypointsResponse
        const waypoints = [...response.waypoints.dispatched, ...response.waypoints.inprogress]
        const addresses = waypoints.map(w => `${w.address} ${w.postalCode}`)
        this.props.createAndReplaceWaypoints(addresses)

        this.setState({ editorMode: 'REGULAR' })
    }

    cancelImportMode = () => this.setState({ editorMode: 'REGULAR' })

    get haveUrls() {
        return this.props.waypoints.length > 0
    }

    showUrls = () => {
        this.setState({ editorMode: 'SHOW_URLS' })
    }

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

    cancelShowUrls = () => this.setState({ editorMode: 'REGULAR' })

    generatePdf = async () => {
        const response = await fetch('/pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ waypoints: this.props.waypoints.map(w => w.address) }),
        })

        const url = window.URL.createObjectURL(await response.blob())

        const a = document.createElement('a')
        a.href = url
        a.style.display = 'none'
        document.body.appendChild(a)
        a.download = 'route-list.pdf'
        a.click()
        a.remove()

        window.URL.revokeObjectURL(url)
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

    get canAddNewWaypoint() {
        return isValidAddress(this.state.newWaypointFieldValue)
    }

    addNewWaypoint = () => {
        this.props.createWaypoint(this.state.newWaypointFieldValue)
        this.setState({ newWaypointFieldValue: '' })
    }

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
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="New waypoint"
                                value={this.state.newWaypointFieldValue}
                                onChange={this.handleNewWaypointFieldChange}
                                onKeyPress={this.handleNewWaypointFieldKeyPress}
                                autoFocus={true}
                            />
                            <div className="input-group-append">
                                <button
                                    onClick={this.addNewWaypoint}
                                    disabled={!this.canAddNewWaypoint}
                                    className="btn btn-primary"
                                >
                                    <i className="fas fa-plus" />
                                </button>
                            </div>
                        </div>
                    </>
                )
            case 'BULK':
                return (
                    <>
                        <div className="alert alert-info" role="alert">
                            Enter one address per line
                    </div>
                        <Textarea
                            minRows={3}
                            className="form-control mb-3"
                            onChange={this.handleBulkEditFieldChange}
                            onKeyPress={this.handleBulkEditFieldKeyPress}
                            value={this.state.bulkEditFieldValue}
                            autoFocus={true}
                        />
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
                        <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="Driver number"
                            value={this.state.driverNumberFieldValue}
                            onChange={this.handleDriverNumberFieldChange}
                            onKeyPress={this.handleDriverNumberFieldKeyPress}
                            disabled={this.state.editorMode === 'IMPORTING'}
                            autoFocus={true}
                        />
                    </>
                )
            case 'SHOW_URLS':
                return this.navigationUrls.map((url, index) => (
                    <div key={index} className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control"
                            value={url}
                            readOnly={true}
                        />
                        <div className="input-group-append">
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
                    </div>
                ))
        }
    }

    get footerItems(): JSX.Element {
        switch (this.state.editorMode) {
            case 'REGULAR':
                return (
                    <>
                        <button className="btn btn-primary mt-3 ml-3 float-right" onClick={this.beginBulkEditing}>
                            <i className="fas fa-list-alt" /> Bulk Edit
                        </button>
                        <button
                            className="btn btn-primary mt-3 ml-3 float-right"
                            onClick={this.beginImportMode}
                        >
                            <i className="fas fa-cloud-download-alt" /> Import Waypoints
                        </button>
                        <button
                            className="btn btn-primary mt-3 ml-3 float-right"
                            onClick={this.props.reverseWaypoints}
                            disabled={!this.canReverseWaypoints}
                        >
                            <i className="fas fa-exchange-alt" /> Reverse
                        </button>
                        <button
                            className="btn btn-primary mt-3 ml-3 float-right"
                            onClick={this.showUrls}
                            disabled={!this.haveUrls}
                        >
                            <i className="fas fa-link" /> Show Links
                        </button>
                        <button
                            className="btn btn-primary mt-3 ml-3 float-right"
                            onClick={this.generatePdf}
                        >
                            <i className="fas fa-file-pdf" /> Generate PDF
                        </button>
                    </>
                )
            case 'BULK':
                return (
                    <>
                        <button className="btn btn-primary mt-3 ml-3 float-right" onClick={this.finishBulkEditing}>
                            <i className="fas fa-save" /> Save
                        </button>
                        <button className="btn btn-secondary mt-3 ml-3 float-right" onClick={this.cancelBulkEditing}>
                            <i className="fas fa-chevron-left" /> Back
                        </button>
                    </>
                )
            case 'IMPORT':
                return (
                    <>
                        <button className="btn btn-primary mt-3 ml-3 float-right" onClick={this.executeImport}>
                            <i className="fas fa-cloud-download-alt" /> Import
                        </button>
                        <button className="btn btn-secondary mt-3 ml-3 float-right" onClick={this.cancelImportMode}>
                            <i className="fas fa-chevron-left" /> Back
                    </button>
                    </>
                )
            case 'IMPORTING':
                return (
                    <>
                        <button className="btn btn-primary mt-3 ml-3 float-right" disabled={true}>
                            <i className="fas fa-spin fa-circle-notch" /> Importing
                        </button>
                    </>
                )
            case 'SHOW_URLS':
                return (
                    <>
                        <button className="btn btn-primary mt-3 ml-3 float-right" onClick={this.openAllUrls}>
                            <i className="fas fa-external-link-alt" /> Open All
                        </button>
                        <button className="btn btn-primary mt-3 ml-3 float-right" onClick={this.copyAllUrls}>
                            <i className="far fa-clipboard" /> Copy All
                        </button>
                        <button className="btn btn-secondary mt-3 ml-3 float-right" onClick={this.cancelShowUrls}>
                            <i className="fas fa-chevron-left" /> Back
                        </button>
                    </>
                )
        }
    }

    render() {
        return (
            <div id="waypoint-editor">
                <div id="waypoint-editor-header" className="frosted p-3">
                    <h2>{this.headerTitle}</h2>
                </div>
                <div className="px-3 pt-3">
                    {this.bodyItems}
                </div>
                <div id="waypoint-editor-footer" className="frosted pr-3 pb-3">
                    {this.footerItems}
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state: AppState): WaypointEditorStateProps => ({
    waypoints: state.waypoints,
    routeInformation: routeInformation(state),
})

const mapDispatchToProps = (dispatch: React.Dispatch<AppAction>): WaypointEditorDispatchProps => ({
    createAndReplaceWaypoints: waypoints => dispatch(createAndReplaceWaypoints(waypoints)),
    createWaypoint: waypoint => dispatch(createWaypoint(waypoint)),
    reverseWaypoints: () => dispatch(reverseWaypoints()),
})

export default connect(mapStateToProps, mapDispatchToProps)(WaypointEditor)
