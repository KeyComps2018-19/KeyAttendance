import React from 'react';
import ReactCollapsingTable from 'react-collapsing-table';
import { httpGet, httpPatch, domain, protocol } from './Helpers';
import ShiftDownButton from './ShiftDownButton';
import ShiftUpButton from './ShiftUpButton';
import ShowActivityCheckbox from './ShowActivityCheckbox';
import { Button, ButtonToolbar } from 'react-bootstrap';
import AddActivityModal from './AddActivityModal';

class Activities extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activities: [],
            showModal: false,
            mobile: false,
        };

        this.patchActivityOrder = this.patchActivityOrder.bind(this);
        this.createNewActivity = this.createNewActivity.bind(this);
        this.swapOrder = this.swapOrder.bind(this);
        this.updateCheckbox = this.updateCheckbox.bind(this);
        this.getDataTypeName = this.getDataTypeName.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    async componentDidMount() {
        try {
            const activities = await httpGet(`${protocol}://${domain}/api/activities/`);
            this.setState({
                activities,
                mobile: (window.innerWidth < 768)
            });
        } catch (e) {
            console.log(e);
        }
    }

    createNewActivity(activity) {
        return {
            activity_id: activity.activity_id,
            type: activity.type,
            ordering: activity.ordering,
            is_showing: activity.is_showing,
            name: activity.name
        };
    }

    patchActivityOrder(id1, id2) {
        let { activities } = this.state;
        let self = this;
        let body = { activity_id1: id1, activity_id2: id2 };
        httpPatch(`${protocol}://${domain}/api/activities/`, body)
        .then(function (result) {
            if ('error' in result) {
                result.response.then(function(response) {alert(`Error: ${response.error}`)});
                } else {
                    let activity1 = result[0];
                    let activity2 = result[1];
                    if (activity1 && activity2) {
                        activities = activities.filter(item => item.activity_id !== activity1.activity_id);
                        activities = activities.filter(item => item.activity_id !== activity2.activity_id);
                        activities.push(self.createNewActivity(activity1));
                        activities.push(self.createNewActivity(activity2));
                    }
                    self.setState({
                        activities
                    });
                }
            });
    }

    swapOrder(ordering, direction) {
        let { activities } = this.state;
        if (ordering !== null && direction === 'up' && ordering > 1) {
            let activity1 = activities.find(item => item.ordering === ordering);
            let activity2 = activities.find(item => item.ordering === ordering - 1);
            this.patchActivityOrder(activity1.activity_id, activity2.activity_id);
        } else if (ordering !== null && direction === 'down' && ordering < activities.length) {
            let activity1 = activities.find(item => item.ordering === ordering);
            let activity2 = activities.find(item => item.ordering === ordering + 1);
            this.patchActivityOrder(activity1.activity_id, activity2.activity_id);
        }
    }

    updateCheckbox(activity=null) {
        let self = this;
        let { activities } = self.state;
        if (activity !== null) {
            activities = activities.filter(item => item.activity_id !== activity.activity_id);
            activities.push(this.createNewActivity(activity));
        }
        self.setState({
            activities
        });
    }

    getDataTypeName(type) {
        if (type === 'boolean') {
            return 'Checkbox';
        } else if (type === 'string') {
            return 'Text';
        } else if (type === 'float') {
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

    closeModal(activity=null) {
        const { activities } = this.state;
        if (activity !== null) {
            activities.push(this.createNewActivity(activity));
        }
        this.setState({showModal: false, activities: activities});
    }

    render() {
        const rows = this.state.activities.map(activity =>
            (
               {
                   name: activity.name,
                   ordering: activity.ordering,
                   is_showing: activity.is_showing,
                   activity_id: activity.activity_id,
                   type: activity.type,
                   type_name: this.getDataTypeName(activity.type)
               }
           )
        ).sort((a, b) => {
            return a.ordering - b.ordering;
        });

        const columns = [
            {
                accessor: 'name',
                label: 'Activity',
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
                CustomComponent: ShowActivityCheckbox,
                minWidth: 50,
                sortable: false
            },
            {
                accessor: 'up',
                label: '',
                priorityLevel: 4,
                position: 4,
                CustomComponent: ShiftUpButton,
                minWidth: 100,
                sortable: false
            },
            { 
                accessor: 'down',
                label: '',
                priorityLevel: 5,
                position: 5,
                CustomComponent: ShiftDownButton,
                minWidth: 50,
                sortable: false, 
            }
        ];
        const mobileColumns = [
            {
                accessor: 'name',
                label: 'Activity',
                priorityLevel: 1,
                position: 1,
                minWidth: 100,
                sortable: false
            },
            {
                accessor: 'is_showing',
                label: 'Currently in Use',
                priorityLevel: 3,
                position: 3,
                CustomComponent: ShowActivityCheckbox,
                minWidth: 50,
                sortable: false
            },
        ];
        const tableCallbacks = { up: this.swapOrder, down: this.swapOrder, is_showing: this.updateCheckbox }
        return (
            <div className="content">
                <h1
                style={{textAlign: 'center', fontSize: '25px'}}
                >Programming</h1>
                <br />
                <ButtonToolbar style={{ marginBottom: '10px'}}>
                    <Button onClick={this.openModal}>New Activity</Button>
                </ButtonToolbar>
                <AddActivityModal show={this.state.showModal}
                    lastOrdering={this.state.activities.length}
                    onSubmit={this.closeModal} />
                {!this.state.mobile && <ReactCollapsingTable
                        rows = { rows }
                        columns = { columns }
                        column = {'name'}
                        direction = {'descending'}
                        showPagination={ true }
                        callbacks = { tableCallbacks }
                />}
                {this.state.mobile && <ReactCollapsingTable
                    rows = { rows }
                    columns = { mobileColumns }
                    column = {'name'}
                    direction = {'descending'}
                    showPagination={ true }
                    callbacks = { tableCallbacks }
            />}
            </div>
        );
    }
}

export default Activities;