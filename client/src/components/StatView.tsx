import React from 'react'

type StatViewProps = {
    title: string;
    value: string;
}

const StatView = (props: StatViewProps) => (
    <div className="statview">
        <span>{props.title}</span> {props.value}
    </div>
)

export default StatView
