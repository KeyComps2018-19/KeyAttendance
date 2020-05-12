import React from 'react';
import { httpDelete, httpPatch, domain, protocol } from './Helpers';
import { Alert, Button, ControlLabel, FormControl, FormGroup, Modal } from 'react-bootstrap';

class EditRoleModal extends React.Component {
    
    constructor(props) {
		super(props)
        this.state = {
            show: false,
            row: {},
            permission_ids: {},
            checkboxes: [],
            errorMsg: '',
            error: false
		}
        
        this.delete = this.delete.bind(this);
		this.cancel = this.cancel.bind(this);
        this.submit = this.submit.bind(this);
        this.createCheckboxes = this.createCheckboxes.bind(this);
    }
    
    componentDidUpdate() {
        if (this.props.row !== this.state.row) {
            this.setState({
                row: this.props.row,
            });
        }
        if (this.props.show !== this.state.show) {
            const checkboxes = [];
            const perm_names = Object.keys(this.props.row.permission_ids);
            const perm_ids = this.props.row.permission_ids;
            for (var index in perm_names) {
                const perm_name = perm_names[index];
                let displayName = perm_name;
                if (displayName.includes('group')) {
                    displayName = displayName.replace('group', 'user role');
                } else if (displayName.includes('activity')) {
                    displayName = displayName.replace('activity', 'programming');
                } else if (displayName.includes('attendance items')) {
                    displayName = displayName.replace('attendance items', 'attendance entries');
                } else if (displayName.includes('student column')) {
                    displayName = displayName.replace('student column', 'student field');
                } else if (displayName.includes('city span students')) {
                    displayName = displayName.replace('city span students', 'student keys');
                }
                const checked = this.props.row.permissions.indexOf(perm_ids[perm_name]) > -1;
                checkboxes.push({label: perm_name, checked: checked, displayName: displayName})
            }
            this.setState({
                checkboxes: checkboxes,
                permission_ids: this.props.row.permission_ids,
                show: this.props.show
            });
        }
    }

      
    delete() {
        const self = this;
        httpDelete(`${protocol}://${domain}/api/groups/?id=${self.state.row.id}`)
        .then(function (result) {
            if ('error' in result) {
                result.response.then(function(response) {
                    self.setState({error: true, errorMsg: response.error});
                });
            } else {
                self.setState({error: false, errorMsg: ''});
                self.props.onDelete(self.state.row.id);
            }
        });
    }

	cancel() {
        this.setState({
            row: this.props.row,
            error: false,
            errorMsg: ''
        });
		this.props.onSubmit();
	}

	submit() {
        const self = this;
        let body = { name: self.state.row.name, id: self.state.row.id };
        let permissions = [];
        const checkboxes = self.state.checkboxes;
        for (var index in checkboxes) {
            if (checkboxes[index].checked) {
                permissions.push(self.state.permission_ids[checkboxes[index].label])
            }
        }
        body["permissions"] = permissions;
        httpPatch(`${protocol}://${domain}/api/groups/`, body)
            .then(function (result) {
                if ('error' in result) {
                    result.response.then(function(response) {
                        self.setState({error: true, errorMsg: response.error});
                    });
                } else {
                    self.setState({error: false, errorMsg: ''});
                    self.props.onSubmit(result);
                }
            })
    }
    
    toggleCheckbox(index) {
        const { checkboxes } = this.state;
        checkboxes[index].checked = !checkboxes[index].checked;

        this.setState({
            checkboxes
        });
    }

    createCheckboxes() {
        const { checkboxes } = this.state;
    
        return checkboxes
            .map((checkbox, index) =>
                <div key={index}>
                    <label>
                        <input
                            type="checkbox"
                            checked={checkbox.checked}
                            disabled={this.state.row.name === 'Admin'}
                            onChange={this.toggleCheckbox.bind(this, index)}
                        />
                        {checkbox.displayName}
                    </label>
                </div>
            );
    }

    render() {
        let errorMsg = "Server error. Please try again.";
        if (this.state.errorMsg !== '' && this.state.errorMsg !== null && this.state.errorMsg !== undefined) {
            errorMsg = this.state.errorMsg;
        }
        return(
            <Modal show={this.props.show}>
				<Modal.Header>
					<Modal.Title>Edit User Role</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<form>
						<FormGroup>
							<ControlLabel>User Role</ControlLabel>
							<p>{this.state.row.name}</p>
                            {this.createCheckboxes()}
							<FormControl.Feedback />
						</FormGroup>
					</form>
				</Modal.Body>

				<Modal.Footer>
                    {this.state.error && <Alert bsStyle='danger'>{errorMsg}</Alert>}
					<Button onClick={this.cancel}>Cancel</Button>
					<Button onClick={() => { if (window.confirm('Are you sure you wish to save these changes? All users with this role will experience these changes.')) this.submit() }} bsStyle="primary">Save</Button>
                    <Button onClick={() => { if (window.confirm('Are you sure you wish to delete this role? All users with this role will be set to inactive.')) this.delete() }}
                        bsStyle="danger"
                        disabled={this.state.row.name === "Admin"}>Delete</Button>
				</Modal.Footer>
			</Modal>
        )
    }
}

export default EditRoleModal;
