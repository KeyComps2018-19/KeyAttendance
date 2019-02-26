import React from 'react';
import { Button, ButtonToolbar, ListGroup, ListGroupItem, Modal } from 'react-bootstrap';
import { httpGet, httpPatch, domain } from './Helpers';
import Autocomplete from './Autocomplete';

class AssignStudentKeyModal extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            oldID: 0,
            student: {},
            suggestions: [],
            searchArray: [],
            match: "",
        }

        this.onCancel = this.onCancel.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.setMatch = this.setMatch.bind(this);
        this.buildSuggestionsArray = this.buildSuggestionsArray.bind(this);
        this.setMatchFromSearch = this.setMatchFromSearch.bind(this);
    }

    componentDidMount() {
        this.setState({
            oldID: this.props.studentID
        });
    }

    async componentDidUpdate() {
        if (this.props.studentID !== this.state.oldID && this.props.studentID !== -1) {
            const student = await httpGet(`https://${domain}/api/students/?id=${this.props.studentID}`);
            const suggestions = await httpGet(`https://${domain}/api/suggestions/student/?id=${this.props.studentID}`);
            const searchArray = this.buildSuggestionsArray();

            this.setState({
                student: student,
                suggestions: suggestions,
                searchArray: searchArray,
                oldID: this.props.studentID
            });
        }
    }

    buildSuggestionsArray() {
        let array = []
        const citySpanStudents = this.props.citySpanStudents;
        for (var object in this.props.citySpanStudents) {
            array.push({
                firstName: citySpanStudents[object].first_name,
                lastName1: citySpanStudents[object].last_name,
                lastName2: "",
                id: citySpanStudents[object].student_key
            });
        }
        return array;
    }

    setMatch(studentKey) {
        this.setState({match: studentKey});
    }

    setMatchFromSearch(e, studentKey) {
        this.setState({match: studentKey});
    }

    onCancel() {
        this.setState({student: {}, match: "", suggestions: []});
        this.props.onClose()
    }

    onSubmit() {
        // PATCH student
        httpPatch(`https://${domain}/api/students/`, {'student_key': this.state.match, 'id': this.props.studentID});
        this.setState({student: {}, match: "", suggestions: []});
        this.props.onClose(this.props.studentID);
    }

    render() {
        return(
            <Modal show={this.props.show}>
				<Modal.Header>
					<Modal.Title>Find Student Key Match: {this.state.student.first_name !== undefined ? this.state.student.first_name + ' ' + this.state.student.last_name : ''}</Modal.Title>
				</Modal.Header>

				<Modal.Body>
                    <h4>Suggestions:</h4>
                    {this.state.suggestions.length === 3 
                    && <ListGroup>
                        <ListGroupItem><ButtonToolbar style={{float: 'right'}} ><Button onClick={() => this.setMatch(this.state.suggestions[0].match_key)} bsStyle="primary">Select</Button></ButtonToolbar><p style={{paddingTop: '4px'}}>{this.state.suggestions[0].match_name}</p></ListGroupItem>
                        <ListGroupItem><ButtonToolbar style={{float: 'right'}} ><Button onClick={() => this.setMatch(this.state.suggestions[1].match_key)} bsStyle="primary">Select</Button></ButtonToolbar><p style={{paddingTop: '4px'}}>{this.state.suggestions[1].match_name}</p></ListGroupItem>
                        <ListGroupItem><ButtonToolbar style={{float: 'right'}} ><Button onClick={() => this.setMatch(this.state.suggestions[2].match_key)} bsStyle="primary">Select</Button></ButtonToolbar><p style={{paddingTop: '4px'}}>{this.state.suggestions[2].match_name}</p></ListGroupItem>
                      </ListGroup>}
                    <br/>
                    <h4>Search for match:</h4>
                    <Autocomplete suggestions={this.state.searchArray} handler={this.setMatchFromSearch}/>
                    <br/>
                    {this.state.match !== "" &&  <h4>Selected student key: {this.state.match}</h4>}
				</Modal.Body>

				<Modal.Footer>
					<Button onClick={this.onCancel}>Cancel</Button>
					<Button onClick={this.onSubmit} bsStyle="primary">Save</Button>
				</Modal.Footer>
			</Modal>
        )
    }
}

export default AssignStudentKeyModal;
