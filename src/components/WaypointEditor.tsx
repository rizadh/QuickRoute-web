import * as React from 'react'
import WaypointList from './WaypointList'
import { connect } from 'react-redux'
import AppState, { FetchedRoutes, FetchedPlaces, Waypoint } from '../redux/state'
import { reverseWaypoints, replaceWaypoints, addWaypoint } from '../redux/actions'
import { isValidAddress } from '../redux/validator'
import { stringify } from 'query-string'
import { ThunkDispatch } from 'redux-thunk';
import { ExtraArgument } from '../redux/store';
import { chunk } from 'lodash';
import { routeInformation, RouteInformation } from '../redux/selectors';
import AppAction from '../redux/actionTypes';
import Textarea from 'react-textarea-autosize'

type WaypointEditorState = {
    bulkEditingModeIsEnabled: boolean
    newWaypointFieldValue: string
    bulkEditTextAreaValue: string
}

type WaypointEditorStateProps = {
    waypoints: Waypoint[],
    routeInformation: RouteInformation
}

type WaypointEditorDispatchProps = {
    replaceWaypoints(addresses: string[]): void
    addWaypoint: (address: string) => string | null
    reverseWaypoints(): void
}

type WaypointEditorProps = WaypointEditorStateProps & WaypointEditorDispatchProps

class WaypointEditor extends React.Component<WaypointEditorProps, WaypointEditorState> {
    state: WaypointEditorState = {
        bulkEditingModeIsEnabled: false,
        newWaypointFieldValue: '',
        bulkEditTextAreaValue: '',
    }

    waypointsToEditingString = () => {
        return this.props.waypoints.map(w => w.address).join('\n')
    }

    beginEditingMode = () => {
        this.setState({
            bulkEditTextAreaValue: this.waypointsToEditingString(),
            bulkEditingModeIsEnabled: true
        })
    }

    waypointsFromInput(input: string): string[] {
        return input
            .split('\n')
            .filter(this.waypointIsValid)
            .map(this.parseWaypoint)
    }

    waypointIsValid(input: string): boolean {
        return /[A-Za-z]+/.test(input)
    }

    parseWaypoint(input: string): string {
        return input.replace(/[^A-Za-z0-9\s]/g, "")
    }

    endEditingMode = () => {
        const waypoints = this.waypointsFromInput(this.state.bulkEditTextAreaValue)

        this.props.replaceWaypoints(waypoints)

        this.setState({
            bulkEditingModeIsEnabled: false
        })
    }

    cancelEditingMode = () => {
        this.setState({
            bulkEditingModeIsEnabled: false
        })
    }

    handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({
            bulkEditTextAreaValue: e.currentTarget.value
        })
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

    addNewWaypoint = () => {
        if (this.props.addWaypoint(this.state.newWaypointFieldValue))
            this.setState({
                newWaypointFieldValue: ''
            })
    }

    handleNewWaypointFieldValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            newWaypointFieldValue: e.currentTarget.value
        })
    }

    handleNewWaypointFieldKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') this.addNewWaypoint()
    }

    render() {
        const headerTitle = this.state.bulkEditingModeIsEnabled
            ? "Bulk Edit"
            : "Waypoints"

        const formContent = this.state.bulkEditingModeIsEnabled
            ? <>
                <div className="alert alert-info" role="alert">
                    Enter one address per line
                </div>
                <Textarea
                    minRows={3}
                    className="form-control mb-3"
                    onChange={this.handleTextareaChange}
                    value={this.state.bulkEditTextAreaValue}
                    autoFocus
                >
                </Textarea>
            </>
            : <>
                <div
                    className="alert alert-danger"
                    role="alert"
                    hidden={this.props.routeInformation.status !== 'FAILED'}>
                    One or more waypoints could not be found
                </div>
                <div
                    className="alert alert-info"
                    role="alert"
                    hidden={this.props.waypoints.length > 0 || this.props.routeInformation.status === 'FAILED'}>
                    Enter an address to begin
                </div>
                <div
                    className="alert alert-info"
                    role="alert"
                    hidden={this.props.waypoints.length !== 1 || this.props.routeInformation.status === 'FAILED'}>
                    Enter another address to show route information
                </div>
                <WaypointList />
            </>

        const footerItems = this.state.bulkEditingModeIsEnabled
            ? <>
                <button
                    className="btn btn-primary mt-3 ml-3 float-right"
                    onClick={this.endEditingMode}
                >
                    <i className="fas fa-save"></i> Save
                </button>
                <button className="btn btn-secondary mt-3 ml-3 float-right" onClick={this.cancelEditingMode}>
                    <i className="fas fa-ban"></i> Cancel
                </button>
            </>
            : <>
                <div className="input-group pt-3 pl-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 123 Example Street"
                        value={this.state.newWaypointFieldValue}
                        onChange={this.handleNewWaypointFieldValueChange}
                        onKeyPress={this.handleNewWaypointFieldKeyPress}
                        autoFocus
                    ></input>
                    <div className="input-group-append">
                        <button
                            onClick={this.addNewWaypoint}
                            disabled={!isValidAddress(this.state.newWaypointFieldValue)}
                            className="btn btn-primary">
                            <i className="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <button className="btn btn-primary mt-3 ml-3 float-right" onClick={this.beginEditingMode}>
                    <i className="fas fa-list-alt"></i> Bulk Edit
                </button>
                <button
                    className="btn btn-primary mt-3 ml-3 float-right"
                    onClick={this.props.reverseWaypoints}
                    disabled={this.props.waypoints.length < 2}
                >
                    <i className="fas fa-exchange-alt"></i> Reverse
                </button>
                <button
                    className="btn btn-primary mt-3 ml-3 float-right"
                    onClick={this.openUrls}
                    disabled={this.props.waypoints.length === 0}
                >
                    <i className="fas fa-route"></i> Open in Maps
                </button>
            </>

        return <div id="waypoint-editor">
            <div id="waypoint-editor-header" className="frosted p-3">
                <h2>{headerTitle}</h2>
            </div>
            <div className="px-3 pt-3">
                {formContent}
            </div>
            <div id="waypoint-editor-footer" className="frosted pr-3 pb-3">
                {footerItems}
            </div>
        </div>
    }
}

const mapStateToProps = (state: AppState): WaypointEditorStateProps => ({
    waypoints: state.waypoints,
    routeInformation: routeInformation(state)
})

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, ExtraArgument, AppAction>): WaypointEditorDispatchProps => ({
    replaceWaypoints: waypoints => dispatch(replaceWaypoints(waypoints)),
    addWaypoint: waypoint => dispatch(addWaypoint(waypoint)),
    reverseWaypoints: () => dispatch(reverseWaypoints())
})

export default connect(mapStateToProps, mapDispatchToProps)(WaypointEditor)