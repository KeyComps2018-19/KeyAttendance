import React, { Component } from 'react';
import Autocomplete from '../components/Autocomplete';
import { Label } from 'react-bootstrap';

class Students extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mode: 'search',
      studentsJson: {},
      suggestionsArray: [],
      id: null,
      profileData: {}
    };
    this.edit = this.edit.bind(this);
    this.handler = this.handler.bind(this);
  }

  async componentDidMount() {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/students');
      var studentsJson = await res.json();
      var suggestionsArray = this.makeSuggestionsArray(studentsJson);
      this.setState(function (previousState, currentProps) {
        return {
          mode: 'search',
          studentsJson: studentsJson,
          suggestionsArray: suggestionsArray,
          id: null,
          profileData: {}
        };
      });
    } catch (e) {
      console.log(e);
    }
  }

  makeSuggestionsArray(suggestions) {
    var array = [];
    var lastHolder1;
    var lastHolder2;
    var tempArray;
    for (var object in suggestions) {
      if (suggestions[object]['last_name'].includes(" ")) {
        tempArray = suggestions[object]['last_name'].split(" ");
        lastHolder1 = tempArray[0];
        lastHolder2 = tempArray[1];
      }
      else {
        lastHolder1 = suggestions[object]['last_name'];
        lastHolder2 = "";
      }
      array.push({
        firstName: suggestions[object]['first_name'],
        lastName1: lastHolder1,
        lastName2: lastHolder2,
        id: suggestions[object]['id']
      });
    }
    return array;
  }

  handler(e, studentId) {
    var state = {
      mode: 'display',
      id: studentId
    };
    this.getStudentProfile(state);
  }

  async getStudentProfile(state) {
    try {
      const studentProfileData = await fetch('http://127.0.0.1:8000/api/students?id=' + state.id);
      const studentProfileJson = await studentProfileData.json();
      state.profileData = studentProfileJson;
      this.setState(function (previousState, currentProps) {
        return state;
      });
    }
    catch (e) {
      console.log(e);
    }
  }
  
  edit() {
    this.setState({mode: 'edit'})
  }
  
  handleChange(evt) {
    console.log(this.state.profileData);
    this.setState({
      first_name: evt.target.value
    });
    console.log(this.state.profileData);
  }
  
  handleSubmit(evt) {
    var object = {};
    console.log(this);
    //object
    this.setState({
      first_name: evt.target.value
    });
    
  }

  render() {
    if (this.state.mode === 'search') {
      return (
        <div className='content'>
          <h1> Key Students </h1>
			  	<div className='container-fluid no-padding'>
					<div className='row justify-content-start'>
				  		<div className='col-md-12 to-front top-bottom-padding'>
							<Autocomplete
								suggestions={this.state.suggestionsArray}
								handler={this.handler}
						  	/>
		  				</div>
		  			</div>
		  		</div>  
        </div>
      );
    } else if (this.state.mode === 'display') {
      return (
        <div className='content'>
          <h1> Student Profile </h1>
		  <div className='container-fluid no-padding'>
  			<div className='row justify-content-start'>
			  <div className='col-md-4 to-front top-bottom-padding'>
				  <Autocomplete
					suggestions={this.state.suggestionsArray}
					handler={this.handler}
				  />
			  </div>
          <div className='col-md-8 top-bottom-padding'>
				Name: {this.state.profileData.first_name} {this.state.profileData.last_name} <br/>
                ID: <Label>N/A</Label> <br/>
                Birthday: xx/xx/xxxx <br/>
                Nickname: N/A <br/>
                Gender: N/A <br/>
                First Attendance: {this.state.profileData.first_attendance} <br/>
                Number of Visits: {this.state.profileData.number_visits} <br/>
                <button onClick={this.edit}>
                  Edit
                </button>
			  </div>
        	</div>
		  </div>
		</div>
      );
    }
    else if (this.state.mode === 'edit') {
      return (
        <div className='content'>
          <h1> Student Profile </h1>
		  <div className='container-fluid no-padding'>
  			<div className='row justify-content-start'>
			  <div className='col-md-4 to-front top-bottom-padding'>
				  <Autocomplete
					suggestions={this.state.suggestionsArray}
					handler={this.handler}
				  />
			  </div>
          <div className='col-md-8 top-bottom-padding'>
              <form className='col-md-8 top-bottom-padding' onSubmit={this.handleSubmit}>
              First Name: <input type="text" defaultValue={this.state.profileData.first_name} onChange={evt => this.handleChange(evt)} /> <br/>
              Last Name: <input type="text" defaultValue={this.state.profileData.last_name} onChange={this.handleChange} /> <br/>
              ID: <input type="text" defaultValue="N/A" onChange={this.handleChange} /> <br/>
              Birthday: <input type="text" defaultValue="xx/xx/xxxx" onChange={this.handleChange} /> <br/>
              Nickname: <input type="text" defaultValue="N/A" onChange={this.handleChange} /> <br/>
              Gender: <input type="text" defaultValue="N/A" onChange={this.handleChange} /> <br/>
              First Attendance: <input type="text" defaultValue={this.state.profileData.first_attendance} onChange={this.handleChange} /> <br/>
              Number of Visits: <input type="text" defaultValue={this.state.profileData.number_visits} onChange={this.handleChange} /> <br/>
              <input type="submit" value="Submit" />
              </form>
          </div>
        	</div>
		  </div>
		</div>
      );
    }
  }
}

export default Students;
