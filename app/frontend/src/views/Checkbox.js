import React, { Component } from 'react';
import PropTypes from "prop-types";


class Checkbox extends Component {
    state = {
        isChecked: false,
    };

    componentDidMount() {
        this.setState({ isChecked: this.props.checked })
    }

    toggleCheckboxChange = () => {
        const { handleCheckboxChange, label } = this.props;

        this.setState(({ isChecked }) => (
            {
                isChecked: !isChecked,
            }
        ));

        handleCheckboxChange(label);
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
    handleCheckboxChange: PropTypes.func.isRequired,
};

export default Checkbox;