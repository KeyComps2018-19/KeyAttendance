import { CredentialsContext } from './CredentialsContext';
import React from 'react';
import { Redirect } from 'react-router-dom';

// Store helper functions that we'll probably re-use here!

// TODO: modify HTTP methods to automatically log out if we get a token validation error.

function httpPost(url, body={}, headers={'Content-Type':'application/json'}) {
	return fetch(url, {
		method: "POST",
		headers: headers,
		body: JSON.stringify(body)
	}).then(response => {
		if (response.status >= 400) {
			return {'error':response.status}
		} else {
			return response.json()
		}
	}); 
}

function httpGet(url, headers={'Content-Type':'application/json'}) {
	return fetch(url, {
		method: "GET",
		headers: headers,
	}).then(response => {
		if (response.status >= 400) {
			return {'error':response.status}
		} else {
			return response.json()
		}
	}); 
}

function httpDelete(url, body={}, headers={'Content-Type':'application/json'}) {
	return fetch(url, {
		method: "DELETE",
		headers: headers,
		body: JSON.stringify(body)
	}).then(response => {
		if (response.status >= 400) {
			return {'error':response.status}
		} else {
			return {};
		}
	}); 
}

function compareActivities(a,b) {
	if (a.ordering < b.ordering)
	  return -1;
	if (a.ordering > b.ordering)
	  return 1;
	return 0;
}

async function downloadAttendanceCSV(startDate, endDate=null) {
	// Get data
	const url = (startDate === endDate || endDate === null) ? `http://127.0.0.1:8000/api/attendance?day=${startDate}` : `http://127.0.0.1:8000/api/attendance?startdate=${startDate}&enddate=${endDate}`;
	const rawAttendanceData = await fetch(url);
	const attendanceData = await rawAttendanceData.json();
	const rawStudentData = await fetch('http://127.0.0.1:8000/api/students');
	const studentData = await rawStudentData.json();
	const rawActivityData = await fetch(`http://127.0.0.1:8000/api/activities`);
	const activityData = await rawActivityData.json();
	activityData.sort(compareActivities) // Make sure that our columns are in a consistent order

	// Make sure we got the data we came for.
	if (attendanceData.length === 0 || activityData.length === 0) {
		return
	}

	// Build activity lookup table
	var activities = {}
	for (var i = 0; i < activityData.length; i++) {
		if (activityData[i].is_showing) {
			activities[activityData[i].name] = {'id': activityData[i].activity_id, 'ordering': activityData[i].ordering}
		}
	}

	// Combine attendance items. Need to sort by date and student id.
	var entries = {}
	for (var i = 0; i < attendanceData.length; i++) {
		if (entries[`${attendanceData[i].student_id}${attendanceData[i].date}`] == null) {
			entries[`${attendanceData[i].student_id}${attendanceData[i].date}`] = {'date':attendanceData[i].date, 'id': attendanceData[i].student_id}
		}
		entries[`${attendanceData[i].student_id}${attendanceData[i].date}`][attendanceData[i].activity_id] = 'Y'
	}

	// Build spreadsheet
	var sheet = []
	var columns = ['Date','First', 'Last', 'Student Key']
	for (var i = 0; i < activityData.length; i++) {
		columns.push(activityData[i].name)
	}
	const keys = Object.keys(entries)
	for (var i = 0; i < keys.length ; i++) {
		var row = []
		// match student data to current id
		for (var j = 0; j < studentData.length; j++) { // unfortunately, student data isn't in any particular order. O(n) it is!
			if (studentData[j].id === entries[keys[i]].id) {
				row[1] = studentData[j].first_name;
				row[2] = studentData[j].last_name;
				break;
			}
		} 
		for (var j = 0; j < columns.length; j++) {
			switch (columns[j]) {
				case 'Date':
					row[j] = entries[keys[i]].date
					break;
				case 'First':
					break;
				case 'Last':
					break;
				case 'Student Key':
					row[j] = 'N/A' // Needs student keys to be added to the database
					break;
				default:
					// If this row has a value for this column, put it in the table. Else plop an 'N' in this column.
					if (entries[keys[i]][activities[columns[j]].id] != null) {
						row[j] = entries[keys[i]][activities[columns[j]].id];
					} else {
						row[j] = 'N';
					}
			}
		}
		sheet.push(row);
	}

	// Put data in a CSV
	var papa = require('papaparse') // a strangely named but fairly effective CSV library
	var csvString = papa.unparse({
		fields: columns,
		data: sheet
	});

	// Download - it's a lil janky but it works. Thanks, stackoverflow!
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvString));
	element.setAttribute('download', `Attendance_${(startDate === endDate || endDate === null) ? startDate : `${startDate}_${endDate}`}.csv`);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

// Makes sure that we have a token, else redirects to login screen
const checkCredentials = (Component) => {
	return (
		<CredentialsContext.Consumer>
            {({token, updateToken}) => {
				if (token === '') {
					return <Redirect to='/'/>
				} else {
					return <Component/>;
				}
			}}
        </CredentialsContext.Consumer>
	);
}

// Directly gives a component access to credentials via props
const withCredentials = (Component) => {
	return (props) => (
		<CredentialsContext.Consumer>
			{({token, updateToken}) => {
				return <Component {...props} token={token} updateToken={updateToken}/>
			}}
		</CredentialsContext.Consumer>
	)
}

export { downloadAttendanceCSV, compareActivities, httpPost, httpGet, httpDelete, checkCredentials, withCredentials }