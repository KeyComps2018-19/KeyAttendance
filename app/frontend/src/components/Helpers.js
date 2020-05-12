//Helper functions for date selection in data visualizations


import React from 'react';
import { Redirect } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';

// Store helper functions that we'll probably re-use here!

const history = createBrowserHistory();

//For local development
const domain = '127.0.0.1:8000'
const protocol = 'http'

// // For production server
// const domain = 'www.keyattendance.com'
// const protocol = 'https'


function httpPost(url, body={}) {
	const token = window.localStorage.getItem("key_credentials");

	// if we don't have a token, we shouldn't be trying to call this function.
	if (token === null) {
		history.push(`/`)
		return
	}

	return fetch(url, {
		method: "POST",
		headers: {'Content-Type':'application/json', 'Authorization': 'JWT ' + token},
		body: JSON.stringify(body)
	}).then(response => {
		if (response.status >= 400) {
			// Logout if we got a token validation error
			if (response.status === 403) {
				logout()
				history.push(`/`)
			}
			return {'error' : response.status, 'response' : response.json()}
		} else {
			return response.json()
		}
	}); 
}

function httpPostFile(url, body={}) {
    const token = window.localStorage.getItem("key_credentials");

    // if we don't have a token, we shouldn't be trying to call this function.
    if (token === null) {
        history.push(`/`)
        return
    }

    var form = new FormData()
    form.append('file', body.photo_value);
    form.append('student_id', body.student_id);
    form.append('info_id', body.info_id);

    return fetch(url, {
        method: "POST",
        headers: {'Authorization': 'JWT ' + token},
        body: form
    }).then(response => {
        if (response.status >= 400) {
            // Logout if we got a token validation error
            if (response.status === 403) {
                logout()
                history.push(`/`)
            }
            return {'error' : response.status, 'response' : response.json()}
        } else {
            return response.json()
        }
    });
}

function httpPatch(url, body={}) {
	const token = window.localStorage.getItem("key_credentials");

	// if we don't have a token, we shouldn't be trying to call this function.
	if (token === null) {
		history.push(`/`)
		return
	}

	return fetch(url, {
		method: "PATCH",
		headers: {'Content-Type':'application/json', 'Authorization': 'JWT ' + token},
		body: JSON.stringify(body)
	}).then(response => {
		if (response.status >= 400) {
			// Logout if we got a token validation error
			if (response.status === 403) {
				logout()
				history.push(`/`)
			}
			return {'error' : response.status, 'response' : response.json()}
		} else if (response) {
			return response.json()
		} else {
			return // we got nothing back
		}
	}); 
}

function httpPatchFile(url, body={}) {
	const token = window.localStorage.getItem("key_credentials");

	// if we don't have a token, we shouldn't be trying to call this function.
	if (token === null) {
			history.push(`/`)
			return
	}

	var form = new FormData()
    form.append('file', body.photo_value);
    form.append('student_id', body.student_id);
    form.append('info_id', body.info_id);
    form.append('id', body.id);

	return fetch(url, {
			method: "PATCH",
			headers: {'Authorization': 'JWT ' + token},
			body: form
	}).then(response => {
			if (response.status >= 400) {
					// Logout if we got a token validation error
					if (response.status === 403) {
							logout()
							history.push(`/`)
					}
					return {'error' : response.status, 'response' : response.json()}
			} else {
					return response.blob()
			}
	});
}

function httpGet(url) {
	const token = window.localStorage.getItem("key_credentials");
	// if we don't have a token, we shouldn't be trying to call this function.
	if (token === null) {
		history.push(`/`)
		return
	}

	return fetch(url, {
		method: "GET",
		headers: {'Content-Type':'application/json', 'Authorization': 'JWT ' + token},
	}).then(response => {
		if (response.status >= 400) {
			// Logout if we got a token validation error
			if (response.status === 403) {
				logout()
				history.push(`/`)
			}
			return {'error' : response.status, 'response' : response.json()}
		} else {
			return response.json()
		}
	}); 
}

function httpGetFile(url) {
	const token = window.localStorage.getItem("key_credentials");
	// if we don't have a token, we shouldn't be trying to call this function.
	if (token === null) {
		history.push(`/`)
		return
	}

	return fetch(url, {
		method: "GET",
		headers: {'Content-Type':'application/json', 'Authorization': 'JWT ' + token},
	}).then(response => {
		if (response.status >= 400) {
			// Logout if we got a token validation error
			if (response.status === 403) {
				logout()
				history.push(`/`)
			}
			return {'error' : response.status, 'response' : response.json()}
		} else {
			return response.blob()
		}
	}); 
}

function httpDelete(url, body={}) {
	const token = window.localStorage.getItem("key_credentials");

	// if we don't have a token, we shouldn't be trying to call this function.
	if (token === null) {
		history.push(`/`)
		return
	}
  
	return fetch(url, {
		method: "DELETE",
		headers: {'Content-Type':'application/json', 'Authorization': 'JWT ' + token},
		body: JSON.stringify(body)
	}).then(response => {
		if (response.status >= 400) {
			// Logout if we got a token validation error
			if (response.status === 403) {
				logout()
				history.push(`/`)
			}
			return {'error' : response.status, 'response' : response.json()}
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

function decodeToken(token) {
	let partitions = token.split('.');
    return JSON.parse(atob(partitions[1]));
}

function logout() {
	window.localStorage.removeItem("key_credentials");
	window.localStorage.removeItem("permissions");
}


// async function downloadVolunteerAttendanceCSV(startDate, endDate = null){
// 	// Get data
// 	const url = (startDate === endDate || endDate === null) ? `${protocol}://${domain}/api/attendance/?day=${startDate}` : `${protocol}://${domain}/api/attendance/?startdate=${startDate}&enddate=${endDate}`;
// 	const attendanceData = await httpGet(url);
// 	const studentData = await httpGet(`${protocol}://${domain}/api/volunteers/`);
// 	//const activityData = await httpGet(`${protocol}://${domain}/api/activities/`);
// 	activityData.sort(compareActivities) // Make sure that our columns are in a consistent order
// 	// Make sure we got the data we came for.
// 	if (attendanceData.length === 0 || activityData.length === 0) {
// 		return
// 	}
// 	// Build activity lookup table
// 	var activities = {}
// 	for (var i = 0; i < activityData.length; i++) {
// 		if (activityData[i].is_showing) {
// 			activities[activityData[i].name] = {'id': activityData[i].activity_id, 'ordering': activityData[i].ordering, 'type': activityData[i].type}
// 		}
// 	}

// 	// Combine attendance items. Need to sort by date and student id.
// 	var entries = {}
// 	for (var i = 0; i < attendanceData.length; i++) {
// 		if (entries[`${attendanceData[i].student_id}${attendanceData[i].date}`] == null) {
// 			entries[`${attendanceData[i].student_id}${attendanceData[i].date}`] = {'date':attendanceData[i].date, 'id': attendanceData[i].student_id}
// 		}
// 		if (attendanceData[i].str_value !== null) {
// 			entries[`${attendanceData[i].student_id}${attendanceData[i].date}`][attendanceData[i].activity_id] = attendanceData[i].str_value;
// 		} else if (attendanceData[i].num_value !== null) {
// 			entries[`${attendanceData[i].student_id}${attendanceData[i].date}`][attendanceData[i].activity_id] = attendanceData[i].num_value;
// 		} else {
// 			entries[`${attendanceData[i].student_id}${attendanceData[i].date}`][attendanceData[i].activity_id] = 'Y';
// 		}
// 	}

// 	// Build spreadsheet
// 	var sheet = []
// 	var columns = ['Date','First', 'Last', 'Student Key']
// 	for (var i = 0; i < activityData.length; i++) {
// 		if (activityData[i].is_showing) {
// 			columns.push(activityData[i].name)
// 		}
// 	}
// 	const keys = Object.keys(entries)
// 	for (var i = 0; i < keys.length ; i++) {
// 		var row = []
// 		// match student data to current id
// 		for (var j = 0; j < studentData.length; j++) { // unfortunately, student data isn't in any particular order. O(n) it is!
// 			if (studentData[j].id === entries[keys[i]].id) {
// 				row[1] = studentData[j].first_name;
// 				row[2] = studentData[j].last_name;
// 				row[3] = (studentData[j]["student_key"] !== null ? studentData[j]["student_key"] : 'N/A')
// 				break;
// 			}
// 		} 
// 		for (var j = 0; j < columns.length; j++) {
// 			switch (columns[j]) {
// 				case 'Date':
// 					row[j] = entries[keys[i]].date
// 					break;
// 				case 'First':
// 					break;
// 				case 'Last':
// 					break;
// 				case 'Student Key':
// 					break;
// 				default:
// 					// If this row has a value for this column, put it in the table. Else plop an 'N' in this column.
// 					const activity = activities[columns[j]];
// 					if (entries[keys[i]][activity.id] === undefined) {
// 						if (activity.type === 'boolean') {
// 							row[j] = 'N';
// 						} else {
// 							row[j] = 'N/A';
// 						}
// 					} else {
// 						row[j] = entries[keys[i]][activity.id];
// 					}
// 			}
// 		}
// 		sheet.push(row);
// 	}

// 	// Put data in a CSV
// 	var papa = require('papaparse') // a strangely named but fairly effective CSV library
// 	var csvString = papa.unparse({
// 		fields: columns,
// 		data: sheet
// 	});

// 	// Download - it's a lil janky but it works. Thanks, stackoverflow!
// 	var element = document.createElement('a');
// 	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvString));
// 	element.setAttribute('download', `Attendance_${(startDate === endDate || endDate === null) ? startDate : `${startDate}_${endDate}`}.csv`);
// 	element.style.display = 'none';
// 	document.body.appendChild(element);
// 	element.click();
// 	document.body.removeChild(element);
// }
async function downloadAttendanceCSV(startDate, endDate=null) {
	// Get data
	const url = (startDate === endDate || endDate === null) ? `${protocol}://${domain}/api/attendance/?day=${startDate}` : `${protocol}://${domain}/api/attendance/?startdate=${startDate}&enddate=${endDate}`;
	const attendanceData = await httpGet(url);
	const studentData = await httpGet(`${protocol}://${domain}/api/students/`);
	const activityData = await httpGet(`${protocol}://${domain}/api/activities/`);
	activityData.sort(compareActivities) // Make sure that our columns are in a consistent order
	// Make sure we got the data we came for.
	if (attendanceData.length === 0 || activityData.length === 0) {
		return
	}
	// Build activity lookup table
	var activities = {}
	for (var i = 0; i < activityData.length; i++) {
		if (activityData[i].is_showing) {
			activities[activityData[i].name] = {'id': activityData[i].activity_id, 'ordering': activityData[i].ordering, 'type': activityData[i].type}
		}
	}

	// Combine attendance items. Need to sort by date and student id.
	var entries = {}
	for (var i = 0; i < attendanceData.length; i++) {
		if (entries[`${attendanceData[i].student_id}${attendanceData[i].date}`] == null) {
			entries[`${attendanceData[i].student_id}${attendanceData[i].date}`] = {'date':attendanceData[i].date, 'id': attendanceData[i].student_id}
		}
		if (attendanceData[i].str_value !== null) {
			entries[`${attendanceData[i].student_id}${attendanceData[i].date}`][attendanceData[i].activity_id] = attendanceData[i].str_value;
		} else if (attendanceData[i].num_value !== null) {
			entries[`${attendanceData[i].student_id}${attendanceData[i].date}`][attendanceData[i].activity_id] = attendanceData[i].num_value;
		} else {
			entries[`${attendanceData[i].student_id}${attendanceData[i].date}`][attendanceData[i].activity_id] = 'Y';
		}
	}

	// Build spreadsheet
	var sheet = []
	var columns = ['Date','First', 'Last', 'Student Key']
	for (var i = 0; i < activityData.length; i++) {
		if (activityData[i].is_showing) {
			columns.push(activityData[i].name)
		}
	}
	const keys = Object.keys(entries)
	for (var i = 0; i < keys.length ; i++) {
		var row = []
		// match student data to current id
		for (var j = 0; j < studentData.length; j++) { // unfortunately, student data isn't in any particular order. O(n) it is!
			if (studentData[j].id === entries[keys[i]].id) {
				row[1] = studentData[j].first_name;
				row[2] = studentData[j].last_name;
				row[3] = (studentData[j]["student_key"] !== null ? studentData[j]["student_key"] : 'N/A')
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
					break;
				default:
					// If this row has a value for this column, put it in the table. Else plop an 'N' in this column.
					const activity = activities[columns[j]];
					if (entries[keys[i]][activity.id] === undefined) {
						if (activity.type === 'boolean') {
							row[j] = 'N';
						} else {
							row[j] = 'N/A';
						}
					} else {
						row[j] = entries[keys[i]][activity.id];
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

function downloadReportsCSV(json, columnHeaders, title) {
	// Put data in a CSV
	var papa = require('papaparse') // a strangely named but fairly effective CSV library
	var csvString = papa.unparse({
		fields: columnHeaders,
		data: json
	});

	// Download - it's a lil janky but it works. Thanks, stackoverflow!
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvString));
	element.setAttribute('download', `${title}.csv`);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

// Makes sure that we have a valid token, else redirects to login screen
const checkCredentials = (Component) => {
	const token = window.localStorage.getItem("key_credentials");
	const permissions = window.localStorage.getItem('permissions')
	if (token === null || permissions === null) {
		return <Redirect to='/'/>;
	}
	let tokenData = decodeToken(token);
	if (tokenData.exp < Date.now() / 1000) { 
		logout();
		return <Redirect to='/'/>;
	} else {
		return <Component/>;
	}
}

function getPermissions() {
	let permissions = window.localStorage.getItem('permissions')
	if (permissions !== null && permissions.length > 0) {
		return permissions.split(',');
	}
	return null;
}

// Only allows a component to render if the proper role is stored
const withRole = (Component, role) => {
	const storedRole = window.localStorage.getItem("role");
	if (storedRole !== role) {
		return null
	} else {
		return <Component/>;
	}
}


// Returns date obj for the date that is "days ago" number of days ago
//from today's date
//. E.g. if daysAgo equals 3 the date string will be the date 
// three days ago. If daysAgo = 0 the string is today's date.
function getEarlierDate(daysAgo) {
    if (daysAgo < 0) {
      console.error("Expected daysAgo to be a value >= 0 but recieved ", daysAgo);
      daysAgo = -daysAgo;
    }
    var earlierDate = new Date();
    earlierDate.setDate(earlierDate.getDate() - daysAgo);
    return earlierDate;
}

//Returns date obj for previous sunday from given date
//(or the date itself if the date falls on a sunday)
function getPrevSunday(date) {
    var offset = date.getDay();
    date.setDate(date.getDate() - offset);
    return date;
}

//Returns date obj for following saturday from given date
//(or the date itself if the date falls on a saturday)
function getNextSaturday(date) {
    var offset = 6 - date.getDay();
    date.setDate(date.getDate() + offset);
    return date;
}

// Creates a date string of the form yyyy-mm-dd for the date
function dateToString(date){
    var dateString = date.getFullYear().toString() + "-" + (date.getMonth()+1).toString() + "-" + date.getDate().toString();
    return dateString;
}

export { getPermissions, protocol, domain, downloadReportsCSV, downloadAttendanceCSV, compareActivities, httpPost, httpPostFile, httpPatch, httpPatchFile, httpGet, httpGetFile, httpDelete, checkCredentials, history, withRole, getEarlierDate, getPrevSunday, getNextSaturday, dateToString }