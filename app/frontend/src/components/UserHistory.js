import React from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import ReactCollapsingTable from 'react-collapsing-table';

class UserHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [],
            username: ''
        };
        this.closeHistoryView = this.closeHistoryView.bind(this);
    }

    whiteBorderStyle() {
        return {
            background: 'white',
            borderRadius: 'inherit',
            padding: '10px',
            borderColor: '#e7e7e7',
            borderStyle: 'solid',
            borderWidth: 'thin',
            marginTop: '10px'
        }
    }

    componentDidMount() {
        this.setState({
            history: this.props.history,
            username: this.props.username
        });
    }

    closeHistoryView() {
        this.props.closeHistoryView();
    }

    render() {
        const rows = this.state.history.map(item =>
            (
               {
                   datetime: item.datetime,
                   action: item.action,
                   values: item.values
               }
           )
        ).sort((a, b) => {
            return b.datetime.localeCompare(a.datetime);
        });

        const columns = [
            {
                accessor: 'datetime',
                label: 'Date/Time',
                priorityLevel: 1,
                position: 1,
                minWidth: 100,
                sortable: true
            },
            {
                accessor: 'action',
                label: 'Action',
                priorityLevel: 2,
                position: 2,
                minWidth: 100,
                sortable: true
            },
            {
                accessor: 'values',
                label: 'Values',
                priorityLevel: 3,
                position: 3,
                minWidth: 100,
                sortable: false
            },
        ];

        return (
            <div className='content'>
                <h1 style={{fontSize: '30px', textAlign: 'center'}}>User History: {this.state.username}</h1>
                <br />
                <ButtonToolbar style={{ float: 'left' }}>
                    <Button bsStyle='link' onClick={this.closeHistoryView}>Return to User Management</Button>
                </ButtonToolbar>
                <br/>
                <div style={this.whiteBorderStyle()}>
                <ReactCollapsingTable
                        rows = { rows }
                        columns = { columns }
                        column = {'datetime'}
                        direction = {'descending'}
                        showPagination={ true }
                />
                </div>
            </div>
        );
    }
}

export default UserHistory;