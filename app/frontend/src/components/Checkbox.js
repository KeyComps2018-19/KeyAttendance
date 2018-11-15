import React, { Component } from 'react';
import PropTypes from "prop-types";

class Checkbox extends Component {
    state = {
        isChecked: false,
    };

    componentDidMount() {
        this.setState({ isChecked: this.props.checked, attendanceItemID: this.props.attendanceItemID ? this.props.attendanceItemID : 0 })
    }

    // Handles checked/unchecked state of checkbox
    toggleCheckboxChange = () => {
        const { toggleCheckbox, label } = this.props;

        this.setState(({ isChecked }) => (
            {
                isChecked: !isChecked,
            }
        ));
        
        toggleCheckbox(this.state.isChecked, label)
    };

    render() {
        const { label } = this.props;
        const { isChecked } = this.state;

        return (
            <span className="checkbox">
                <label>
                    <input
                        type="checkbox"
                        value={label}
                        checked={isChecked}
                        onChange={this.toggleCheckboxChange}
                    />
                    {label}
                </label>
            </span>
        );
    }
}

Checkbox.propTypes = {
    label: PropTypes.string.isRequired,
    toggleCheckbox: PropTypes.func.isRequired
};

export default Checkbox;