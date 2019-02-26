import React from 'react';
import { Alert, Button, ControlLabel, FormControl, FormGroup, Modal } from 'react-bootstrap';
import { httpPost, domain } from './Helpers';

class AddUserModal extends React.Component {
    
    constructor(props) {
		super(props)
		
        this.state = {
            username: '',
            first_name: '',
            last_name: '',
            password: '',
            confirmPassword: '',
            is_active: true,
            error: false,
            backendError: false,
            radioOptions: [],
            show: false,
            selectedOption: ''
		}
		
		this.cancel = this.cancel.bind(this);
		this.submit = this.submit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.validateInput = this.validateInput.bind(this);
        this.handleActiveCheckbox = this.handleActiveCheckbox.bind(this);
        this.createRadioOptions = this.createRadioOptions.bind(this);
    }
    
    componentDidUpdate() {
        if (this.props.show !== this.state.show) {
            const radioOptions = [];
            const role_names = Object.keys(this.props.role_ids);
            for (var index in role_names) {
                radioOptions.push({label: role_names[index], checked: false})
            }
            this.setState({
                radioOptions: radioOptions,
                show: this.props.show
            });
        }
    }

	validateInput() {
		const { username, password, confirmPassword } = this.state;
        const regex = /^[a-z0-9.@+\-_]+$/i;
        if (username.length > 0 && password.length > 0 && password === confirmPassword 
            && regex.test(username) && this.state.selectedOption) {
			return 'success';
		} else if (username.length === 0 && password.length === 0 && confirmPassword.length === 0) {
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

    handleActiveCheckbox = e => {
        this.setState({is_active: !this.state.is_active});
    }

	cancel() {
        this.setState({
            username: '',
            first_name: '',
            last_name: '',
            password: '',
            confirmPassword: '',
            selectedOption: '',
            is_active: true, 
            error: false, 
            backendError: false
        });
        this.props.onSubmit();
	}

	submit() {
        const self = this;
        self.setState({backendError: false});
        if (self.validateInput() !== 'success') {
            self.setState({error: true});
            return;
        } else {
            self.setState({error: false});
        }
        const groups = [];
        groups.push(self.props.role_ids[self.state.selectedOption])
        const body = {username: self.state.username,
            password: self.state.password,
            first_name: self.state.first_name,
            last_name: self.state.last_name,
            groups: groups,
            is_active: self.state.is_active};
        httpPost(`https://${domain}/api/users/`, body)
            .then(function (result) {
                if ('error' in result) {
                    self.setState({backendError: true});
                } else {
                    self.setState({
                        username: '',
                        first_name: '',
                        last_name: '',
                        password: '',
                        confirmPassword: '',
                        selectedOption: '',
                        is_active: true, 
                        error: false, 
                        backendError: false
                    });
                    self.props.onSubmit(result);
                }
            })
    }
    
    toggleRadioOptions(index) {
        const { radioOptions } = this.state;
        let selectedOption = '';
        if (!radioOptions[index].checked) {
            selectedOption = radioOptions[index].label;
            for (var j in radioOptions) {
                if (j !== index) {
                    radioOptions[j].checked = false;
                } 
            }
        }
        radioOptions[index].checked = !radioOptions[index].checked;

        this.setState({
            selectedOption: selectedOption,
            radioOptions: radioOptions
        });
    }
    
    createRadioOptions() {
        const { radioOptions } = this.state;
    
        return radioOptions
            .map((option, index) =>
                <div key={index}>
                    <label>
                        <input
                            type="radio"
                            name="userRoles"
                            value={option.label}
                            checked={option.checked}
                            onChange={this.toggleRadioOptions.bind(this, index)}
                            className="form-check-input"
                        />
                        {option.label}
                    </label>
                </div>
            );
    }

    render() {
        return(
            <Modal show={this.props.show}>
				<Modal.Header>
					<Modal.Title>Create New User</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<form>
						<FormGroup
							validationState={this.validateInput()}
						>
							<ControlLabel>Username</ControlLabel>
							<FormControl
                                type="text"
                                name="username"
								value={this.state.username}
								placeholder="Username"
								onChange={this.handleChange}
							/>
							<br/>
                            <ControlLabel>First Name</ControlLabel>
							<FormControl
                                type="text"
                                name="first_name"
								value={this.state.first_name}
								placeholder="First Name"
								onChange={this.handleChange}
							/>
							<br/>
                            <ControlLabel>Last Name</ControlLabel>
							<FormControl
                                type="text"
                                name="last_name"
								value={this.state.last_name}
								placeholder="Last Name"
								onChange={this.handleChange}
							/>
							<br/>
							<ControlLabel>Password</ControlLabel>
							<FormControl
                                type="password"
                                name="password"
								value={this.state.password}
								placeholder="Password"
								onChange={this.handleChange}
							/>
                            <br />
                            <ControlLabel>Confirm Password</ControlLabel>
							<FormControl
                                type="password"
                                name="confirmPassword"
								value={this.state.confirmPassword || ''}
								placeholder="Confirm Password"
								onChange={this.handleChange}
							/>
                            <br />
                            <ControlLabel>Active</ControlLabel>
							<FormControl
                                type="checkbox"
                                checked={this.state.is_active}
								value={this.state.is_active}
								onChange={this.handleActiveCheckbox}
							/>
                            <ControlLabel>User Roles</ControlLabel>
                            {this.createRadioOptions()}
							<FormControl.Feedback />
						</FormGroup>
					</form>
				</Modal.Body>

				<Modal.Footer>
                    {this.state.error && <Alert bsStyle='danger'>Invalid input. Please check your fields and try again.</Alert>}
                    {this.state.backendError && <Alert bsStyle='danger'>Server error. Please try again.</Alert>}
					<Button onClick={this.cancel}>Cancel</Button>
					<Button onClick={this.submit} bsStyle="primary">Create</Button>
				</Modal.Footer>
			</Modal>
        )
    }
}

export default AddUserModal;
