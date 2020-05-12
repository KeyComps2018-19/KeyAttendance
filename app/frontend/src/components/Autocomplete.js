/*
 *  https://alligator.io/react/react-autocomplete/
 */

import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import "./Autocomplete.css"
import { Form, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

class Autocomplete extends Component {
  static propTypes = {
    suggestions: PropTypes.instanceOf(Array),
    handler: PropTypes.instanceOf(Function)
  };

  static defaultProps = {
    suggestions: [],
    handler: null
  };

  constructor(props) {
    super(props);

    this.state = {
      // The active selection's index
      activeSuggestion: 0,
      // The suggestions that match the user's input
      filteredSuggestions: [],
      // Whether or not the suggestion list is shown
      showSuggestions: false,
      // What the user has entered
      userInput: ""
    };
  }

  // Event fired when the input value is changed
  onChange = e => {
    const { suggestions } = this.props;
    const userInput = e.currentTarget.value;

    // Filter our suggestions that don't contain the user's input
    const filteredSuggestions = suggestions.filter(
      suggestion =>
      (
        (suggestion.firstName.toLowerCase().startsWith(userInput.toLowerCase()) === true ||
          suggestion.lastName1.toLowerCase().startsWith(userInput.toLowerCase()) === true ||
          suggestion.lastName2.toLowerCase().startsWith(userInput.toLowerCase()) === true ||
          (suggestion.firstName.toLowerCase() + " " +
            suggestion.lastName1.toLowerCase() + " ").startsWith(userInput.toLowerCase()) === true ||
            (suggestion.username && suggestion.username.toLowerCase().startsWith(userInput.toLowerCase()) === true)
            ) || (suggestion.studentKey && suggestion.studentKey.startsWith(userInput) === true )
            )
    );

    // Update the user input and filtered suggestions, reset the active
    // suggestion and make sure the suggestions are shown
    this.setState({
      activeSuggestion: 0,
      filteredSuggestions,
      showSuggestions: true,
      userInput: e.currentTarget.value,
    });
  };

  // Event fired when the user clicks on a suggestion
  onClick = e => {
    // Update the user input and reset the rest of the state
    this.setState({
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: e.currentTarget.innerText
    });
    this.props.handler(e, e._targetInst.key);
    this.setState({ userInput: "" });
  };

  // Prevents React's form from overriding our code when hitting enter
  handleSubmit = e => {
    e.preventDefault();
  }

  // Event fired when the user presses a key down
  onKeyDown = e => {
    const { activeSuggestion, filteredSuggestions } = this.state;

    // User pressed the enter key, update the input and close the
    // suggestions
    if (e.keyCode === 13 && this.state.activeSuggestion === -1) {
      this.props.handler(e, this.state.selectedId)
      this.setState({ userInput: "" });
    }
    else if (e.keyCode === 13) {
      if (typeof filteredSuggestions[activeSuggestion] === 'object') {
        var fullName = (filteredSuggestions[activeSuggestion].firstName + " " +
          filteredSuggestions[activeSuggestion].lastName1)
        this.setState({
          activeSuggestion: -1,
          showSuggestions: false,
          userInput: fullName,
          selectedId: filteredSuggestions[activeSuggestion].id
        });
      }

    }
    // User pressed the up arrow, decrement the index
    else if (e.keyCode === 38) {
      if (activeSuggestion === 0) {
        return;
      }

      this.setState({ activeSuggestion: activeSuggestion - 1 });
      this.scrollUpHandler();
    }
    // User pressed the down arrow, increment the index
    else if (e.keyCode === 40) {
      if (activeSuggestion === filteredSuggestions.length - 1) {  // Improvements should be made
        return;
      }

      this.setState({ activeSuggestion: activeSuggestion + 1 });
      this.scrollDownHandler();
    }
  };

  //temp fix for autoscroll when user presss down arrow through dropdown menu
  scrollDownHandler() {
    var dropdown = document.getElementsByClassName("suggestions");
    var activeItem = document.getElementsByClassName("suggestion-active");
    var itemHeight = activeItem[0].getBoundingClientRect().height;
    var scrollPos = dropdown[0].scrollTop;
    var dropdownHeight = dropdown[0].getBoundingClientRect().height;
    var halfway = Math.round(Math.round(dropdownHeight / itemHeight) / 2) * itemHeight;
    if (((this.state.activeSuggestion + 2) * itemHeight) >= scrollPos + dropdownHeight) {
      dropdown[0].scrollTop = dropdown[0].scrollTop + halfway;
    }
  }

  //temp fix for autoscroll when user presss up arrow through dropdown menu
  scrollUpHandler() {
    var dropdown = document.getElementsByClassName("suggestions");
    var activeItem = document.getElementsByClassName("suggestion-active");
    var itemHeight = activeItem[0].getBoundingClientRect().height;
    var scrollPos = dropdown[0].scrollTop;
    var dropdownHeight = dropdown[0].getBoundingClientRect().height;
    var halfway = Math.round(Math.round(dropdownHeight / itemHeight) / 2) * itemHeight;
    if (((this.state.activeSuggestion - 1) * itemHeight) <= scrollPos) {
      dropdown[0].scrollTop = dropdown[0].scrollTop - halfway;
    }
  }

  render() {
    const {
      onChange,
      onClick,
      onKeyDown,
      handleSubmit,
      state: {
        activeSuggestion,
        filteredSuggestions,
        showSuggestions,
        userInput
      }
    } = this;

    let suggestionsListComponent;

    if (showSuggestions && userInput) {
      if (filteredSuggestions.length) {
        suggestionsListComponent = (
          <div className="suggestions">
            {filteredSuggestions.map((suggestion, index) => {
              let className;

              // Flag the active suggestion with a class
              if (index === activeSuggestion) {
                className = "suggestion-active";
              }
              let username = '';
              if (suggestion.username) {
                username = ' | ' + suggestion.username;
              }
              let studentKey= '';
              if (suggestion.studentKey){
                studentKey=" | " + suggestion.studentKey;
              }
              return (
                <p
                  className={className}
                  key={suggestion.id}
                  onClick={onClick}
                >
                {suggestion.firstName} {suggestion.lastName1} {suggestion.lastName2} {username} 
                </p>
              );
            })}
          </div>
        );
      } else {
        suggestionsListComponent = (
          <div className="no-suggestions">
            <em>No suggestions.</em>
          </div>
        );
      }
    }

    return (
      <Fragment>
        <Form inline
          onSubmit={handleSubmit}>
          <FormGroup
            controlId="formInlineName"
          >
            <ControlLabel>{this.props.label === undefined ? 'Search:' : this.props.label}</ControlLabel>{' '}
            <FormControl
              autoComplete="off"
              type="text"
              value={userInput}
              onChange={onChange}
              onKeyDown={onKeyDown}
              placeholder={this.props.hasUsername ? 'Name or Username' : 'Name'}
            />
            {suggestionsListComponent}
          </FormGroup>{' '}
        </Form>
      </Fragment>
    );
  }
}

export default Autocomplete;
