import React from 'react';
import { Route, Switch, withRouter } from 'react-router';
import Layout from './Layout';
import Login from '../views/Login';
import Attendance from '../views/Attendance';
import Students from '../views/Students';
import Volunteers from '../views/Volunteers';
import Reports from '../views/Reports';
import Admin from '../views/Admin';
import NotFound from '../views/NotFound';
import { checkCredentials } from './Helpers';

class Router extends React.Component {

    render() {
        return (
            <Layout show={this.props.location.pathname !== '/'}>
                <Switch>
                    <Route exact path='/' component={Login}/>
                    <Route exact path='/attendance' render={() => checkCredentials(Attendance)}/>
                    <Route path='/students' component={(props) => checkCredentials(Students)}/> {/* Referencing the component this way causes a re-mount every time the NavBar button is clicked, which solves our problem of refreshing the page but costs some performance in the frontend and calls to the database */}
                    <Route path='/reports' render={() => checkCredentials(Reports)}/>
                    <Route path='/volunteers' render={() => checkCredentials(Volunteers)}/>
                    <Route path='/admin' render={() => checkCredentials(Admin)}/>
                    <Route render={() => checkCredentials(NotFound)}/>
                </Switch>
            </Layout>
        );
    }
}

export default withRouter(Router);