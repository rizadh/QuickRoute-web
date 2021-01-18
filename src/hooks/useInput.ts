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

export const useInput = <E extends InputElement>(config?: InputConfig<E>): InputValues<E> => {
    const [value, setValue] = useState(config?.initialValue ?? '')

    const valueIsValid = useMemo(() => config?.predicate?.(value) ?? true, [config, value])
    const resetValue = useCallback(() => setValue(config?.initialValue ?? ''), [config?.initialValue])
    const commitValue = useCallback(() => config?.onCommit?.(value), [config, value])

    const onChange = useCallback((event: ChangeEvent<E>) => setValue(event.currentTarget.value), [])
    const onKeyPress = useCallback(
        (event: KeyboardEvent<E>) =>
            event.key === 'Enter' &&
            valueIsValid &&
            (config?.acceptKeyboardEvent?.(event) ?? true) &&
            config?.onCommit?.(value) &&
            config?.resetAfterCommit &&
            resetValue(),
        [valueIsValid, config, value, resetValue],
    )

    return { value, setValue, props: { value, onChange, onKeyPress }, resetValue, commitValue, valueIsValid }
}
