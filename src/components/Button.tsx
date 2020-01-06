import React, { ReactNode, SyntheticEvent, useCallback } from 'react'

type ButtonType = 'primary' | 'secondary' | 'danger' | 'warning' | 'frosted'
type ButtonProps = {
    id?: string;
    title?: string;
    type: ButtonType;
    onClick?: () => void;
    disabled?: boolean;
    children: ReactNode;
}

export const Button = ({ id, title, type, onClick, disabled, children }: ButtonProps) => {
    const preventFocus = useCallback((e: SyntheticEvent) => e.preventDefault(), [])

    return (
        <button
            id={id}
            title={title}
            className={`btn btn-${type}`}
            onClick={onClick}
            disabled={disabled}
            onMouseDown={preventFocus}
        >
            {children}
        </button>
    )
}
