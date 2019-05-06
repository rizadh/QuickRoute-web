import React from 'react'

type StatViewProps = {
    title: string;
    value: string;
}

export const StatView = (props: StatViewProps) => (
    <div className="statview">
        <span>{props.title}</span> {props.value}
    </div>
)
