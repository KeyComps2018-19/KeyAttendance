import React from 'react';
import { Form, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
import { httpGet, protocol, domain, downloadReportsCSV } from './Helpers';

class AttendanceByProgramReport extends React.Component {
    constructor(props) {
    	super(props);
  
      	this.state = {
			activities: [],
			activityName: "",
			activityNumber: 0,
			buildingCSV: false,
			startDate: "",
			endDate: "",
		};

		this.handleActivityDropdownSelect = this.handleActivityDropdownSelect.bind(this);
		this.updateEndDate = this.updateEndDate.bind(this);
		this.updateStartDate = this.updateStartDate.bind(this);
		this.downloadCSV = this.downloadCSV.bind(this);
	}

	async downloadCSV() {
		const { startDate, endDate, activityNumber, activityName } = this.state;
		if (startDate === "" || endDate === "") {
		  return
		}
		this.setState({ buildingCSV: true });
		const sheet = []
		const columns = ['Date', 'Student Name', 'Student Key']
		const title = `${activityName}_${startDate}-${endDate}`
		const items = await httpGet(`${protocol}://${domain}/api/reports/byActivityAttendance/?startdate=${startDate}&enddate=${endDate}&activity=${activityNumber}`)
		const students = await httpGet(`${protocol}://${domain}/api/students/`)
		
		// sheet should look like: 
		// Date | Student Name | Student Key 

		for (let itemIndex in items) {
			let studentName = "";
			let studentKey = "";
			for (let studentIndex in students) {
				if (students[studentIndex].id === items[itemIndex].student_id) {
					studentName = students[studentIndex].first_name + " " + students[studentIndex].last_name
					studentKey = students[studentIndex].student_key
				}
			}
			let row = []
			row[0] = items[itemIndex].date;
			row[1] = studentName
			row[2] = (studentKey === null ? "N/A" : studentKey)
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

	async componentDidMount() {
		const activities = await httpGet(`${protocol}://${domain}/api/activities/`);
        this.setState({activities: activities, activityName: activities[0].name, activityNumber: activities[0].activity_id});
	}

	handleActivityDropdownSelect(e) {
		const { activities } = this.state;
		let activityName = e.target.value;
		let activityNumber = 0;
		for (let key in activities) {
			if (activities[key].name === activityName) {
				activityNumber = activities[key].activity_id;
			}
		}
    	this.setState({activityName: activityName, activityNumber: activityNumber});
    }
	
	render() {
		const activityList = this.state.activities.map((item, i) => <option value={item.name} key={`item${i}`}>{item.name}</option>)
		const {buildingCSV} = this.state;

		return (
			<div>
				<h3
				style={{textAlign: 'center', fontSize: '25px'}}
				>Attendance by Program </h3>
				<div style={{margin: '20px'}}>
				<p>Downloads a spreadsheet containing all attendance records between two dates for a given program.</p>
                <Form style={{paddingRight: '5px', paddingLeft: '5px'}}>
                  <FormGroup>
                    <ControlLabel>Program: </ControlLabel>{' '}
                    <FormControl componentClass="select" 
                      name="type" 
                      onChange={this.handleActivityDropdownSelect}
                      defaultValue="string"
                    >
                    	{activityList}
                    </FormControl>{'  '}
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

export default AttendanceByProgramReport;
