import React from 'react';
import { Button } from 'react-bootstrap';

class UserHistoryButton extends React.Component {
    
    constructor(props) {
        super(props)
        this.state = {
            row: {},
        }
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        this.setState({
            row: this.props.row,
        });
    }

    componentDidUpdate() {
        if (this.props.row['id'] !== this.state.row['id']) {
            this.setState({
                row: this.props.row,
            })
        }
    }

    handleClick() {
        const getUserHistory = () => this.props.CustomFunction(this.state.row['id'], this.state.row['username']);
        getUserHistory();
    }

    render() {
        return(
            <div>
                <Button bsStyle="link" onClick={this.handleClick}>{this.state.row['name'] === undefined || this.state.row['name'] === ' ' ? "[User History]" : this.state.row['name'] }</Button>
            </div>
        )
    }
}

export default UserHistoryButton;
