import React from 'react';
import ActivityCheckbox from'./ActivityCheckbox.js'
import { Label } from 'react-bootstrap';
import { httpDelete, httpPost, domain } from './Helpers';

class ActivityCheckboxes extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            activities: {},
            studentID: 0,
            error: "",
            numChecked: 0,
            date: ''
        }

        this.toggleCheckbox = this.toggleCheckbox.bind(this)
    }

    componentDidMount() {
        let numChecked = 0;
        const activities = this.props.row['activities']
        const keys = Object.keys(activities);
        for (let i = 0; i < keys.length; i++) {
            if (activities[keys[i]].type === 'boolean') {
                if (activities[keys[i]].value === true) {
                    numChecked++;
                }
            } else {
                if (activities[keys[i]].value !== '') {
                    numChecked++;
                }
            }
        }

        this.setState({
            activities: activities,
            studentID: this.props.row.studentID,
            numChecked: numChecked,
            date: this.props.row.date
        });
    }

    // Makes sure that the checkbox reflects whether it has been selected
    toggleCheckbox = (isChecked, label, value, type) => {
        const { activities, studentID, numChecked, date } = this.state;
        var self = this; // This is a cheap hack so the .then() function can have access to state

        // Get attendanceItemID, studentID, activityID from activities
        const activityID = activities[label].activityID
        const attendanceItemID = activities[label].attendanceItemID

        // Carry out API actions
        if (!isChecked) {
            // Add attendanceItem to database
            const today = new Date();
            let body = {
                "student_id": studentID,
                "activity_id": activityID,
                "date":`${date}`,
                "time":`${today.getHours()}:${today.getMinutes() >= 10 ? today.getMinutes() : `0${today.getMinutes()}`}:${today.getSeconds() >= 10 ? today.getSeconds() : `0${today.getSeconds()}`}`,
            };
            if (type === 'string') {
                if (value === '') {
                    return; // do not post if value is blank
                }
                body["str_value"] = value;
            } else if (type === 'float') {
                if (value === '') {
                    return; // do not post if value is blank
                }
                body["num_value"] = value;
            }
            httpPost(`https://${domain}/api/attendance/`, body)
            .then(function(result) {
                // Update state to refresh checkboxes
                if ('error' in result) {
                    self.setState({error: result.error})
                } else {
                    if (type === 'boolean') {
                        activities[label].value = true;
                    } else if (type === 'string') {
                        activities[label].value = result.str_value;
                    } else if (type === 'float') {
                        activities[label].value = result.num_value;
                    }
                    activities[label].attendanceItemID = result.id;
                    self.setState({activities: activities, numChecked: numChecked + 1})
                }
            });
        } else {
            // Remove attendanceItem from the database
            if (numChecked === 1) {
                // We're trying to uncheck the last checkbox
                // show some sort of visual error??
            } else {
                httpDelete(`https://${domain}/api/attendance/?key=${attendanceItemID}`).then(function(result) {
                    if ('error' in result) {
                        self.setState({error: result.error})
                    } else {
                        if (type === 'boolean') {
                            activities[label].value = false;
                        } else {
                            activities[label].value = '';
                        }
                        self.setState({activities: activities, numChecked: numChecked - 1})
                    }
                });
            }
        }
    }

    // Creates a checkbox for each activity
    createCheckboxes = () => {
        const { activities } = this.state;
        const keys = Object.keys(activities);
        var boxes = [];
        for (var i = 0; i < keys.length; i++) {
            const type = activities[keys[i]].type;
            const value = activities[keys[i]].value;
            let checked;
            if (type === 'boolean') {
                checked = value;
            } else {
                checked = value !== ''
            }
            boxes.push(
                <ActivityCheckbox
                    label={keys[i]}
                    key={keys[i]}
                    activityType={type}
                    value={value}
                    checked = {checked}
                    toggleCheckbox={this.toggleCheckbox}
                />
            )
        }
        return boxes;
    };

    render() {
        return (
            <span className="container">
                <span className="row">
                    <span className="col-sm-12">
                        {this.state.numChecked < 2 && <Label bsStyle="warning">At least one box must be checked</Label>}
                        {this.state.error !== "" && <Label bsStyle="danger">Error {this.state.error}: Your changes have not been saved. Please refresh and try again.</Label>}
                        {this.createCheckboxes()}
                    </span>
                </span>
            </span>
        );
    }
}

export default ActivityCheckboxes;
