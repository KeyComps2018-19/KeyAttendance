import React from 'react';
import { Button, ControlLabel, Form, FormGroup, Label, Well } from 'react-bootstrap';

class FileUploader extends React.Component {
	
	constructor() {
	  super();
	  this.state = {
		file: undefined,
		error: "",
	  };

	  this.submit = this.submit.bind(this);
	}
  
	handleChange = event => {
		const file = event.target.files[0];

		// if we don't have a filetype requirement or the file matches the type requirement
		if (!this.props.extension || file.name.indexOf(this.props.extension) >= 0) {
			this.setState({
				file: file,
				error: ""
			});
		} else {
			this.setState({
				error: "Invalid file type"
			})
		}
	};

	submit() {
		if (this.state.file !== undefined) {
			this.props.upload(this.state.file);
			this.setState({file: undefined});
			this.setState({error: "Upload Successful"});
		}
	}
  
	render() {
	  return (
		<Form>
			<FormGroup>
			<ControlLabel style={{display: 'inline-block'}}>{this.props.label}</ControlLabel>{' '}
				<Well style={{display: 'inline-block'}}>
					<input style={{display: 'inline-block'}} onChange={this.handleChange} placeholder={null} type="file"/>
				</Well>
				{' '}<Button style={{display: 'inline-block'}} onClick={this.submit}>Upload</Button>
			</FormGroup>
			{this.state.error !== "Upload Successful" && <Label bsStyle="danger">{this.state.error}</Label>}
			{this.state.error == "Upload Successful" && <Label bsStyle="success">{this.state.error}</Label>}		
		</Form>
	  );
	}
  }
  
  export default FileUploader;