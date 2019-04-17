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
    const { editorIsCollapsed, uncollapseEditor } = useContext(AppContext)

    return (
        <div id="map-buttons">
            <button
                className="btn btn-warning"
                hidden={props.autofitIsEnabled}
                onClick={props.enableAutofit}
            >
                <i className="fas fa-expand" /> Auto-Fit
            </button>
            <button
                className="btn btn-primary"
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
