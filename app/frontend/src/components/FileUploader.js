import React from 'react';
import { Button, Form, FormControl, FormGroup, ControlLabel, Label, Well } from 'react-bootstrap';
import { httpGet } from './Helpers';

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
			{this.state.error !== "" && <Label bsStyle="danger">Error: {this.state.error}</Label>}
		</Form>
	  );
	}
  }
  
  export default FileUploader;