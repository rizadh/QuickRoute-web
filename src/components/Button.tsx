import React, { ButtonHTMLAttributes, SyntheticEvent, useCallback } from 'react'

type ButtonTheme = 'primary' | 'secondary' | 'danger' | 'warning' | 'frosted'
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { theme: ButtonTheme }

export const Button = (props: ButtonProps) => {
    const preventFocus = useCallback((e: SyntheticEvent) => e.preventDefault(), [])
    const extraClassName = props.className ? ` ${props.className}` : ''

    return <button {...props} className={`btn btn-${props.theme}` + extraClassName} onMouseDown={preventFocus} />
}
