import React from 'react';
import { FormGroup, ControlLabel, FormControl, Well, Button, Alert } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';

class Login extends React.Component {

    constructor(props) {
		super(props)
		
        this.state = {
			username: "",
            password:"",
            error: false
		}
		
		this.onUsernameChange = this.onUsernameChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.submit = this.submit.bind(this);
    }

    onUsernameChange(e) {
		this.setState({username: e.target.value})
	}

	onPasswordChange(e) {
		this.setState({password: e.target.value})
    }
    
    submit() {
        // Submit username and password to backend
        fetch('http://127.0.0.1:8000/api/login/', {
            method: "POST", 
            headers:{'Content-Type':'application/json'}, 
            body: JSON.stringify({username: this.state.username, password: this.state.password})
        }).then(response => {
            if (response.status >= 400) {
                // If we get a negative response, display some sort of error and wipe the fields.
                this.setState({error: true, username: "", password: ""});
            } else {
                response.json().then(result => {
                    window.localStorage.setItem("key_credentials", result.token);
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
                                    <form>
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
                                        <Button block onClick={this.submit} bsStyle="primary">Continue</Button>
                                        <br/>
                                        {this.state.error && <Alert bsStyle='danger'>Invalid username or password. Please try again.</Alert>}
                                    </form>
                                </Well>
                            </div>
                        </div> 
            );
        }
    }
}

export default Login;