import React from 'react';
import { Button } from 'react-bootstrap';
import { httpDelete, domain } from './Helpers';

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
            httpDelete(`https://${domain}/api/attendance/?key=${ids[i]}`);
        }

        this.props.CustomFunction(row['studentID']);
    }

    render() {
        return(
            <Button bsStyle="danger" onClick={this.deleteRow}>Delete</Button>
        )
    }
}

export default AttendanceOptions;
