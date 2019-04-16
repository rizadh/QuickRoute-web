import * as React from 'react'

type StatViewProps = {
    title: string
    value: string
}

const StatView = (props: StatViewProps) => (
    <div className="statview">
        <span className="font-weight-bold">{props.title}</span> {props.value}
    </div>
)

export default StatView
