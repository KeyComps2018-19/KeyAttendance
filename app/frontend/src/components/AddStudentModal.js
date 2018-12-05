import React from 'react';
import { Button, Modal, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import { httpPost } from './Helpers';

class AddStudentModal extends React.Component {
    
    constructor(props) {
		super(props)
		
        this.state = {
			firstName: "",
			lastName:"",
		}
		
		this.cancel = this.cancel.bind(this);
		this.submit = this.submit.bind(this);
		this.onFirstNameChange = this.onFirstNameChange.bind(this);
		this.onLastNameChange = this.onLastNameChange.bind(this);
	}

	validateInput() {
		const { firstName, lastName } = this.state;
		if (firstName.length > 0 && lastName.length > 0) {
			return 'success';
		} else if (firstName.length === 0 && lastName.length === 0) {
			return null;
		} else {
			return 'error';
		}
	}

	onFirstNameChange(e) {
		this.setState({firstName: e.target.value})
	}

	onLastNameChange(e) {
		this.setState({lastName: e.target.value})
	}
	
	cancel() {
		this.props.onSubmit();
	}

	submit() {
		const self = this;
		httpPost('http://127.0.0.1:8000/api/students/', {
			first_name: this.state.firstName,
			last_name: this.state.lastName
		}).then(function(result) {
			if ('error' in result) {
				console.log(result);
			} else {
				self.props.onSubmit(result);
			}
		})
	}

    render() {
        return(
            <Modal show={this.props.show}>
				<Modal.Header>
					<Modal.Title>Create New Student</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<form>
						<FormGroup
							controlId="addStudentForm"
							validationState={this.validateInput()}
						>
							<ControlLabel>First Name</ControlLabel>
							<FormControl
								type="text"
								value={this.state.firstName}
								placeholder="First"
								onChange={this.onFirstNameChange}
							/>
							<FormControl.Feedback />
							<br/>
							<ControlLabel>Last Name</ControlLabel>
							<FormControl
								type="text"
								value={this.state.lastName}
								placeholder="Last"
								onChange={this.onLastNameChange}
							/>
							<FormControl.Feedback />
						</FormGroup>
					</form>
				</Modal.Body>

				<Modal.Footer>
					<Button onClick={this.cancel}>Cancel</Button>
					<Button onClick={this.submit} bsStyle="primary">Create</Button>
				</Modal.Footer>
			</Modal>
        )
    }
}

export default AddStudentModal;
