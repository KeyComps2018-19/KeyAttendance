import React, { Component } from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { getPermissions } from './Helpers';

class Layout extends Component {

  constructor(props) {
    super(props);
    this.state ={
        activeItem: 'home'
      }
  }

  handleItemClick = (name) => () => {
    this.props.history.push(`/${name}`);
  }

  logout = () => () => {
    window.localStorage.removeItem("key_credentials");
    window.localStorage.removeItem("permissions")
    this.props.history.push(`/`)
  }

  render() {
    if (!this.props.show) { return this.props.children }
    const permissions = getPermissions();
    let nav = [];
    if (permissions.indexOf('view_attendanceitems') >= 0) {
      nav.push(<NavItem key={0} onClick={this.handleItemClick('attendance')}>Attendance</NavItem>)
    }
    if (permissions.indexOf('view_students') >= 0) {
      nav.push(<NavItem key={1} onClick={this.handleItemClick('students')}>Students</NavItem>)
    }
    if (permissions.indexOf('view_group') >= 0 || permissions.indexOf('view_user') >= 0 
      || permissions.indexOf('change_activity') >= 0 || permissions.indexOf('add_activity') >= 0
      || permissions.indexOf('change_studentcolumn') >= 0 || permissions.indexOf('add_studentcolumn') >= 0) {
      nav.push(<NavItem key={2} onClick={this.handleItemClick('admin')}>Admin</NavItem>)
    }
    if (permissions.indexOf('view_reports') >= 0) {
      nav.push(<NavItem key={3} onClick={this.handleItemClick('reports')}>Reports</NavItem>)
    }
    if ((permissions.indexOf('view_volunteers') >= 0) && (permissions.indexOf('view_volunteerattendanceitems') >= 0)){
      nav.push(<NavItem key={4} onClick={this.handleItemClick('volunteers')}>Volunteers</NavItem>)
    }
    const navItems = <Nav>{nav}</Nav>
    return (
      <div>
        <Navbar>
            <Navbar.Header>
                <Navbar.Brand onClick={this.handleItemClick('attendance')}>
                    Key
                </Navbar.Brand>
                <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
              {navItems}
              <Nav pullRight>
                <NavItem onClick={this.logout()}>Logout</NavItem>
              </Nav>
            </Navbar.Collapse>
        </Navbar>
        {this.props.children}
      </div>
    );
  }
}

Layout.propTypes = {
  history: PropTypes.shape({
      push: PropTypes.func.isRequired,
  }),
};

export default withRouter(Layout);
