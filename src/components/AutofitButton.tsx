import * as React from 'react'
import { connect } from 'react-redux';
import { enableAutofit } from '../redux/actions';
import { AppAction } from '../redux/actionTypes';
import { AppState } from '../redux/state';

type AutofitButtonProps = {
    autofitIsEnabled: boolean,
    enableAutofit: () => void
}

class AutofitButton extends React.Component<AutofitButtonProps> {
    render() {
        return <button
            id="autofit-button"
            className="btn btn-warning m-3"
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