import React from 'react';
import { FormGroup, ControlLabel, FormControl, Well, Button } from 'react-bootstrap';
import { CredentialsContext } from '../components/CredentialsContext';
import { Redirect } from 'react-router-dom';

class Login extends React.Component {

    constructor(props) {
		super(props)
		
        this.state = {
			username: "",
			password:"",
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
    
    submit(updateFunction) {
        updateFunction('yeet');
        this.props.history.push(`/attendance`);
    }

    render() {
        const centerStyle={'textAlign':'center'}

        return (
            <CredentialsContext.Consumer>
                {({token, updateToken}) => {
                    if (token !== '') {
                        // TODO: Check if the token is still valid.
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
                                            <Button block onClick={() => {this.submit(updateToken)}} bsStyle="primary">Continue</Button>
                                        </form>
                                    </Well>
                                </div>
                            </div> 
                        );
                    }
                }}  
            </CredentialsContext.Consumer>
        );
    }
}

export default Login;