import styled from 'styled-components'

export const Alert = styled.div`
    color: var(--secondary-text-color);
`

export const DangerAlert = styled(Alert)`
    color: var(--apple-system-red);
`

export const WarningAlert = styled(Alert)`
    color: var(--apple-system-orange);
`
