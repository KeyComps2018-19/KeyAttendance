import React from 'react';
import Autocomplete from './Autocomplete';
import { Button, ButtonToolbar } from 'react-bootstrap';
import ReactCollapsingTable from 'react-collapsing-table';
import AddUserModal from './AddUserModal';
import EditUserButton from './EditUserButton';
import UserHistoryButton from './UserHistoryButton';
import { httpGet, domain } from './Helpers';
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
            historyView: false
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

    async componentDidMount() {
        try {
            const users = await httpGet(`https://${domain}/api/users/`);
            let suggestionsArray = this.makeSuggestionsArray(users);
            const roles = await httpGet(`https://${domain}/api/groups/`);
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
                suggestionsArray: suggestionsArray
            });
        } catch (e) {
            console.log(e);
        }
    }

    async componentDidUpdate() {
        if (this.props.refreshRoles) {
            const roles = await httpGet(`https://${domain}/api/groups/`);
            const role_ids = {};
            const role_names = {};
            for (var index in roles) {
                role_ids[roles[index].name] = roles[index].id;
                role_names[roles[index].id] = roles[index].name;
            }
            this.setState({
                role_ids: role_ids, 
                role_names: role_names,
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
        const { users } = this.state;
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
            users.push(newUser);
            showingUsers.push(newUser);
        }
        this.setState({showUserModal: false, users: users, showingUsers: showingUsers, showingAllUsers: false});
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
        let { users } = this.state;
        let showingUsers = [];
        let showingAllUsers = false;
        if (id !== null) {
            users = users.filter(item => item.id !== id);
            showingAllUsers = true;
            showingUsers = users;
        } else {
            users = users.filter(item => item.id !== user.id);
            let newUser = {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'groups': user.groups,
                'last_login': user.last_login,
                'is_active': user.is_active
            };
            users.push(newUser);
            showingUsers.push(newUser)
        }
        this.setState({ users: users });
        this.setState({ users: users, showingUsers: showingUsers, showingAllUsers: showingAllUsers });
    }

    getUserHistory(userId, username) {
        const self = this;
        httpGet(`https://${domain}/api/history/?user_id=${userId}`)
            .then(function (result) {
                if ('error' in result) {
                    console.log(result);
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
                CustomComponent: UserHistoryButton,
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
            }
        ];
        const tableCallbacks = { edit: this.updateRow, name: this.getUserHistory }
        if (this.state.historyView) {
            return (
                <UserHistory closeHistoryView={this.closeHistoryView} history={this.state.selectedUserHistory} username={this.state.selectedUsername}/>
            );
        }
        return (
            <div className='content'>
                <AddUserModal role_ids={this.state.role_ids}
                    show={this.state.showUserModal}
                    onSubmit={this.closeModal} />
                <h1>User Management</h1>
                <br />
                <ButtonToolbar style={{ float: 'right' }}>
                    <Button className={this.state.showingAllUsers ? 'hidden' : ''} bsStyle='link' onClick={this.showAllUsers}>Show All Users</Button>
                    <Button onClick={this.openModal}>New User</Button>
                </ButtonToolbar>
                <Autocomplete
                    hasUsername={true}
                    suggestions={this.state.suggestionsArray}
                    handler={this.handler}
                />
                <br/>
                <ReactCollapsingTable
                        rows = { rows }
                        columns = { columns }
                        column = {'username'}
                        direction = {'descending'}
                        showPagination={ true }
                        callbacks={ tableCallbacks }
                />
            </div>
        );
    }
}

export default Users;