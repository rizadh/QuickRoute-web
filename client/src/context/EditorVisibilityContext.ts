import { createContext } from 'react'

export const EditorVisibilityContext = createContext({
    editorIsHidden: true,
    hideEditor: () => {
        return
    },
    showEditor: () => {
        return
    },
})
