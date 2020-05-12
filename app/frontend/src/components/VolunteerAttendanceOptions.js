import React from 'react';
import { Button } from 'react-bootstrap';
import { httpDelete, getPermissions, domain, protocol } from './Helpers';

class VolunteerAttendanceOptions extends React.Component {
    
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
        if (this.props.row['volunteerID'] !== this.state.row['volunteerID']) {
            this.setState({
                row: this.props.row,
            })
        }
    }

    deleteRow() {
        const permissions = getPermissions();
        if (permissions.indexOf('delete_volunteerattendanceitems') < 0) {
            alert('Error: You are not authorized to delete volunteer attendance items');
        } else {
            const {row} = this.state;
            const id = row['volunteerAttendanceItemID'];
           

            httpDelete(`${protocol}://${domain}/api/volunteer_attendance/?key=${id}`);  
            this.props.CustomFunction(row['volunteerID']);
        }
    }

    render() {
        console.log(this.state)
        return(
            <Button 
                bsStyle="danger" 
                onClick={(e) => { if (window.confirm('Are you sure you wish to delete this volunteer?')) this.deleteRow(e)}}>Delete
            </Button>
        )
    }
}

export default VolunteerAttendanceOptions;
