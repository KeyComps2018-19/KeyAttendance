import React from 'react';
import ReactCollapsingTable from 'react-collapsing-table';
import { httpGet, httpPatch, domain } from './Helpers';
import StudentFieldCheckbox from './StudentFieldCheckbox';
import { Button, ButtonToolbar } from 'react-bootstrap';
import AddStudentFieldModal from './AddStudentFieldModal';

class EditStudentFields extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fields: [],
            showModal: false
        };

        this.createNewField = this.createNewField.bind(this);
        this.updateCheckbox = this.updateCheckbox.bind(this);
        this.getDataTypeName = this.getDataTypeName.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    async componentDidMount() {
        try {
            const fields = await httpGet(`https://${domain}/api/student_column/`);
            this.setState({
                fields
            });
        } catch (e) {
            console.log(e);
        }
    }

    createNewField(field) {
        return {
            info_id: field.info_id,
            is_showing: field.is_showing,
            quick_add: field.quick_add,
            name: field.name,
            type: field.type,
        };
    }

    updateCheckbox(field=null) {
        let self = this;
        let { fields } = self.state;
        if (field !== null) {
            fields = fields.filter(item => item.info_id !== field.info_id);
            fields.push(this.createNewField(field));
        }
        self.setState({
            fields
        });
    }

    getDataTypeName(type) {
        if (type === 'date') {
            return 'Date';
        } else if (type === 'str') {
            return 'Text';
        } else if (type === 'int') {
            return 'Number';
        }
        return type;
    }

    handleChange = e => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState(prevstate => {
            const newState = { ...prevstate };
            newState[name] = value;
            return newState;
        });
    };

    openModal() {
        this.setState({showModal: true});
    }

    closeModal(field=null) {
        const { fields } = this.state;
        if (field !== null) {
            fields.push(this.createNewField(field));
        }
        this.setState({showModal: false, fields: fields});
    }

    render() {
        const rows = this.state.fields.map(field =>
            (
               {
                   name: field.name,
                   is_showing: field.is_showing,
                   info_id: field.info_id,
                   type: field.type,
                   type_name: this.getDataTypeName(field.type),
                   quick_add: field.quick_add
               }
           )
        ).sort((a, b) => {
            return a.name.localeCompare(b.name);
        });

        const columns = [
            {
                accessor: 'name',
                label: 'Field',
                priorityLevel: 1,
                position: 1,
                minWidth: 100,
                sortable: false
            },
            {
                accessor: 'type_name',
                label: 'Data Type',
                priorityLevel: 2,
                position: 2,
                minWidth: 100,
                sortable: false
            },
            {
                accessor: 'is_showing',
                label: 'Currently in Use',
                priorityLevel: 3,
                position: 3,
                CustomComponent: StudentFieldCheckbox,
                minWidth: 50,
                sortable: false
            },
            {
                accessor: 'quick_add',
                label: 'Show in Quick Add',
                priorityLevel: 4,
                position: 4,
                CustomComponent: StudentFieldCheckbox,
                minWidth: 50,
                sortable: false
            },
        ];
        const tableCallbacks = { is_showing: this.updateCheckbox, quick_add: this.updateCheckbox }
        return (
            <div className="content">
                <h1>Student Profile Fields</h1>
                <ButtonToolbar style={{ float: 'right'}}>
                    <Button onClick={this.openModal}>New Student Profile Field</Button>
                </ButtonToolbar>
                <AddStudentFieldModal show={this.state.showModal}
                    onSubmit={this.closeModal} />
                <ReactCollapsingTable
                        rows = { rows }
                        columns = { columns }
                        column = {'name'}
                        direction = {'descending'}
                        showPagination={ true }
                        callbacks = { tableCallbacks }
                />
            </div>
        );
    }
}

export default EditStudentFields;