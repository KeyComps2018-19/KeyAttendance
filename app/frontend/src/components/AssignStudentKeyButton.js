import React from 'react';
import { Button } from 'react-bootstrap';

class AssignStudentKeyButton extends React.Component {
    

    render() {
        return(
            <div>
                <Button bsStyle="link" onClick={() => this.props.CustomFunction(this.props.row['id'])}>Assign Student Key</Button>
            </div>
        )
    }
}

export default AssignStudentKeyButton;
