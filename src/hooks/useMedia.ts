import { useEffect, useState } from 'react'

export const useMedia = (query: string) => {
    const [result, setResult] = useState(window.matchMedia(query).matches)

    useEffect(() => {
        const queryList = window.matchMedia(query)
        if (queryList.matches !== result) setResult(queryList.matches)

        const handleChange = () => setResult(queryList.matches)
        queryList.addEventListener('change', handleChange)
        return () => queryList.removeEventListener('change', handleChange)
    }, [query, result])

    return result
}
