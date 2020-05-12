import React from 'react';
import { Button, ControlLabel, FormControl, FormGroup, Modal } from 'react-bootstrap';
import { httpPost, domain, protocol } from './Helpers';

class AddVolunteerModal extends React.Component {
    
    constructor(props) {
		super(props)
		
        this.state = {
			firstName: "",
			lastName:"",
			show: false,
		}
		
		this.cancel = this.cancel.bind(this);
		this.submit = this.submit.bind(this);
		this.onFirstNameChange = this.onFirstNameChange.bind(this);
		this.onLastNameChange = this.onLastNameChange.bind(this);
		// this.handleInfoChange = this.handleInfoChange.bind(this);
	}

	componentDidUpdate() {
        if (this.props.show !== this.state.show) {
            this.setState({
				show: this.props.show,
			});
        }
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
		this.setState({
			firstName: "",
			lastName:"",
		});
		this.props.onSubmit();
	}

	// createStudentInfo(name, value, student_id, self) {
	// 	const {studentFields} = self.state;
	// 	const field = studentFields[name];
	// 	let body = {student_id: student_id, info_id: field.info_id};
	// 	if (field.type === 'str') {
	// 		body['str_value'] = value;
	// 	} else if (field.type === 'int') {
	// 		body['int_value'] = value;
	// 	} else if (field.type === 'date') {
	// 		body['date_value'] = value;
	// 	}
	// 	return body;
	// }

	submit() {
		const self = this;
		httpPost(`${protocol}://${domain}/api/volunteers/`, {
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
    


	// createStudentInfoFields () {
	// 	let info = [];
	// 	const { studentFields } = this.state;
	// 	for (var fieldName in studentFields) {
	// 		const field = studentFields[fieldName];
	// 		let type;
	// 		switch (field.type) {
	// 			case 'str':
	// 				type = "text";
	// 				break;
	// 			case 'int':
	// 				type = "int";
	// 				break;
	// 			case 'date':
	// 				type = "date";
	// 				break;
	// 			default:
	// 				break;
	// 		}
	// 		info.push(<div  key={field.info_id}><ControlLabel>{fieldName}</ControlLabel><FormControl value={this.state.studentInfo[fieldName]} name={fieldName} type={type} onChange={this.handleInfoChange} /><br/></div>);
	// 	}
	// 	return info;
	// }

	// handleInfoChange = e => {
    //     const name = e.target.name;
	// 	const value = e.target.value;
	// 	let { studentInfo } = this.state;
	// 	studentInfo[name] = value;
    //     this.setState({
	// 		studentInfo
    //     });
    // };

    render() {
        return(
            <Modal show={this.props.show}>
				<Modal.Header>
					<Modal.Title>Create New Volunteer</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<form>
						<FormGroup
							controlId="addVolunteerForm"
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
							<br/>
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

export default AddVolunteerModal;
