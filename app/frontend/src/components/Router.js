import React from 'react';
import { Route, Switch, withRouter } from 'react-router';
import Layout from './Layout';
import Login from '../views/Login';
import Attendance from '../views/Attendance';
import Students from '../views/Students';
import Reports from '../views/Reports';
import Admin from '../views/Admin';
import Alerts from '../views/Alerts';
import NotFound from '../views/NotFound';
import { CredentialsContext } from './CredentialsContext';
import { checkCredentials } from './Helpers';

class Router extends React.Component {

    constructor(props) {
        super(props);
        
        this.updateToken = (newToken) => {
            this.setState(state => ({
                token: newToken
            }));
            window.localStorage.setItem("key_credentials", JSON.stringify(newToken));
        };

        const token = JSON.parse(window.localStorage.getItem("key_credentials"));
    
        this.state = {
          token: (token ? token : ''),
          updateToken: this.updateToken,
        };
    }

    render() {
        // This wraps everything in a CredentialsContext.Provider so that any child component can access our token if necessary.
        return (
            <CredentialsContext.Provider value={this.state}>
                <Layout show={this.props.location.pathname !== '/'}>
                    <Switch>
                        <Route exact path='/' component={Login}/>
                        <Route exact path='/attendance' render={() => checkCredentials(Attendance)}/>
                        <Route path='/students' component={(props) => checkCredentials(Students)}/> {/* Referencing the component this way causes a re-mount every time the NavBar button is clicked, which solves our problem of refreshing the page but costs some performance in teh frontend and calls to the database */}
                        <Route path='/reports' render={() => checkCredentials(Reports)}/>
                        <Route path='/admin' render={() => checkCredentials(Admin)}/>
                        <Route path='/alerts' render={() => checkCredentials(Alerts)}/>
                        <Route render={() => checkCredentials(NotFound)}/>
                    </Switch>
                </Layout>
            </CredentialsContext.Provider>
        );
    }
}

export default withRouter(Router);