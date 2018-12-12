import * as React from 'react'
import AppState from '../redux/state';
import AppAction from '../redux/actionTypes';
import { enableAutofit } from '../redux/actions';
import { connect } from 'react-redux';

interface AutofitButtonProps {
    autofitIsEnabled: boolean,
    enableAutofit: () => void
}

class AutofitButton extends React.Component<AutofitButtonProps> {
    render() {
        return <button
            className="autofit-button btn btn-warning m-3"
            hidden={this.props.autofitIsEnabled}
            onClick={this.props.enableAutofit}>
            <i className="fas fa-expand"></i> Auto-Fit
        </button>
    }
}

const mapStateToProps = (state: AppState) => ({
    autofitIsEnabled: state.autofitIsEnabled
})

const mapDispatchToProps = (dispatch: React.Dispatch<AppAction>) => ({
    enableAutofit: () => dispatch(enableAutofit())
})

export default connect(mapStateToProps, mapDispatchToProps)(AutofitButton)