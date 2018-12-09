import * as React from 'react'
import { Waypoint } from '../redux/state';
import WaypointRow from './WaypointRow'

interface WaypointTableProps {
    waypoints: Waypoint[]
    onMoveUp: (index: number) => void
    onMoveDown: (index: number) => void
    setAddress: (index: number, address: string) => void
}

export default class WaypointTable extends React.Component<WaypointTableProps> {
    render() {
        return <table className="table">
            <thead>
                <tr>
                    <th scope="col"></th>
                    <th scope="col" className="text-left">Address</th>
                    <th scope="col" className="text-right">Reorder</th>
                </tr>
            </thead>
            <tbody>
                {this.props.waypoints.map((waypoint, index) =>
                    <WaypointRow key={index} index={index + 1}
                        waypoint={waypoint}
                        moveUp={() => this.props.onMoveUp(index)}
                        moveDown={() => this.props.onMoveDown(index)}
                        setAddress={(address) => this.props.setAddress(index, address)}
                    />
                )}
            </tbody>
        </table>
    }
}