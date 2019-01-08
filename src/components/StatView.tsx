import * as React from 'react'

type StatViewProps = {
    title: string
    value: string
}

export default class StatView extends React.Component<StatViewProps> {
    render() {
        return (
            <div className="statview">
                <span className="font-weight-bold">{this.props.title}</span> {this.props.value}
            </div>
        )
    }
}
