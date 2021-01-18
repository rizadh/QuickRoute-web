import { ChangeEvent, KeyboardEvent, useCallback, useMemo, useState } from 'react'

type InputElement = { value: string }

type InputConfig<E extends InputElement> = {
    initialValue?: string
    predicate?: (value: string) => boolean
    acceptKeyboardEvent?: (event: KeyboardEvent<E>) => boolean
    onCommit?: (value: string) => void
    resetAfterCommit?: boolean
}

type InputValues<E extends InputElement> = {
    value: string
    setValue: (value: string) => void
    props: React.InputHTMLAttributes<E> | React.TextareaHTMLAttributes<E>
    resetValue: () => void
    commitValue: () => void
    valueIsValid: boolean
}

const defaultEventFilter = (event: KeyboardEvent<InputElement>) => event.key === 'Enter'

export const useInput = <E extends InputElement>(config?: InputConfig<E>): InputValues<E> => {
    const [value, setValue] = useState(config?.initialValue ?? '')

    const valueIsValid = useMemo(() => config?.predicate?.(value) ?? true, [config, value])
    const resetValue = useCallback(() => setValue(config?.initialValue ?? ''), [config?.initialValue])
    const commitValue = useCallback(() => config?.onCommit?.(value), [config, value])

    const onChange = useCallback((event: ChangeEvent<E>) => setValue(event.currentTarget.value), [])
    const onKeyPress = useCallback(
        (event: KeyboardEvent<E>) => {
            if (!valueIsValid || !config) return
            if (!(config.acceptKeyboardEvent || defaultEventFilter)(event)) return

            config.onCommit?.(value)
            if (config.resetAfterCommit) resetValue()
        },
        [valueIsValid, config, value, resetValue],
    )

    return useMemo(
        () => ({
            value,
            setValue,
            props: { value, onChange, onKeyPress },
            resetValue,
            commitValue,
            valueIsValid,
        }),
        [commitValue, onChange, onKeyPress, resetValue, value, valueIsValid],
    )
}
