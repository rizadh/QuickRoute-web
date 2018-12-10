import * as React from 'react'
import WaypointTable from './WaypointTable'
import { connect } from 'react-redux'
import AppState, { Waypoint, Address } from '../redux/state'
import { replaceAddresses, reverseWaypoints, setAddress, moveWaypointUp, moveWaypointDown } from '../redux/actions'
import { stringify } from 'query-string'

interface WaypointEditorState {
    rawInput: string,
    editingModeEnabled: boolean,
}

interface WaypointEditorStateProps {
    waypoints: Waypoint[],
    foundRoutes: boolean[]
}

interface WaypointEditorDispatchProps {
    replaceAddresses(addresses: Address[]): void
    setAddress(index: number, address: Address): void
    moveWaypointUp(index: number): void
    moveWaypointDown(index: number): void
    reverseWaypoints(): void
}

type WaypointEditorProps = WaypointEditorStateProps & WaypointEditorDispatchProps

class WaypointEditor extends React.Component<WaypointEditorProps, WaypointEditorState> {
    state: WaypointEditorState = {
        rawInput: '',
        editingModeEnabled: true
    }

    beginEditingMode = () => {
        this.setState({
            rawInput: this.props.waypoints.map(w => w.address).join('\n'),
            editingModeEnabled: true
        })
    }

    addressesFromInput(input: string): string[] {
        return input
            .split('\n')
            .filter(this.addressIsValid)
            .map(this.parseAddress)
    }

    addressIsValid(input: string): boolean {
        return /[A-Za-z]+/.test(input)
    }

    parseAddress(input: string): string {
        return input.replace(/[^A-Za-z0-9\s]/g, "")
    }

    endEditingMode = () => {
        const addresses = this.addressesFromInput(this.state.rawInput)
        if (addresses.length == 0) return

        this.props.replaceAddresses(addresses)

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
            rawInput: e.currentTarget.value
        })
    }

    openUrls = () => {
        const waypoints = this.props.waypoints.map(w => w.address)
        const MAX_WAYPOINTS = 10

        while (waypoints.length > 0) {
            const currentWaypoints = waypoints.splice(0, MAX_WAYPOINTS)
            const destination = currentWaypoints.pop()
            const parameters = {
                api: 1,
                travelmode: 'driving',
                destination,
                waypoints: currentWaypoints.length > 0 ? currentWaypoints.join('|') : undefined
            }

            window.open('https://www.google.com/maps/dir/?' + stringify(parameters))
        }
    }

    get rowsInRawInput() { return this.state.rawInput.split('\n').length }

    render() {
        const headerTitle = this.state.editingModeEnabled
            ? "Editing Waypoints"
            : "Waypoints"

        const formContent = this.state.editingModeEnabled
            ? <>
                <div className="alert alert-info" role="alert">
                    Enter one full address per line
                </div>
                <textarea
                    className="form-control"
                    rows={this.rowsInRawInput}
                    onChange={this.handleTextareaChange}
                    value={this.state.rawInput}>
                </textarea>
            </>
            : <>
                <div
                    className="alert alert-danger"
                    role="alert"
                    hidden={!this.props.waypoints.some(w => w.isGeocoded === false)}>
                    One or more waypoints could not be found
                </div>
                <WaypointTable
                    waypoints={this.props.waypoints}
                    foundRoutes={this.props.foundRoutes}
                    onMoveUp={this.props.moveWaypointUp}
                    onMoveDown={this.props.moveWaypointDown}
                    setAddress={this.props.setAddress}
                />
            </>

        const buttons = this.state.editingModeEnabled
            ? <>
                <button className="btn btn-primary" onClick={this.endEditingMode}>
                    Save
                </button>
                {this.props.waypoints.length > 0
                    ? <button className="btn btn-secondary" onClick={this.cancelEditingMode}>
                        Cancel
                    </button>
                    : null}
            </>
            : <>
                <button className="btn btn-primary" onClick={this.beginEditingMode}>
                    Edit
                </button>
                <button className="btn btn-secondary" onClick={this.props.reverseWaypoints}>
                    Reverse
                </button>
                <button className="btn btn-secondary" onClick={this.openUrls}>
                    Open in <i className="fab fa-google"></i> Maps
                </button>
            </>

        return <div className="waypoint-editor">
            <div className="waypoint-editor-header frosted">
                <h2>{headerTitle}</h2>
            </div>
            <div className="waypoint-editor-form">
                {formContent}
            </div>
            <div className="waypoint-editor-button-bar frosted">
                {buttons}
            </div>
        </div>
    }
}

export default connect<WaypointEditorStateProps, WaypointEditorDispatchProps, {}, AppState>(state => ({
    waypoints: state.waypoints,
    foundRoutes: state.foundRoutes
}), dispatch => ({
    replaceAddresses: waypoints => dispatch(replaceAddresses(waypoints)),
    reverseWaypoints: () => dispatch(reverseWaypoints()),
    setAddress: (index, address) => dispatch(setAddress(index, address)),
    moveWaypointUp: index => dispatch(moveWaypointUp(index)),
    moveWaypointDown: index => dispatch(moveWaypointDown(index))
}))(WaypointEditor)