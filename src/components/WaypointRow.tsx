import * as React from 'react'
import { Waypoint } from '../redux/state'

interface WaypointRowProps {
    index: number
    waypoint: Waypoint
    moveUp: () => void
    moveDown: () => void
    setAddress: (address: string) => void,
    routeStatus: 'NONE' | 'PARTIAL' | 'ALL'
}

interface WaypointRowState {
    isEditing: boolean
    textFieldValue: string
}

export default class WaypointRow extends React.Component<WaypointRowProps, WaypointRowState> {
    state = {
        isEditing: false,
        textFieldValue: ""
    }

    beginEditing = () => {
        this.setState({
            isEditing: true,
            textFieldValue: this.props.waypoint.address
        })
    }

    endEditing = () => {
        this.props.setAddress(this.state.textFieldValue)

        this.setState({
            isEditing: false
        })
    }

    handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            textFieldValue: e.currentTarget.value
        })
    }

    handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') this.endEditing()
    }

    render() {
        let color: string
        switch (this.props.routeStatus) {
            case 'ALL':
                color = 'black'
                break
            case 'PARTIAL':
                color = 'grey'
                break
            case 'NONE':
                color = 'orange'
                break
            default:
                color = 'red'
                break
        }

        let icon: JSX.Element | number
        if (typeof this.props.waypoint.isGeocoded === 'undefined') {
            icon = <i className="fas fa-circle-notch fa-spin"></i>
        } else if (this.props.waypoint.isGeocoded) {
            icon = <span style={{ color }}>{this.props.index + 1}</span>
        } else {
            icon = <i className="fas fa-exclamation-circle text-danger"></i>
        }

        let textClass: string
        switch (this.props.routeStatus) {
            case 'ALL':
                textClass = 'text-dark'
                break
            case 'PARTIAL':
                textClass = 'text-primary'
                break
            case 'NONE':
                textClass = 'text-warning'
                break
            default:
                textClass = 'text-danger'
                break
        }

        return <tr className={textClass}>
            <td>
                {icon}
            </td>
            <td onClick={this.beginEditing}>
                {this.state.isEditing
                    ? <input
                        ref={e => e && e.focus()}
                        type="text"
                        className="form-control"
                        value={this.state.textFieldValue}
                        onChange={this.handleTextFieldChange}
                        onBlur={this.endEditing}
                        onKeyPress={this.handleKeyPress}
                    ></input>
                    : this.props.waypoint.address
                }
            </td>
            <td align="right">
                <div className="btn-group">
                    <button onClick={this.props.moveUp} className="btn btn-sm btn-secondary">
                        <i className="fas fa-angle-up"></i>
                    </button>
                    <button onClick={this.props.moveDown} className="btn btn-sm btn-secondary">
                        <i className="fas fa-angle-down"></i>
                    </button>
                </div>
            </td>
        </tr>
    }
}