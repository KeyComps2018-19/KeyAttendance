import React from 'react';
import { Button, ControlLabel, FormControl, FormGroup, Modal } from 'react-bootstrap';
import { httpDelete, httpPatch, domain } from './Helpers';

class EditRoleModal extends React.Component {
    
    constructor(props) {
		super(props)
        this.state = {
            show: false,
            row: {},
            permission_ids: {},
            checkboxes: []
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
                const checked = this.props.row.permissions.indexOf(perm_ids[perm_name]) > -1;
                checkboxes.push({label: perm_name, checked: checked})
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
        httpDelete(`https://${domain}/api/groups/?id=${self.state.row.id}`)
        .then(function (result) {
            if ('error' in result) {
                self.setState({
                    backendError: true
                });
            } else {
                self.props.onDelete(self.state.row.id);
            }
        });
    }

	cancel() {
        this.setState({
            row: this.props.row,
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
        httpPatch(`https://${domain}/api/groups/`, body)
            .then(function (result) {
                if ('error' in result) {
                    console.log(result);
                } else {
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
                        {checkbox.label}
                    </label>
                </div>
            );
    }

    render() {
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
					<Button onClick={this.cancel}>Cancel</Button>
					<Button onClick={this.submit} bsStyle="primary">Save</Button>
                    <Button onClick={() => { if (window.confirm('Are you sure you wish to delete this role?')) this.delete() }}
                        bsStyle="danger"
                        disabled={this.state.row.name === "Admin"}>Delete</Button>
				</Modal.Footer>
			</Modal>
        )
    }
}

export default EditRoleModal;
