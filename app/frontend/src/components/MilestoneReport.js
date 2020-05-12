import React from 'react';
import { Form, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
import { httpGet, protocol, domain, downloadReportsCSV } from './Helpers';

class MilestoneReport extends React.Component {
    constructor(props) {
    	super(props);
  
      	this.state = {
			milestone: 30,
			buildingCSV: false,
			startDate: "",
			endDate: "",
		};

		this.updateEndDate = this.updateEndDate.bind(this);
		this.updateStartDate = this.updateStartDate.bind(this);
		this.updateMilestone = this.updateMilestone.bind(this);
		this.downloadCSV = this.downloadCSV.bind(this);
	}

	async downloadCSV() {
		const { startDate, endDate, milestone } = this.state;
		if (startDate === "" || endDate === "") {
		  return
		}
		this.setState({ buildingCSV: true });
		const sheet = []
		const columns = ['Student Name', 'Student Key']
		const title = `Milestone_${milestone}_${startDate}-${endDate}`
		const ids = await httpGet(`${protocol}://${domain}/api/reports/milestones/?startdate=${startDate}&enddate=${endDate}&milestone=${milestone}`)
		const students = await httpGet(`${protocol}://${domain}/api/students/`)

		// sheet should look like: 
		// Student Name | Student Key 

		for (let i in ids.milestoneStudents) {
			let studentName = "";
			let studentKey = "";
			for (let j in students) {
				if (students[j].id === ids.milestoneStudents[i]) {
					studentName = students[j].first_name + " " + students[j].last_name
					studentKey = students[j].student_key
				}
			}
			let row = []
			row[0] = studentName
			row[1] = (studentKey === null ? "N/A" : studentKey)
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
	
	updateMilestone(e) {
			this.setState({milestone: e.target.value});
	}	
	render() {
		const {buildingCSV} = this.state;

		return (
			<div>
				<h3
				style={{textAlign: 'center', fontSize: '25px'}}
				>Attendance Milestones </h3>
				<div style={{margin: '20px'}}>
				<p>Downloads a spreadsheet containing a list of students who reached a given attendance milestone between two dates.</p>
				<p>For instance, if the milestone was set to 30, the spreadsheet would list the students to attended the Key for their 30th time between two given dates</p>
                <Form style={{paddingRight: '5px', paddingLeft: '5px'}}>
                  <FormGroup>
										<ControlLabel>Milestone:</ControlLabel>{' '}
                    <FormControl onChange={this.updateMilestone} value={this.state.milestone} type="number"/>{'  '}
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

export default MilestoneReport;
