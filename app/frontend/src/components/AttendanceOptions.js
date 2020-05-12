import React from 'react';
import { Button } from 'react-bootstrap';
import { httpDelete, getPermissions, domain, protocol } from './Helpers';

class AttendanceOptions extends React.Component {
    
    constructor(props) {
        super(props)
        this.state = {
            row: {},
        }

        this.deleteRow = this.deleteRow.bind(this);
    }

    componentDidMount() {
        this.setState({
            row: this.props.row,
        });
    }

    componentDidUpdate() {
        if (this.props.row['studentID'] !== this.state.row['studentID']) {
            this.setState({
                row: this.props.row,
            })
        }
    }

    deleteRow() {
        const permissions = getPermissions();
        if (permissions.indexOf('delete_attendanceitems') < 0) {
            alert('Error: You are not authorized to delete attendance items');
        } else {
            const { row } = this.state;
            const activities = row['activities']
            const keys = Object.keys(activities);
            let ids = [];

            // figure out what to delete
            for (let i = 0; i < keys.length; i++) {
                if (activities[keys[i]].attendanceItemID !== 0) {
                    ids.push(activities[keys[i]].attendanceItemID)
                }
            }

            // delete the things
            for (let i = 0; i < ids.length; i++) {
                httpDelete(`${protocol}://${domain}/api/attendance/?key=${ids[i]}`);
            }

            this.props.CustomFunction(row['studentID']);
        }
    }

    render() {
        return(
            <Button 
                bsStyle="danger" 
                onClick={(e) => { if (window.confirm('Are you sure you wish to delete this student?')) this.deleteRow(e)}}>Delete
            </Button>
        )
    }
}

export default AttendanceOptions;
