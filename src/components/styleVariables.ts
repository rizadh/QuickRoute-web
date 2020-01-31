import { css } from 'styled-components'

export const editorWidth = 420
export const compactBreakpoint = 800
export const peekWidth = 48

const frostedBlurRadius = 128

export const frostedColored = css`
    background-color: var(--app-frost-fallback-color);

    @supports (backdrop-filter: blur(${frostedBlurRadius}px)) {
        backdrop-filter: blur(${frostedBlurRadius}px);
        background-color: var(--app-frost-color);
    }
`

export const frostedUncolored = css`
    background-color: var(--app-frost-fallback-color);

    @supports (backdrop-filter: blur(${frostedBlurRadius}px)) {
        backdrop-filter: blur(${frostedBlurRadius}px);
        background-color: initial;
    }
`
