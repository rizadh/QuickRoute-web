import React from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import styled from 'styled-components'
import { useAccentColor } from '../hooks/useAccentColor'
import { routeInformation } from '../redux/selectors'

const StyledProgressBar = styled.div`
    position: absolute;
    width: 100%;
    height: 4px;
`

const Track = styled.div<{ color: string }>`
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: ${({ color }) => color};
    opacity: 0.2;
`

const Bar = styled.div<{ color: string; progress: number }>`
    position: absolute;
    width: ${({ progress }) => progress * 100}%;
    height: 100%;
    background-color: ${({ color }) => color};
`

export const ProgressBar = () => {
    const currentRouteInformation = useSelector(routeInformation, shallowEqual)
    const accentColor = useAccentColor()

    return currentRouteInformation.status === 'FETCHING' ? (
        <StyledProgressBar>
            <Track color={accentColor} />
            <Bar color={accentColor} progress={currentRouteInformation.progress} />
        </StyledProgressBar>
    ) : null
}
