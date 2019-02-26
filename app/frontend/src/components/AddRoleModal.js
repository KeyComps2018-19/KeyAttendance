import React from 'react';
import { Button, Modal, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import { httpPost, domain } from './Helpers';

class AddRoleModal extends React.Component {
    
    constructor(props) {
		super(props)
		
        this.state = {
            show: false,
            name: '',
            permission_ids: {},
            checkboxes: []
		}
		
		this.cancel = this.cancel.bind(this);
		this.submit = this.submit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.createCheckboxes = this.createCheckboxes.bind(this);
    }
    
    componentDidUpdate() {
        if (this.props.show !== this.state.show) {
            const checkboxes = [];
            const perm_ids = this.props.permission_ids;
            const perm_names = Object.keys(perm_ids);
            for (var index in perm_names) {
                const perm_name = perm_names[index];
                checkboxes.push({label: perm_name, checked: false})
            }
            this.setState({
                permission_ids: this.props.permission_ids,
                checkboxes: checkboxes,
                show: this.props.show
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

	cancel() {
        this.setState({name: ''});
		this.props.onSubmit();
	}

	submit() {
        const self = this;
        let body = { name: self.state.name };
        let permissions = [];
        const checkboxes = self.state.checkboxes;
        for (var index in checkboxes) {
            if (checkboxes[index].checked) {
                permissions.push(self.state.permission_ids[checkboxes[index].label])
            }
        }
        body["permissions"] = permissions;
        httpPost(`https://${domain}/api/groups/`, body)
            .then(function (result) {
                if ('error' in result) {
                    console.log(result);
                } else {
                    self.setState({name: ''});
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
					<Modal.Title>Create New User Role</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<form>
						<FormGroup>
							<ControlLabel>Role Name</ControlLabel>
							<FormControl
                                type="text"
                                name="name"
								value={this.state.name}
								placeholder="Role Name"
								onChange={this.handleChange}
							/>
							<br/>
							{this.createCheckboxes()}
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

export default AddRoleModal;
