import { ChangeEvent, KeyboardEvent, useCallback, useState } from 'react'

export const useInputField = (
    defaultValue: string = '',
    callback: (event: KeyboardEvent) => any,
): {
    value: string;
    setValue: (value: string) => void;
    changeHandler: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    keyPressHandler: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
} => {
    const [value, setValue] = useState(defaultValue)
    const changeHandler = useCallback(event => setValue(event.currentTarget.value), [])
    const keyPressHandler = useCallback(event => event.key === 'Enter' && callback(event), [callback])

    return { value, setValue, changeHandler, keyPressHandler }
}
