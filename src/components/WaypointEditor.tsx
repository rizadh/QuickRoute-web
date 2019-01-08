import * as React from 'react'
import WaypointList from './WaypointList'
import { connect } from 'react-redux'
import { Waypoint, AppState } from '../redux/state'
import { reverseWaypoints, createWaypoint, createAndReplaceWaypoints } from '../redux/actions'
import { stringify } from 'query-string'
import { chunk } from 'lodash'
import { routeInformation, RouteInformation } from '../redux/selectors'
import { AppAction } from '../redux/actionTypes'
import Textarea from 'react-textarea-autosize'
import { isValidAddress, parseAddress } from '../redux/validator'

type WaypointEditorState = {
    editorMode: 'regular' | 'bulk' | 'import' | 'importing'
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
        editorMode: 'regular',
        bulkEditFieldValue: '',
        newWaypointFieldValue: '',
        driverNumberFieldValue: '',
    }

    get canReverseWaypoints() {
        return this.props.waypoints.length >= 2
    }

    handleNewWaypointFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            newWaypointFieldValue: e.currentTarget.value
        })
    }

    handleNewWaypointFieldKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isValidAddress(this.state.newWaypointFieldValue))
            this.addNewWaypoint()
    }

    beginBulkEditing = () => {
        this.setState({
            editorMode: 'bulk',
            bulkEditFieldValue: this.props.waypoints.map(w => w.address).join('\n')
        })
    }

    handleBulkEditFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({
            bulkEditFieldValue: e.currentTarget.value
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

        this.setState({
            editorMode: 'regular'
        })
    }

    cancelBulkEditing = () => {
        this.setState({
            editorMode: 'regular'
        })
    }

    beginImportMode = () => {
        this.setState({
            editorMode: 'import'
        })
    }

    handleDriverNumberFieldKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') this.executeImport()
    }

    handleDriverNumberFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            driverNumberFieldValue: e.currentTarget.value
        })
    }

    executeImport = async () => {
        this.setState({
            editorMode: 'importing'
        })

        type Waypoint = { address: string, city: string, postalCode: string }
        type WaypointsResponse = {
            date: string
            driverNumber: string
            waypoints: {
                dispatched: ReadonlyArray<Waypoint>
                inprogress: ReadonlyArray<Waypoint>
            }
        }

        const url = 'https://route-planner.rizadh.com/waypoints/' + this.state.driverNumberFieldValue
        const httpResponse = await fetch(url)
        const jsonResponse = await httpResponse.text()
        const response = JSON.parse(jsonResponse) as WaypointsResponse
        const waypoints = [...response.waypoints.dispatched, ...response.waypoints.inprogress]
        const addresses = waypoints.map(w => `${w.address} ${w.postalCode}`)
        this.props.createAndReplaceWaypoints(addresses)

        this.setState({
            editorMode: 'regular'
        })
    }

    cancelImportMode = () => {
        this.setState({
            editorMode: 'regular'
        })
    }

    get canOpenUrls() {
        return this.props.waypoints.length > 0
    }

    openUrls = () => {
        chunk(this.props.waypoints, 10)
            .map(waypoints => waypoints.map(w => w.address))
            .forEach(addresses => {
                const destination = addresses.pop()
                const parameters = {
                    api: 1,
                    travelmode: 'driving',
                    destination,
                    waypoints: addresses.length > 0 ? addresses.join('|') : undefined
                }

                window.open('https://www.google.com/maps/dir/?' + stringify(parameters))
            })
    }

    get canAddNewWaypoint() {
        return isValidAddress(this.state.newWaypointFieldValue)
    }

    addNewWaypoint = () => {
        this.props.createWaypoint(this.state.newWaypointFieldValue)
        this.setState({
            newWaypointFieldValue: ''
        })
    }

    get headerTitle(): string {
        switch (this.state.editorMode) {
            case 'regular':
                return 'Waypoints'
            case 'bulk':
                return 'Edit Bulk Waypoints'
            case 'import':
            case 'importing':
                return 'Import Waypoints'
        }
    }

    get bodyItems(): JSX.Element {
        switch (this.state.editorMode) {
            case 'regular':
                return <>
                    <div
                        className="alert alert-danger"
                        role="alert"
                        hidden={this.props.routeInformation.status !== 'FAILED'}>
                        Route could not be found
                    </div>
                    <div
                        className="alert alert-info"
                        role="alert"
                        hidden={this.props.waypoints.length > 0}>
                        Enter an address to begin
                    </div>
                    <div
                        className="alert alert-info"
                        role="alert"
                        hidden={this.props.waypoints.length !== 1}>
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
                            autoFocus
                        ></input>
                        <div className="input-group-append">
                            <button
                                onClick={this.addNewWaypoint}
                                disabled={!this.canAddNewWaypoint}
                                className="btn btn-primary">
                                <i className="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </>
            case 'bulk':
                return <>
                    <div className="alert alert-info" role="alert">
                        Enter one address per line
                    </div>
                    <Textarea
                        minRows={3}
                        className="form-control mb-3"
                        onChange={this.handleBulkEditFieldChange}
                        onKeyPress={this.handleBulkEditFieldKeyPress}
                        value={this.state.bulkEditFieldValue}
                        autoFocus
                    >
                    </Textarea>
                </>
            case 'import':
            case 'importing':
                return <>
                    <div
                        className="alert alert-info"
                        role="alert">
                        Waypoints are imported from Atripco
                    </div>
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Driver number"
                        value={this.state.driverNumberFieldValue}
                        onChange={this.handleDriverNumberFieldChange}
                        onKeyPress={this.handleDriverNumberFieldKeyPress}
                        disabled={this.state.editorMode === 'importing'}
                        autoFocus
                    ></input>
                </>
        }
    }

    get footerItems(): JSX.Element {
        switch (this.state.editorMode) {
            case 'regular':
                return <>
                    <button className="btn btn-primary mt-3 ml-3 float-right" onClick={this.beginBulkEditing}>
                        <i className="fas fa-list-alt"></i> Bulk Edit
                    </button>
                    <button
                        className="btn btn-primary mt-3 ml-3 float-right"
                        onClick={this.props.reverseWaypoints}
                        disabled={!this.canReverseWaypoints}
                    >
                        <i className="fas fa-exchange-alt"></i> Reverse
                    </button>
                    <button
                        className="btn btn-primary mt-3 ml-3 float-right"
                        onClick={this.openUrls}
                        disabled={!this.canOpenUrls}
                    >
                        <i className="fas fa-route"></i> Open in Maps
                    </button>
                    <button
                        className="btn btn-primary mt-3 ml-3 float-right"
                        onClick={this.beginImportMode}
                    >
                        <i className="fas fa-cloud-download-alt"></i> Import Waypoints
                    </button>
                </>
            case 'bulk':
                return <>
                    <button
                        className="btn btn-primary mt-3 ml-3 float-right"
                        onClick={this.finishBulkEditing}
                    >
                        <i className="fas fa-save"></i> Save
                    </button>
                    <button className="btn btn-secondary mt-3 ml-3 float-right" onClick={this.cancelBulkEditing}>
                        <i className="fas fa-ban"></i> Cancel
                    </button>
                </>
            case 'import':
                return <>
                    <button
                        className="btn btn-primary mt-3 ml-3 float-right"
                        onClick={this.executeImport}
                    >
                        <i className="fas fa-save"></i> Import
                    </button>
                    <button className="btn btn-secondary mt-3 ml-3 float-right" onClick={this.cancelImportMode}>
                        <i className="fas fa-ban"></i> Cancel
                    </button>
                </>
            case 'importing':
                return <>
                    <button className="btn btn-primary mt-3 ml-3 float-right" disabled>
                        <i className="fas fa-spin fa-circle-notch"></i> Importing
                    </button>
                </>
        }
    }

    render() {
        return <div id="waypoint-editor">
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
    }
}

const mapStateToProps = (state: AppState): WaypointEditorStateProps => ({
    waypoints: state.waypoints,
    routeInformation: routeInformation(state)
})

const mapDispatchToProps = (dispatch: React.Dispatch<AppAction>): WaypointEditorDispatchProps => ({
    createAndReplaceWaypoints: waypoints => dispatch(createAndReplaceWaypoints(waypoints)),
    createWaypoint: waypoint => dispatch(createWaypoint(waypoint)),
    reverseWaypoints: () => dispatch(reverseWaypoints())
})

export default connect(mapStateToProps, mapDispatchToProps)(WaypointEditor)