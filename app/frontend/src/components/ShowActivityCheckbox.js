import React, { Component } from 'react';
import { httpPatch, domain } from './Helpers';

class ShowActivityCheckbox extends Component {

    constructor(props) {
        super(props)
        this.state = {
            row: {},
            checked: false
        }
        this.toggleCheckbox = this.toggleCheckbox.bind(this);
    }

    componentDidMount() {
        this.setState({ row: this.props.row, checked: this.props.row.is_showing })
    }

    componentDidUpdate() {
        if (this.props.row.is_showing !== this.state.checked) {
            this.setState({ checked: this.props.row.is_showing })
        }
    }

    toggleCheckbox = () => {
        let self = this;
        let { row } = self.state;
        let body = {activity_id: row.activity_id, is_showing: !self.state.checked};
        httpPatch(`https://${domain}/api/activities/`, body)
            .then(function (response) {
                if ('error' in response) {
                    console.log(response);
                } else {
                    const updateCheckbox = () => self.props.CustomFunction(response);
                    updateCheckbox();
                }
            });
    };

    render() {
        return (
            <span className="checkbox">
                <label>
                    <input
                        type="checkbox"
                        checked={this.state.checked}
                        onChange={this.toggleCheckbox}
                    />
                </label>
            </span>
        );
    }
}

export default ShowActivityCheckbox;
