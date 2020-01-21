import React from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import styled from 'styled-components'
import { useDarkMode } from '../hooks/useDarkMode'
import { routeInformation } from '../redux/selectors'

const StyledProgressBar = styled.div`
    position: absolute;
    width: 100%;
    height: 4px;
`

const Track = styled.div<{ darkMode: boolean }>`
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: ${({ darkMode }) => (darkMode ? 'rgba(10, 132, 255, 0.2)' : 'rgb(0, 122, 255, 0.2)')};
`

const Bar = styled.div<{ darkMode: boolean; progress: number }>`
    position: absolute;
    width: ${({ progress }) => progress * 100}%;
    height: 100%;
    background-color: ${({ darkMode }) => (darkMode ? 'rgba(10, 132, 255)' : 'rgb(0, 122, 255)')};
`

export const ProgressBar = () => {
    const darkMode = useDarkMode()
    const currentRouteInformation = useSelector(routeInformation, shallowEqual)

    return (
        currentRouteInformation.status === 'FETCHING' && (
            <StyledProgressBar>
                <Track darkMode={darkMode} />
                <Bar darkMode={darkMode} progress={currentRouteInformation.progress} />
            </StyledProgressBar>
        )
    )
}
