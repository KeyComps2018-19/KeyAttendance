import React from 'react';
import { Form, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
import { httpGet, protocol, domain, downloadReportsCSV } from './Helpers';

class NewStudentsReport extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			buildingCSV: false,
			startDate: "",
			endDate: "",
		};

		this.updateEndDate = this.updateEndDate.bind(this);
		this.updateStartDate = this.updateStartDate.bind(this);
		this.downloadCSV = this.downloadCSV.bind(this);
	}

	async downloadCSV() {
		const { startDate, endDate } = this.state;
		if (startDate === "" || endDate === "") {
		  return
		}
		this.setState({ buildingCSV: true });
		const sheet = [];
		const columns = ['Student Name', 'Student Key'];
		const title = `New_Students_${startDate}-${endDate}`;
		const ids = await httpGet(`${protocol}://${domain}/api/reports/newStudents/?startdate=${startDate}&enddate=${endDate}`);
		const students = await httpGet(`${protocol}://${domain}/api/students/`);

		// sheet should look like: 
		// Student Name | Student Key 

		for (let i in ids.newStudents) {
			let studentName = "";
			let studentKey = "";
			for (let studentIndex in students) {
				if (students[studentIndex].id === ids.newStudents[i]) {
					studentName = students[studentIndex].first_name + " " + students[studentIndex].last_name;
					studentKey = students[studentIndex].student_key;
				}
			}
			let row = []
			row[0] = studentName;
			row[1] = (studentKey === null ? "N/A" : studentKey);
			sheet.push(row);
		}

		await downloadReportsCSV(sheet, columns, title);
		this.setState({ buildingCSV: false });
	}

	updateStartDate(e) {
    	this.setState({startDate: e.target.value});
    }

  	updateEndDate(e) {
  		this.setState({endDate: e.target.value});
  	}

	render() {
		const {buildingCSV} = this.state;

		return (
			<div>
				<h3
				style={{textAlign: 'center', fontSize: '25px'}}
				>New Student Report </h3>
				<div style={{margin: '20px'}}>
				<p>Downloads a spreadsheet containing all students that were checked in for the first time between two dates</p>
                <Form style={{paddingRight: '5px', paddingLeft: '5px'}}>
                  <FormGroup>
                    <ControlLabel>Start Date:</ControlLabel>{' '}
                    <FormControl onChange={this.updateStartDate} value={this.state.startDate} type="date"/>{'  '}
                    <ControlLabel>End Date:</ControlLabel>{' '}
                    <FormControl onChange={this.updateEndDate} value={this.state.endDate} type="date"/>{'  '}
                    <Button style={{marginTop: '10px'}} onClick={this.downloadCSV} disabled={buildingCSV}>{buildingCSV ? 'Downloading...' : 'Download'}</Button>
                  </FormGroup>
                </Form>
			</div>
			</div>
		);
	}
}

export default NewStudentsReport;
