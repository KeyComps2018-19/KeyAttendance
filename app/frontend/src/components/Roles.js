import React from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import AddRoleModal from './AddRoleModal';
import EditRoleButton from './EditRoleButton';
import ReactCollapsingTable from 'react-collapsing-table';
import { httpGet, domain } from './Helpers';


class Roles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            roles: [],
            permissions_list: {},
            permission_ids: {},
        };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.deleteRole = this.deleteRole.bind(this);
    }

    async componentDidMount() {
        try {
            const roles = await httpGet(`https://${domain}/api/groups/`);
            const permissions_list = await httpGet(`https://${domain}/api/permissions/`);
            let permission_ids = {};
            for (var index in permissions_list) {
                permission_ids[permissions_list[index].name] = permissions_list[index].id;
            }
            this.setState({
                roles: roles,
                permissions_list: permissions_list,
                permission_ids: permission_ids,
            });
        } catch (e) {
            console.log(e);
        }
    }

    openModal() {
        this.setState({showModal: true});
    }

    closeModal(role=null) {
        const { roles } = this.state;
        if (role !== null) {
            roles.push({
                'id': role.id, 'name': role.name, 'permissions': role.permissions
            });
            this.props.toggleRefreshRoles(true);
        }
        this.setState({showModal: false, roles: roles});
    }

    deleteRole(id = null) {
        let { roles } = this.state;
        if (id !== null) {
            roles = roles.filter(item => item.id !== id);
            this.props.toggleRefreshRoles(true);
        }
        this.setState({ roles: roles });
    }

    render() {
        const rows = this.state.roles.map(role =>
            (
               {
                   name: role.name,
                   permissions: role.permissions,
                   id: role.id,
                   permission_ids: this.state.permission_ids
               }
           )
        ).sort((a, b) => {
            return a.name.localeCompare(b.name);
        });

        const columns = [
            {
                accessor: 'name',
                label: 'Role',
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
                CustomComponent: EditRoleButton,
                minWidth: 50,
                sortable: false, 
            }
        ];
        const tableCallbacks = { edit: this.deleteRole }
        return (
            <div className="content">
                <h1>User Roles</h1>
                <ButtonToolbar style={{ float: 'right' }}>
                    <Button onClick={this.openModal}>New User Role</Button>
                </ButtonToolbar>
                <AddRoleModal permission_ids={this.state.permission_ids}
                    show={this.state.showModal}
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

export default Roles;