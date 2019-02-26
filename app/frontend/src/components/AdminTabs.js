import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import Users from './Users';
import Roles from './Roles';
import StudentKeys from './StudentKeys';
import Activities from './Activities';
import EditStudentFields from './EditStudentFields';

class AdminTabs extends React.Component {
    constructor(props, context) {
      super(props, context);
  
      this.handleSelect = this.handleSelect.bind(this);
      this.toggleRefreshRoles = this.toggleRefreshRoles.bind(this);
      this.state = {
        refreshRoles: false,
        key: 1
      };
    }
  
    handleSelect(key) {
      this.setState({ key });
    }

    toggleRefreshRoles(boolean) {
      this.setState({ refreshRoles: boolean });
    }
  
    render() {
      return (
        <Tabs
          activeKey={this.state.key}
          onSelect={this.handleSelect}
          id="admin-tabs"
        >
          <Tab eventKey={1} title="User Management">
            <Users toggleRefreshRoles={this.toggleRefreshRoles} refreshRoles={this.state.refreshRoles}/>
          </Tab>
          <Tab eventKey={2} title="User Roles">
            <Roles toggleRefreshRoles={this.toggleRefreshRoles}/>
          </Tab>
          <Tab eventKey={3} title="Attendance Activities">
            <Activities />
          </Tab>
          <Tab eventKey={4} title="Student Profile Fields">
            <EditStudentFields />
          </Tab>
          <Tab eventKey={5} title="Student Key Management">
            <StudentKeys/>
          </Tab>
        </Tabs>
      );
    }
  }
  
export default AdminTabs;