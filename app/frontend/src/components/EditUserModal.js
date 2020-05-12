import React from 'react';
import { Button, Modal, FormGroup, FormControl, ControlLabel, Alert } from 'react-bootstrap';
import { httpPatch, httpDelete, domain, protocol } from './Helpers';

class EditUserModal extends React.Component {
    
    constructor(props) {
		super(props)
        this.state = {
            row: {},
            show: false,
            radioOptions: [],
            selectedOption: '',
            first_name: '',
            last_name: '',
            is_active: true,
            password: '',
            confirmPassword: '',
            editPassword: false,
            error: false,
            backendError: false,
            errorMsg: ''
		}
        
        this.delete = this.delete.bind(this);
		this.cancel = this.cancel.bind(this);
		this.submit = this.submit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handlePasswordButton = this.handlePasswordButton.bind(this);
        this.handleActiveCheckbox = this.handleActiveCheckbox.bind(this);
        this.validateInput = this.validateInput.bind(this);
        this.createRadioOptions = this.createRadioOptions.bind(this);
	}

	validateInput() {
        const { password, confirmPassword, editPassword } = this.state;
        if (editPassword) {
            if (password.length === 0 || password !== confirmPassword) {
                return 'error';
            }
            return 'success';
        } else {
			return null;
		}
    }

    componentDidUpdate() {
        if (this.props.row !== this.state.row) {
            this.setState({
                row: this.props.row,
            });
        }
        if (this.props.show !== this.state.show) {
            const radioOptions = [];
            const role_names = Object.keys(this.props.row.role_ids);
            const role_ids = this.props.row.role_ids;
            let selectedOption = '';
            for (var index in role_names) {
                const role_name = role_names[index];
                const checked = this.props.row.groups.indexOf(role_ids[role_name]) > -1;
                if (checked) {
                    selectedOption = role_name;
                }
                radioOptions.push({label: role_name, checked: checked})
            }
            this.setState({
                radioOptions: radioOptions,
                selectedOption: selectedOption,
                show: this.props.show,
                first_name: this.props.row.first_name,
                last_name: this.props.row.last_name,
                is_active: this.props.row.is_active,
            });
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
        this.setState(prevstate => {
            const newState = { ...prevstate };
            newState["is_active"] = !this.state.is_active;
            return newState;
        });
    }

    handlePasswordButton = e => {
        this.setState({
            editPassword: !this.state.editPassword,
            password: "",
            confirmPassword: ""
        });
    }

	cancel() {
        this.setState({
            row: this.props.row,
            error: false,
            backendError: false,
            password: '',
            confirmPassword: '',
            editPassword: false,
            errorMsg: false
        });
		this.props.onSubmit();
    }
    
    delete() {
        const self = this;
        httpDelete(`${protocol}://${domain}/api/users/?id=${self.state.row.id}`)
        .then(function (result) {
            if ('error' in result) {
                result.response.then(function(response) {
                    self.setState({backendError: true, errorMsg: response.error});
                });
            } else {
                self.setState({
                    backendError: false,
                    errorMsg: ''
                })
                self.props.onDelete(self.state.row.id);
            }
        });
    }

	submit() {
        const self = this;
        this.setState({
            backendError: false
        });
        if (self.validateInput() === 'error') {
            this.setState({
                error: true
            });
            return;
        } else {
            this.setState({
                error: false
            });
        }
        let body = {
            id: self.state.row.id,
            first_name: self.state.first_name,
            last_name: self.state.last_name,
            is_active: self.state.is_active
        };
        let groups = [];
        groups.push(self.props.row.role_ids[self.state.selectedOption])
        body["groups"] = groups;
        if (self.state.password !== "") {
            body["password"] = self.state.password;
        }
        httpPatch(`${protocol}://${domain}/api/users/`, body)
            .then(function (result) {
                if ('error' in result) {
                    result.response.then(function(response) {
                        self.setState({backendError: true, errorMsg: response.error});
                    });
                } else {
                    self.setState({
                        password: '',
                        confirmPassword: '',
                        editPassword: false,
                        backendError: false,
                        errorMsg: ''
                    })
                    self.props.onSubmit(result);
                }
            })
    }
    
    toggleRadioOptions(index) {
        let { radioOptions, selectedOption } = this.state;
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
        let passwordBlock;
        if (!this.state.editPassword) {
            passwordBlock = <Button bsStyle="link" onClick={this.handlePasswordButton}>Change Password</Button>
        } else {
            passwordBlock = <div>
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
                    value={this.state.confirmPassword}
                    placeholder="Confirm Password"
                    onChange={this.handleChange}
                />
                <br />
                <Button bsStyle="warning" onClick={this.handlePasswordButton}>Discard Password Changes</Button>
                <br />
            </div>
        }
        let errorMsg = "Server error. Please try again.";
        if (this.state.errorMsg !== '' && this.state.errorMsg !== null && this.state.errorMsg !== undefined) {
            errorMsg = this.state.errorMsg;
        }
        return(
           
            <Modal show={this.props.show}>
				<Modal.Header>
					<Modal.Title>Edit User</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<form>
						<FormGroup
                            validationState={this.validateInput()}
						>
							<ControlLabel>Username</ControlLabel>
							<p>{this.state.row.username}</p>
							<br/>
                            <ControlLabel>First Name</ControlLabel>
							<FormControl
                                type="text"
                                name="first_name"
								value={this.state.first_name || ''}
								placeholder="First Name"
								onChange={this.handleChange}
							/>
							<br/>
                            <ControlLabel>Last Name</ControlLabel>
							<FormControl
                                type="text"
                                name="last_name"
								value={this.state.last_name || ''}
								placeholder="Last Name"
								onChange={this.handleChange}
							/>
							<br/>
                            <ControlLabel>Active</ControlLabel>
                            <FormControl
                                style={{width: 'auto'}}
                                type="checkbox"
                                checked={this.state.is_active || false}
								value={this.state.is_active}
								onChange={this.handleActiveCheckbox}
							/>
                            <br />
                            <ControlLabel>User Role</ControlLabel>
                            {this.createRadioOptions()}
                            {passwordBlock}
							<FormControl.Feedback />
						</FormGroup>
					</form>
				</Modal.Body>

				<Modal.Footer>
                    {this.state.error && <Alert bsStyle='danger'>Invalid password. Please make sure they match and try again.</Alert>}
                    {this.state.backendError && <Alert bsStyle='danger'>{errorMsg}</Alert>}
					<Button onClick={this.cancel}>Cancel</Button>
					<Button onClick={() => {if (window.confirm('Are you sure you want to save these changes?')) this.submit()}} bsStyle="primary">Save</Button>
                    <Button onClick={() => { if (window.confirm('Are you sure you wish to delete this user?')) this.delete() } } bsStyle="danger">Delete</Button>
				</Modal.Footer>
			</Modal>
        )
    }
}

export default EditUserModal;
