import styled from 'styled-components'

export const Alert = styled.div`
    color: var(--secondary-text-color);

    line-height: 1.5;
`

export const DangerAlert = styled(Alert)`
    color: var(--error-color);
`

export const WarningAlert = styled(Alert)`
    color: var(--apple-system-orange);
`
