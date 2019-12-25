import { useEffect, useState } from 'react'

export const useEditorVisibility = () => {
    const [editorIsHidden, setEditorIsCollapsed] = useState(false)
    const hideEditor = () => setEditorIsCollapsed(true)
    const showEditor = () => setEditorIsCollapsed(false)

    useEffect(() => {
        const root = document.getElementById('root')
        if (!root) return

        if (editorIsHidden) {
            root.classList.add('editor-hidden')
        } else {
            root.classList.remove('editor-hidden')
        }
    }, [editorIsHidden])

    return { editorIsHidden, hideEditor, showEditor }
}
