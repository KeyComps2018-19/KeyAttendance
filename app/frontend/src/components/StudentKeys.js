import React from 'react';
import Autocomplete from './Autocomplete';
import AssignStudentKeyModal from './AssignStudentKeyModal';
import AssignStudentKeyButton from './AssignStudentKeyButton';
import ReactCollapsingTable from 'react-collapsing-table';
import { httpGet, httpPatch, domain } from './Helpers';
import FileUploader from './FileUploader';

class StudentKeys extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            unmatchedStudents: [],
            citySpanStudents: [],
            suggestions: [],
            showModal: false,
            focusedStudent: -1,
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleRowClick = this.handleRowClick.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleCSVUpload = this.handleCSVUpload.bind(this);
        this.processCSV = this.processCSV.bind(this);
    }

    async componentDidMount() {
        try {
            const unmatchedStudents = await httpGet(`https://${domain}/api/suggestions/unmatchedstudents/`);
            const citySpanStudents = await httpGet(`https://${domain}/api/suggestions/cityspanstudents/`);
            const suggestions = this.makeSuggestionsArray(unmatchedStudents);

            this.setState({
                unmatchedStudents: unmatchedStudents,
                suggestions: suggestions,
                showModal: false,
                focusedStudent: -1,
                citySpanStudents: citySpanStudents
            });
        } catch (e) {
            console.log(e);
        }
    }

    handleCSVUpload(csv) {
        var papa = require('papaparse');
        papa.parse(csv, {error: this.tmpfail, fastMode: true, complete: (result, file) => this.processCSV(result), header: true});
    }

    processCSV(result) {
        var output = []
        for (let index in result.data) {
            let obj = result.data[index];
            if (obj["Student Key"] === "" || obj["Student Key"] === null || obj["Student Key"] === undefined) {
                continue;
            } 
            output.push({first_name: obj["First Name"], last_name: obj["Last Name"], student_key: obj["Student Key"]})
        }
        httpPatch(`https://${domain}/api/suggestions/cityspanstudents/`, {"students": output});
    }

    tmpfail(error, file) {
        console.log(error);
    }

    handleRowClick(studentID) {
        this.setState({
            focusedStudent: studentID,
            showModal: true
        });
    }

    openModal() {
        this.setState({
            showModal: true
        });
    }

    closeModal(studentID) {
        const { unmatchedStudents } = this.state;
        for (let i = 0; i < unmatchedStudents.length; i++) {
            if (unmatchedStudents[i].id === studentID) {
                unmatchedStudents.splice(i, 1);
            }
        }
        this.setState({
            showModal: false,
            unmatchedStudents: unmatchedStudents
        });
    }

    handleSearch(e, studentID) {
        this.setState({
            focusedStudent: studentID,
            showModal: true
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

    updateStudents(studentID) {
        const { unmatchedStudents } = this.state;
        for (let i = 0; i < unmatchedStudents.length; i++) {
            if (unmatchedStudents[i].id === studentID) {
                unmatchedStudents.splice(i, 1);
            }
        }
        this.setState({unmatchedStudents: unmatchedStudents});
    }

    render() {
        const rows = this.state.unmatchedStudents.map(student =>
            (
               {
                   name: `${student.first_name} ${student.last_name}`,
                   id: student.id
               }
           )
        ).sort((a, b) => {
            return a.name.localeCompare(b.name);
        });

        const columns = [
            {
                accessor: 'name',
                label: 'Name',
                priorityLevel: 1,
                position: 1,
                minWidth: 50,
                sortable: true
            },
            { 
                accessor: 'edit',
                label: '',
                priorityLevel: 2,
                position: 5,
                CustomComponent: AssignStudentKeyButton,
                minWidth: 50,
                sortable: false, 
            }
        ];

        return (
            <div className="content">
                <h1>Students Without Student Keys</h1>
                <AssignStudentKeyModal show={this.state.showModal} studentID={this.state.focusedStudent} citySpanStudents={this.state.citySpanStudents} onClose={this.closeModal}/>
                <br/>
                <div style={{display: 'inline-block'}}>
                    <Autocomplete
                        suggestions={this.state.suggestions}
                        handler={this.handleSearch}
                    />
                </div>
                <div style={{float: 'right'}}>
                    <FileUploader extension=".csv" label="Upload Cityspan Student CSV:" upload={this.handleCSVUpload}/>
                </div>
                <ReactCollapsingTable
                        rows = { rows }
                        columns = { columns }
                        column = {'name'}
                        direction = {'descending'}
                        showPagination={ true }
                        callbacks = {{'edit':this.handleRowClick}}
                />
            </div>
        );
    }
}

export default StudentKeys ;