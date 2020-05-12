import React from 'react';
import Autocomplete from './Autocomplete';
import { Button, ButtonToolbar } from 'react-bootstrap';
import ReactCollapsingTable from 'react-collapsing-table';
import AddUserModal from './AddUserModal';
import EditUserButton from './EditUserButton';
import UserHistoryButton from './UserHistoryButton';
import { getPermissions, httpGet, domain, protocol } from './Helpers';
import UserHistory from './UserHistory';

class Users extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showUserModal: false,
            users: [],
            showingUsers: [],
            role_ids: {},
            role_names: {},
            suggestionsArray: [],
            showingAllUsers: true,
            selectedUserHistory: [],
            selectedUsername: '',
            historyView: false,
            mobile: false,
        };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.updateRow = this.updateRow.bind(this);
        this.getFormattedTime = this.getFormattedTime.bind(this);
        this.handler = this.handler.bind(this);
        this.showAllUsers = this.showAllUsers.bind(this);
        this.getUserHistory = this.getUserHistory.bind(this);
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
        }
    }

    async componentDidMount() {
        try {
            const users = await httpGet(`${protocol}://${domain}/api/users/`);
            let suggestionsArray = this.makeSuggestionsArray(users);
            const roles = await httpGet(`${protocol}://${domain}/api/groups/`);
            const role_ids = {};
            const role_names = {};
            for (var index in roles) {
                role_ids[roles[index].name] = roles[index].id;
                role_names[roles[index].id] = roles[index].name;
            }
            this.setState({
                showingUsers: users,
                users: users,
                role_ids: role_ids, 
                role_names: role_names,
                suggestionsArray: suggestionsArray,
                mobile: (window.innerWidth < 768)
            });
        } catch (e) {
            console.log(e);
        }
    }

    async componentDidUpdate() {
        if (this.props.refreshRoles) {
            // Re-get users - if a role was deleted, users may have been set to inactive
            const users = await httpGet(`${protocol}://${domain}/api/users/`);
            const roles = await httpGet(`${protocol}://${domain}/api/groups/`);
            const role_ids = {};
            const role_names = {};
            for (var index in roles) {
                role_ids[roles[index].name] = roles[index].id;
                role_names[roles[index].id] = roles[index].name;
            }
            this.setState({
                showingUsers: users,
                users: users,
                role_ids: role_ids, 
                role_names: role_names,
                showAllUsers: true
            });
            this.props.toggleRefreshRoles(false);
        }
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
          } else {
            lastHolder1 = suggestions[object]['last_name'];
            lastHolder2 = "";
          }
          array.push({
            firstName: suggestions[object]['first_name'],
            lastName1: lastHolder1,
            lastName2: lastHolder2,
            username: suggestions[object]['username'],
            id: suggestions[object]['id']
          });
        }
        return array;
      }

    handler(e, userId) {
        let showingUsers = [];
        if (userId !== null) {
            showingUsers.push(this.state.users.find(item => item['id'] === parseInt(userId)));
        }
        this.setState({
            showingUsers: showingUsers,
            showingAllUsers: false
        });
    }

    showAllUsers() {
        const { users } = this.state;
        this.setState({
            showingUsers: users,
            showingAllUsers: true
        });
    }

    openModal() {
        this.setState({showUserModal: true});
    }

    closeModal(user=null) {
        const { suggestionsArray, users } = this.state;
        let showingUsers = [];
        if (user !== null) {
            let newUser = {
                'id': user.id, 
                'username': user.username, 
                'first_name': user.first_name,
                'last_name': user.last_name,
                'groups': user.groups, 
                'last_login': user.last_login,
                'is_active': user.is_active
            };
            let last1;
            let last2;
            if (user.last_name.includes(" ")) {
                let lastNames = user.last_name.split(" ");
                last1 = lastNames[0];
                last2 = lastNames[1];
            }
            else {
                last1 = user.last_name;
                last2 = "";
            }
            suggestionsArray.push({
                firstName: user.first_name,
                lastName1: last1,
                lastName2: last2,
                username: user.username,
                id: user.id
            });
            users.push(newUser);
            showingUsers.push(newUser);
            this.setState({showUserModal: false, users: users, showingUsers: showingUsers, 
                showingAllUsers: false, suggestionsArray: suggestionsArray});
        } else {
            this.setState({showUserModal: false});
        }
    }

    checkmark(boolean) {
        if (boolean) {
            return "&#10003;";
        } else {
            return "";
        }
    }

    getFormattedTime(dateString) {
        if (dateString === null || dateString.length === 0) {
            return '';
        }
        let splitDateTime = dateString.split("T")
        let date = splitDateTime[0]
        let time = splitDateTime[1].split(".")[0]
        let splitTime = time.split(":")
        let hours = parseInt(splitTime[0])
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours === 0 ? 12 : hours
        var formattedTime = date + ' ' + hours + ':' + splitTime[1] + ' ' + ampm
        return formattedTime;
    }

    getUserRoleNames(groups) {
        const group_names = [];
        for (var index in groups) {
            group_names.push(this.state.role_names[groups[index]]);
        }
        return group_names.join(', ');
    }

    updateRow(user, id = null) {
        let { users, suggestionsArray } = this.state;
        let showingUsers = [];
        let showingAllUsers = false;
        if (id !== null) {
            users = users.filter(item => item.id !== id);
            suggestionsArray = suggestionsArray.filter(item => item.id !== id);
            showingAllUsers = true;
            showingUsers = users;
        } else {
            users = users.filter(item => item.id !== user.id);
            suggestionsArray = suggestionsArray.filter(item => item.id !== user.id);
            let newUser = {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'groups': user.groups,
                'last_login': user.last_login,
                'is_active': user.is_active
            };
            let last1;
            let last2;
            if (user.last_name.includes(" ")) {
                let lastNames = user.last_name.split(" ");
                last1 = lastNames[0];
                last2 = lastNames[1];
            }
            else {
                last1 = user.last_name;
                last2 = "";
            }
            suggestionsArray.push({
                firstName: user.first_name,
                lastName1: last1,
                lastName2: last2,
                username: user.username,
                id: user.id
            });
            users.push(newUser);
            showingUsers.push(newUser)
        }
        this.setState({ users: users, showingUsers: showingUsers, showingAllUsers: showingAllUsers, suggestionsArray: suggestionsArray });
    }

    getUserHistory(userId, username) {
        const self = this;
        httpGet(`${protocol}://${domain}/api/history/?user_id=${userId}`)
            .then(function (result) {
                if ('error' in result) {
                    alert("Error: Unknown server error getting user history.")
                } else {
                    self.setState({ selectedUserHistory: result, historyView: true, selectedUsername: username});
                }
            });
    }

    closeHistoryView() {
        this.setState({ historyView: false });
    }

    render() {
        const rows = this.state.showingUsers.map(user =>
            (
               {
                   username: user.username,
                   first_name: user.first_name,
                   last_name: user.last_name,
                   name: user.first_name + " " + user.last_name,
                   roles: this.getUserRoleNames(user.groups),
                   groups: user.groups,
                   lastLogin: this.getFormattedTime(user.last_login),
                   isActive: this.checkmark(user.is_active),
                   id: user.id,
                   is_active: user.is_active,
                   role_ids: this.state.role_ids,
               }
           )
        ).sort((a, b) => {
            return a.username.localeCompare(b.username);
        });
        const columns = [
            {
                accessor: 'name',
                label: 'Name',
                priorityLevel: 1,
                position: 1,
                minWidth: 100,
                sortable: true
            },
            {
                accessor: 'username',
                label: 'Username',
                priorityLevel: 2,
                position: 2,
                minWidth: 100,
                sortable: true
            },
            {
                accessor: 'lastLogin',
                label: 'Last Login',
                priorityLevel: 3,
                position: 3,
                minWidth: 100,
                sortable: true
            },
            {
                accessor: 'roles',
                label: 'User Roles',
                priorityLevel: 4,
                position: 4,
                sortable: true,
                minWidth: 30
            },
            { 
                accessor: 'isActive',
                label: 'Active',
                priorityLevel: 5,
                position: 5,
                minWidth: 20,
                sortable: true, 
            },
            { 
                accessor: 'edit',
                label: '',
                priorityLevel: 6,
                position: 6,
                CustomComponent: EditUserButton,
                minWidth: 50,
                sortable: false, 
            },
            {
                accessor: 'history',
                label: '',
                priorityLevel: 7,
                position: 7,
                CustomComponent: UserHistoryButton,
                minWidth: 50,
                sortable: false,
            }
        ];
        const mobileColumns = [
            {
                accessor: 'username',
                label: 'Username',
                priorityLevel: 2,
                position: 2,
                minWidth: 100,
                sortable: true
            },
            {
                accessor: 'roles',
                label: 'User Roles',
                priorityLevel: 4,
                position: 4,
                sortable: true,
                minWidth: 30
            },
            { 
                accessor: 'edit',
                label: '',
                priorityLevel: 6,
                position: 6,
                CustomComponent: EditUserButton,
                minWidth: 50,
                sortable: false, 
            },
        ];

        const tableCallbacks = { edit: this.updateRow, history: this.getUserHistory }
        if (this.state.historyView) {
            return (
                <UserHistory closeHistoryView={this.closeHistoryView} history={this.state.selectedUserHistory} username={this.state.selectedUsername}/>
            );
        }
        const permissions = getPermissions();
        let buttonToolbar;
        if (permissions.indexOf('add_user') >= 0) {
            buttonToolbar = <ButtonToolbar style={{ float: 'right' }}>
                <Button className={this.state.showingAllUsers ? 'hidden' : ''} bsStyle='link' onClick={this.showAllUsers}>Show All Users</Button>
                
                {!this.state.mobile && <Button onClick={this.openModal}>New User</Button>}
                {this.state.mobile && <Button style={{marginTop: '25px'}} onClick={this.openModal}>New User</Button>}
            </ButtonToolbar>
        } else {
            buttonToolbar = <ButtonToolbar style={{ float: 'right' }}>
                <Button className={this.state.showingAllUsers ? 'hidden' : ''} bsStyle='link' onClick={this.showAllUsers}>Show All Users</Button>
            </ButtonToolbar>
        }
        return (
            <div className='content' >
                <AddUserModal role_ids={this.state.role_ids}
                    show={this.state.showUserModal}
                    onSubmit={this.closeModal} />
                <h1
                style={{textAlign: 'center', fontSize: '25px'}}
                >User Management</h1>
                <br />
                <div style = {{margin: '10px'}}>
                {buttonToolbar}
                <Autocomplete
                    hasUsername={true}
                    suggestions={this.state.suggestionsArray}
                    handler={this.handler}
                />
                <br/>
                <div
                style = {this.whiteBorderStyle()}>
                {!this.state.mobile &&
                    <ReactCollapsingTable
                    rows = { rows }
                    columns = { columns }
                    column = {'username'}
                    direction = {'descending'}
                    showPagination={ true }
                    callbacks={ tableCallbacks }
            />}
            {this.state.mobile &&
                <ReactCollapsingTable
                rows = { rows }
                columns = { mobileColumns }
                column = {'username'}
                direction = {'descending'}
                showPagination={ true }
                callbacks={ tableCallbacks }
        />}
        </div>
            </div>
            </div>
        );
    }
}

export default Users;