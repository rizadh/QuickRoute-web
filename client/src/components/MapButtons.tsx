import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { enableAutofit } from '../redux/actions'
import { AppAction } from '../redux/actionTypes'
import { AppState } from '../redux/state'
import { AppContext } from './App'

type MapButtonsProps = {
    autofitIsEnabled: boolean
    enableAutofit: () => void
}

const MapButtons = (props: MapButtonsProps) => {
    const { editorIsCollapsed, setEditorIsCollapsed } = useContext(AppContext)

    const collapseEditor = () => {
        // const root = document.getElementById('root')
        // if (root) root.classList.add('editor-collapsed')

        setEditorIsCollapsed(true)
    }

    const uncollapseEditor = () => {
        // const root = document.getElementById('root')
        // if (root) root.classList.remove('editor-collapsed')

        setEditorIsCollapsed(false)
    }

    return (
        <div id="map-buttons">
            <button
                className="btn btn-warning mr-3 mt-3"
                hidden={props.autofitIsEnabled}
                onClick={props.enableAutofit}
            >
                <i className="fas fa-expand" /> Auto-Fit
            </button>
            <button
                className="btn btn-primary mr-3 mt-3"
                hidden={!editorIsCollapsed}
                onClick={uncollapseEditor}
            >
                <i className="fas fa-columns" /> Show Editor
            </button>
        </div>
    )
}

const mapStateToProps = (state: AppState) => ({
    autofitIsEnabled: state.autofitIsEnabled,
})

const mapDispatchToProps = (dispatch: React.Dispatch<AppAction>) => ({
    enableAutofit: () => dispatch(enableAutofit()),
})

export default connect(mapStateToProps, mapDispatchToProps)(MapButtons)
