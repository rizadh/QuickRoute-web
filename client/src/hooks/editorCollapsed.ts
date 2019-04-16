import { useEffect, useState } from 'react'

export const useEditorCollapsed = () => {
    const [editorIsCollapsed, setEditorIsCollapsed] = useState(false)
    const collapseEditor = () => setEditorIsCollapsed(true)
    const uncollapseEditor = () => setEditorIsCollapsed(false)

    useEffect(() => {
        const root = document.getElementById('root')
        if (!root) return

        if (editorIsCollapsed) {
            root.classList.add('editor-collapsed')
        } else {
            root.classList.remove('editor-collapsed')
        }
    }, [editorIsCollapsed])

    return { editorIsCollapsed, collapseEditor, uncollapseEditor }
}
