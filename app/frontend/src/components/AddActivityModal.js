import React from 'react';
import { Alert, Button, ControlLabel, FormControl, FormGroup, Modal } from 'react-bootstrap';
import { httpPost, domain } from './Helpers';

class AddActivityModal extends React.Component {
    
    constructor(props) {
		super(props)
		
        this.state = {
            show: false,
            name: '',
            type: 'boolean',
            inUse: true,
            lastOrdering: 0,
            error: false,
            errorMsg: ''
		}
		
		this.cancel = this.cancel.bind(this);
		this.submit = this.submit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.validateInput = this.validateInput.bind(this);
        this.handleCheckbox = this.handleCheckbox.bind(this);
    }
    
    componentDidUpdate() {
        if (this.props.show !== this.state.show) {
            this.setState({
                show: this.props.show,
                lastOrdering: this.props.lastOrdering
            });
        }
    }

    validateInput() {
		const { name } = this.state;
        const regex = /^[a-z0-9.@+\-_]+$/i;
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
            type: 'boolean',
            inUse: true,
            lastOrdering: 0,
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
            ordering: self.state.lastOrdering + 1,
            is_showing: self.state.inUse,
            type: self.state.type
        }
        httpPost(`https://${domain}/api/activities/`, body)
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
                        type: 'boolean',
                        inUse: true,
                        lastOrdering: 0,
                        error: false,
                        errorMsg: ''
                    });
                    self.props.onSubmit(result);
                }
            })
    }

    handleCheckbox = e => {
        this.setState({inUse: !this.state.inUse});
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
                            <ControlLabel>Activity Name</ControlLabel>
                            <FormControl
                                type="text"
                                name="name"
                                value={this.state.name}
                                placeholder="Activity Name"
                                onChange={this.handleChange}
							/>
                            <br/>
                            <FormControl componentClass="select" 
                            name="type" 
                            onChange={this.handleChange}
                            defaultValue={this.state.type}
                            >
                                <option value="boolean">Checkbox</option>
                                <option value="string">Text</option>
                                <option value="float">Number</option>
                            </FormControl>
							<br/>
                            <ControlLabel>Currently in Use</ControlLabel>
							<FormControl
                                type="checkbox"
                                checked={this.state.inUse}
								value={this.state.inUse}
                                onChange={this.handleCheckbox}
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

export default AddActivityModal;
