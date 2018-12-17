import React from 'react';
import ReactCollapsingTable from 'react-collapsing-table';
import Checkboxes from '../components/Checkboxes';
import AttendanceOptions from '../components/AttendanceOptions';
import AddStudentModal from '../components/AddStudentModal';
import Autocomplete from "../components/Autocomplete";
import { httpPost, httpGet } from '../components/Helpers';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { downloadAttendanceCSV, compareActivities } from '../components/Helpers';

class Attendance extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            buildingCSV: false,
            students: [],
            activities: [],
            attendanceItems: [],
            suggestionsArray: [],
            attendance: [],
            showStudentModal: false,
        }

        this.downloadCSV = this.downloadCSV.bind(this);
        this.addStudent = this.addStudent.bind(this);
        this.removeAttendanceRow = this.removeAttendanceRow.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    async componentDidMount() {
        try {
            const today = new Date();
            const rawStudents = httpGet('http://127.0.0.1:8000/api/students');
            const rawAttendance = httpGet(`http://127.0.0.1:8000/api/attendance?day=${`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`}`);
            const rawActivities = httpGet('http://127.0.0.1:8000/api/activities');
            const students = await rawStudents.json();
            const attendanceItems = await rawAttendance.json();
            const activities = await rawActivities.json();
            activities.sort(compareActivities)
            const suggestions = this.makeSuggestionsArray(students);

            this.setState({
                suggestionsArray: suggestions,
                students: students,
                activities: activities,
                attendanceItems: attendanceItems
            });
        } catch (e) {
            console.log(e);
        }
        this.buildSheet();
    }

    buildSheet() {
        const { activities, attendanceItems, students } = this.state;
        // Combine attendance items. Need to sort by student id.
        var entries = {};
        for (var i = 0; i < attendanceItems.length; i++) {
            if (attendanceItems[i].activity_id === -1) {
                continue;
            }
            if (entries[`${attendanceItems[i].student_id}`] == null) {
                entries[`${attendanceItems[i].student_id}`] = {'time':attendanceItems[i].time};
            }
            entries[`${attendanceItems[i].student_id}`][attendanceItems[i].activity_id] = {'value':true, 'itemID':attendanceItems[i].id};
        }

        // Build table of the form [{name, activity1, ... , activityn, time}]
        var sheet = [];
        const ids = Object.keys(entries);
        var columns = ['Name'];
        for (var i = 0; i < activities.length; i++) {
            columns.push(activities[i].name);
        }
        for (var i = 0; i < ids.length; i++) {
            var row = {}
            // match student data to current id
            for (var j = 0; j < students.length; j++) { // unfortunately, student data isn't in any particular order. O(n) it is!
                if (students[j].id === parseInt(ids[i])) {
                    row['name'] = `${students[j].first_name} ${students[j].last_name}`;
                    row['studentID'] = students[j].id;
                    break;
                }
            } 
            row['time'] = entries[ids[i]].time;
            row['activities'] = {};
            // fill in activities data
            for (var j = 0; j < activities.length; j++) {
                row['activities'][activities[j].name] = {
                    'value': (entries[ids[i]][activities[j].activity_id]) ? true : false,
                    'activityID': activities[j].activity_id,
                    'attendanceItemID': (entries[ids[i]][activities[j].activity_id]) ? entries[ids[i]][activities[j].activity_id].itemID : 0,
                }
            }
            sheet.push(row)
        }

        this.setState({ attendance: sheet });
    }

    addStudent(e, studentID) {
        const { students, attendance, activities } = this.state;
        const today = new Date();
        const self = this;

        // make sure we don't already have this student.
        for (let i = 0; i < attendance.length; i++) {
            if (parseInt(studentID) === attendance[i].studentID) {
                return;
            }
        }

        httpPost('http://127.0.0.1:8000/api/attendance/', {
            "student_id": studentID,
            "activity_id": 7, // Key    
            "date":`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`,
            "time":`${today.getHours()}:${today.getMinutes() > 10 ? today.getMinutes() : `0${today.getMinutes()}`}:${today.getSeconds() > 10 ? today.getSeconds() : `0${today.getSeconds()}`}`,
        }).then(function(result) {
            // Add new row to table
            let name = "";
            for (var j = 0; j < students.length; j++) {
                if (students[j].id === parseInt(studentID)) {
                    name = `${students[j].first_name} ${students[j].last_name}`;
                    break;
                }
            } 

            let activityList = {};
            for (var j = 0; j < activities.length; j++) {
                activityList[activities[j].name] = {
                    'activityID': activities[j].activity_id,
                    'attendanceItemID': 0,
                    'value': false,
                }
            }
            activityList['Key']['value'] = true;
            activityList['Key']['attendanceItemID'] = result.id;

            const row = {'name': name, 'studentID': parseInt(studentID), 'time': result.time, 'activities':activityList};
            attendance.push(row);
            self.setState({attendance: attendance});
        });
    }

    makeSuggestionsArray(suggestions) {
        var array = [];
        var lastHolder1;
        var lastHolder2;
        var tempArray;
        for (var object in suggestions) {
            if (suggestions[object]['last_name'].includes(" ")) {
                tempArray = suggestions[object]['last_name'].split(" ");
                lastHolder1 = tempArray[0];
                lastHolder2 = tempArray[1];
            }
            else {
                lastHolder1 = suggestions[object]['last_name'];
                lastHolder2 = "";
            }
            array.push({
                firstName: suggestions[object]['first_name'],
                lastName1: lastHolder1,
                lastName2: lastHolder2,
                id: suggestions[object]['id']
            });
        }
        return array;
    }

    downloadCSV() {
        const today = new Date()
        this.setState({ buildingCSV: true });
        downloadAttendanceCSV(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`)
        this.setState({ buildingCSV: false });
    }

    // Allows the AttendanceOptions object to  update state here
    removeAttendanceRow(studentID) {
        const { attendance } = this.state;
        for (let i = 0; i < attendance.length; i++) {
            if (attendance[i].studentID === studentID) {
                attendance.splice(i, 1);
            }
        }
        this.setState({attendance: attendance});
    }

    openModal() {
        this.setState({showStudentModal: true});
    }

    closeModal(student=null) {
        const { students } = this.state;
        let suggestions = []

        if (student !== null) {
            // First, add student to students list
            students.push({'first_name': student.first_name, 'last_name': student.last_name, 'id': student.id});
            suggestions = this.makeSuggestionsArray(students);
            // Then, add student to the array.
            this.addStudent(null, student.id);
        }

        this.setState({showStudentModal: false, students: students, suggestions: suggestions});
    }

    render() {
        const rows = this.state.attendance.map(item =>
            (
               {
                   name: item.name,
                   time: item.time,
                   activities: item.activities,
                   studentID: item.studentID
               }
           )
        ).sort((a, b) => {
            return b.time.localeCompare(a.time); // For some reason the table doesn't automatically sort.
        });

        const columns = [
            {
                accessor: 'name',
                label: 'Name',
                priorityLevel: 1,
                position: 1,
                minWidth: 100,
                sortable: true
            },
            {
                accessor: 'time',
                label: 'Check-in Time',
                priorityLevel: 2,
                position: 2,
                minWidth: 100,
                sortable: true
            },
            {
                accessor: 'options',
                label: 'Options',
                priorityLevel: 3,
                position: 3,
                CustomComponent: AttendanceOptions,
                sortable: false,
                minWidth: 100
            },
            { 
                accessor: 'activities',
                label: 'Activities',
                priorityLevel: 4,
                position: 4,
                minWidth: 2000,
                CustomComponent: Checkboxes,
                sortable: false, 
            }
        ];

        const buildingCSV = this.state.buildingCSV;
        const today = new Date()

        return (
            <div className='content'>
                <AddStudentModal show={this.state.showStudentModal} onSubmit={this.closeModal}/>
                <h1>Attendance for {today.getMonth() + 1}-{today.getDate()}-{today.getFullYear()}</h1>
                <br/>
                <ButtonToolbar style={{ float: 'right'}}>
                    <Button onClick={this.openModal}>New Student</Button>
                    <Button onClick={this.downloadCSV} disabled={buildingCSV}>{buildingCSV ? 'Downloading...' : 'Download'}</Button>
                </ButtonToolbar>
                <Autocomplete
					suggestions={this.state.suggestionsArray}
					handler={this.addStudent}
				/>
                <br/>
                <ReactCollapsingTable
                        rows = { rows }
                        columns = { columns }
                        column = {'time'}
                        direction = {'descending'}
                        showPagination={ true }
                        callbacks = {{'options':this.removeAttendanceRow}}
                />
            </div>
        )
    }
}

export default Attendance;