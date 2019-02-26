import React from 'react';
import { Alert, Button, ControlLabel, FormControl, FormGroup, Well } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { domain } from '../components/Helpers';

class Login extends React.Component {

    constructor(props) {
		super(props)
		
        this.state = {
			username: "",
            password:"",
            error: false,
            firstLogin: true
		}
		
		this.onUsernameChange = this.onUsernameChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        if (localStorage.getItem('loggedIn') != null) {
            this.setState({firstLogin: false});
        }
    }

    onUsernameChange(e) {
		this.setState({username: e.target.value})
	}

	onPasswordChange(e) {
		this.setState({password: e.target.value})
    }

    submit(e) {
        e.preventDefault();
        // Submit username and password to backend
        fetch(`https://${domain}/api-token-auth/`, {
            method: "POST", 
            headers:{'Content-Type':'application/json'}, 
            body: JSON.stringify({username: this.state.username, password: this.state.password})
        }).then(response => {
            if (response.status >= 400) {
                // If we get a negative response, display some sort of error and wipe the fields.
                this.setState({error: true, username: "", password: ""});
            } else {
                response.json().then(result => {
                    // Store token in browser
                    window.localStorage.setItem("key_credentials", result.token);
                    // Store permissions in browser
                    window.localStorage.setItem("permissions", result.permissions);
                    // Flag that we've logged in before
                    window.localStorage.setItem("loggedIn", 'true');
                    this.props.history.push(`/attendance`);
                })
            }
        });
    }

    render() {
        const centerStyle={'textAlign':'center'}
        const token = window.localStorage.getItem("key_credentials");
        if (token !== null) {
            return (<Redirect to='/attendance'/>);
        } else {
            return (
                <div className='center'>
                    <div className='login-container'>
                        <Well>
                            <h2 style={centerStyle}>Key Attendance</h2>
                                <h4 style={centerStyle}>Sign In</h4>
                                    <form onSubmit={e => this.submit(e)}>
                                        <FormGroup>
                                            <ControlLabel>Username</ControlLabel>
                                            <FormControl
                                                type="text"
                                                value={this.state.username}
                                                placeholder="Username"
                                                onChange={this.onUsernameChange}
                                            />
                                            <br/>
                                            <ControlLabel>Password</ControlLabel>
                                            <FormControl
                                                type="password"
                                                value={this.state.password}
                                                placeholder='Password'
                                                 onChange={this.onPasswordChange}
                                             />
                                        </FormGroup>
                                        <Button block type="submit" bsStyle="primary">Continue</Button>
                                        <br/>
                                        {this.state.error && <Alert bsStyle='danger'>Invalid username or password. Please try again.</Alert>}
                                        {!this.state.firstLogin && <Alert bsStyle='info'>You have been logged out.</Alert>}
                                    </form>
                                </Well>
                            </div>
                        </div> 
            );
        }
    }
}

export default Login;