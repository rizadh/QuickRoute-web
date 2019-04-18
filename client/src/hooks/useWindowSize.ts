import { useEffect, useState } from 'react'

export const useWindowSize = () => {
    const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })

    useEffect(() => {
        if (window.innerWidth !== size.width) setSize({ ...size, width: window.innerWidth })
        if (window.innerHeight !== size.height) setSize({ ...size, height: window.innerHeight })

        const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return size
}
