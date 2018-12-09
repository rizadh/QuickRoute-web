import * as React from 'react'
import { Waypoint } from '../redux/state';
import WaypointRow from './WaypointRow'

interface WaypointTableProps {
    waypoints: Waypoint[]
    foundRoutes: boolean[]
    onMoveUp: (index: number) => void
    onMoveDown: (index: number) => void
    setAddress: (index: number, address: string) => void
}

export default class WaypointTable extends React.Component<WaypointTableProps> {
    routeStatus = (index: number): 'NONE' | 'ALL' | 'PARTIAL' => {
        const forwardRoute = this.props.foundRoutes[index]
        const backwardRoute = this.props.foundRoutes[index - 1]
        const lastIndex = this.props.waypoints.length - 1

        if (index === 0) return forwardRoute ? 'ALL' : 'NONE'
        if (index === lastIndex) return backwardRoute ? 'ALL' : 'NONE'
        else if (forwardRoute && backwardRoute) return 'ALL'
        else if (forwardRoute || backwardRoute) return 'PARTIAL'
        else return 'NONE'
    }

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
                    <WaypointRow
                        key={index}
                        index={index}
                        routeStatus={this.routeStatus(index)}
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