import React from 'react';
import { Alert, Button, ControlLabel, FormControl, FormGroup, Modal } from 'react-bootstrap';
import { httpPost, domain } from './Helpers';

class AddStudentFieldModal extends React.Component {
    
    constructor(props) {
		super(props)
		
        this.state = {
            show: false,
            name: '',
            type: 'str',
            inUse: true,
            quickAdd: false,
            error: false,
            errorMsg: ''
		}
		
		this.cancel = this.cancel.bind(this);
		this.submit = this.submit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.validateInput = this.validateInput.bind(this);
        this.handleInUseCheckbox = this.handleInUseCheckbox.bind(this);
        this.handleQuickAddCheckbox = this.handleQuickAddCheckbox.bind(this);
    }
    
    componentDidUpdate() {
        if (this.props.show !== this.state.show) {
            this.setState({
                show: this.props.show,
            });
        }
    }

    validateInput() {
		const { name } = this.state;
        const regex = /^[a-z0-9.@+\- _]+$/i;
        if (name.length > 0 && regex.test(name) && this.state.type) {
			return 'success';
		} else if (name.length === 0) {
			return null;
		} else {
			return 'error';
		}
    }
    
    handleChange = e => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState(prevstate => {
            const newState = { ...prevstate };
            newState[name] = value;
            return newState;
        });
    };

	cancel() {
        this.setState({
            name: '',
            type: 'str',
            inUse: true,
            quickAdd: false,
            error: false,
            errorMsg: ''
        });
		this.props.onSubmit();
	}

	submit() {
        const self = this;
        if (self.validateInput() !== 'success') {
            const errorMsg = 'Invalid input. Please check your fields and try again.'
            self.setState({
                error: true,
                errorMsg: errorMsg
            });
            return;
        }
        let body = {
            name: self.state.name,
            is_showing: self.state.inUse,
            quick_add: self.state.quickAdd,
            type: self.state.type
        }
        httpPost(`https://${domain}/api/student_column/`, body)
            .then(function (result) {
                if ('error' in result) {
                    if (result['error'] === 400) {
                        const errorMsg = 'Creation failed due to invalid input. Please check your fields and try again';
                        self.setState({
                            error: true,
                            errorMsg: errorMsg
                        });
            return;
                    }
                } else {
                    self.setState({
                        name: '',
                        type: 'str',
                        inUse: true,
                        quickAdd: false,
                        error: false,
                        errorMsg: ''
                    });
                    self.props.onSubmit(result);
                }
            })
    }

    handleInUseCheckbox = e => {
        this.setState({inUse: !this.state.inUse});
    }

    handleQuickAddCheckbox = e => {
        this.setState({quickAdd: !this.state.quickAdd});
    }
    
    render() {
        return(
            <Modal show={this.props.show}>
				<Modal.Header>
					<Modal.Title>Create New Activity</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<form>
                        <FormGroup
                            validationState={this.validateInput()}>
                            <ControlLabel>Field Name</ControlLabel>
                            <FormControl
                                type="text"
                                name="name"
                                value={this.state.name}
                                placeholder="Field Name"
                                onChange={this.handleChange}
							/>
                            <br/>
                            <FormControl componentClass="select" 
                            name="type" 
                            onChange={this.handleChange}
                            defaultValue={this.state.type}
                            >
                                <option value="date">Date</option>
                                <option value="str">Text</option>
                                <option value="int">Number</option>
                            </FormControl>
							<br/>
                            <ControlLabel>Currently in Use</ControlLabel>
							<FormControl
                                type="checkbox"
                                checked={this.state.inUse}
								value={this.state.inUse}
                                onChange={this.handleInUseCheckbox}
							/>
                            <br/>
                            <ControlLabel>Show in Quick Add</ControlLabel>
							<FormControl
                                type="checkbox"
                                checked={this.state.quickAdd}
								value={this.state.quickAdd}
                                onChange={this.handleQuickAddCheckbox}
							/>
							<FormControl.Feedback />
						</FormGroup>
					</form>
				</Modal.Body>

				<Modal.Footer>
                    {this.state.error && <Alert bsStyle='danger'>{this.state.errorMsg}</Alert>}
					<Button onClick={this.cancel}>Cancel</Button>
					<Button onClick={this.submit} bsStyle="primary">Create</Button>
				</Modal.Footer>
			</Modal>
        )
    }
}

export default AddStudentFieldModal;
