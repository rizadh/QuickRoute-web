import * as React from 'react'
import WaypointList from './WaypointList'
import { connect } from 'react-redux'
import AppState, { FetchedRoutes, FetchedPlaces } from '../redux/state'
import { reverseWaypoints, moveWaypointUp, moveWaypointDown, setAndLookupWaypoints, setWaypoint } from '../redux/actions'
import { stringify } from 'query-string'
import { ThunkDispatch } from 'redux-thunk';
import { ExtraArgument } from '../redux/store';
import { chunk } from 'lodash';
import { routeInformation, RouteInformation } from '../redux/selectors';
import AppAction from '../redux/actionTypes';
import Textarea from 'react-textarea-autosize'
import TextareaAutosize from 'react-textarea-autosize';

type WaypointEditorState = {
    bulkEditTextAreaValue: string
    editingModeEnabled: boolean
}

type WaypointEditorStateProps = {
    waypoints: string[],
    fetchedPlaces: FetchedPlaces
    fetchedRoutes: FetchedRoutes
    routeInformation: RouteInformation
}

type WaypointEditorDispatchProps = {
    replaceWaypoints(waypoints: string[]): void
    setWaypoint(index: number, waypoint: string): void
    moveWaypointUp(index: number): void
    moveWaypointDown(index: number): void
    reverseWaypoints(): void
}

type WaypointEditorProps = WaypointEditorStateProps & WaypointEditorDispatchProps

class WaypointEditor extends React.Component<WaypointEditorProps, WaypointEditorState> {
    state: WaypointEditorState = {
        bulkEditTextAreaValue: '',
        editingModeEnabled: false
    }

    waypointsToEditingString = () => {
        return this.props.waypoints.join('\n')
    }

    beginEditingMode = () => {
        this.setState({
            bulkEditTextAreaValue: this.waypointsToEditingString(),
            editingModeEnabled: true
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
            editingModeEnabled: false
        })
    }

    cancelEditingMode = () => {
        this.setState({
            editingModeEnabled: false
        })
    }

    handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({
            bulkEditTextAreaValue: e.currentTarget.value
        })
    }

    openUrls = () => {
        chunk(this.props.waypoints, 10).forEach(waypoints => {
            const destination = waypoints.pop()
            const parameters = {
                api: 1,
                travelmode: 'driving',
                destination,
                waypoints: waypoints.length > 0 ? waypoints.join('|') : undefined
            }

            window.open('https://www.google.com/maps/dir/?' + stringify(parameters))
        })
    }

    render() {
        const headerTitle = this.state.editingModeEnabled
            ? "Bulk Edit"
            : "Waypoints"

        const formContent = this.state.editingModeEnabled
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
                    Add an address to begin
                </div>
                <div
                    className="alert alert-info"
                    role="alert"
                    hidden={this.props.waypoints.length !== 1 || this.props.routeInformation.status === 'FAILED'}>
                    Add another address to show route information
                </div>
                <WaypointList />
            </>

        const buttons = this.state.editingModeEnabled
            ? <>
                <button
                    className="btn btn-primary mt-3 ml-3 float-right"
                    onClick={this.endEditingMode}
                    disabled={this.state.bulkEditTextAreaValue === this.waypointsToEditingString()}
                >
                    <i className="fas fa-save"></i> Save
                </button>
                <button className="btn btn-secondary mt-3 ml-3 float-right" onClick={this.cancelEditingMode}>
                    <i className="fas fa-ban"></i> Cancel
                </button>
            </>
            : <>
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
                    <i className="fas fa-map-marked"></i> Open in Maps
                </button>
            </>

        return <div className="waypoint-editor">
            <div className="waypoint-editor-header frosted p-3">
                <h2>{headerTitle}</h2>
            </div>
            <div className="waypoint-editor-form px-3 pt-3">
                {formContent}
            </div>
            <div className="waypoint-editor-button-bar frosted pr-3 pb-3">
                {buttons}
            </div>
        </div>
    }
}

const mapStateToProps = (state: AppState): WaypointEditorStateProps => ({
    waypoints: state.waypoints,
    fetchedRoutes: state.fetchedRoutes,
    fetchedPlaces: state.fetchedPlaces,
    routeInformation: routeInformation(state)
})

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, ExtraArgument, AppAction>): WaypointEditorDispatchProps => ({
    replaceWaypoints: waypoints => dispatch(setAndLookupWaypoints(waypoints)),
    reverseWaypoints: () => dispatch(reverseWaypoints()),
    setWaypoint: (index, address) => dispatch(setWaypoint(index, address)),
    moveWaypointUp: index => dispatch(moveWaypointUp(index)),
    moveWaypointDown: index => dispatch(moveWaypointDown(index))
})

export default connect(mapStateToProps, mapDispatchToProps)(WaypointEditor)