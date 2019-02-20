import React, { Component } from 'react';
import Autocomplete from '../components/Autocomplete';
import Heatmap from '../components/Heatmap';
import { Button, Col, Form, FormGroup, FormControl, Label, ListGroup, ListGroupItem, Row } from "react-bootstrap";
import { httpGet, httpPatch, httpPost } from '../components/Helpers';
import blankPic from '../images/blank_profile_pic.jpg'
import { getEarlierDate, getPrevSunday, getNextSaturday, dateToString } from '../components/Helpers';
import { Redirect } from 'react-router-dom';

class Students extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mode: 'search',
    };
    this.edit = this.edit.bind(this);
    this.handler = this.handler.bind(this);
  }

  async componentDidMount() {
    try {
      var studentsJson = await httpGet('http://127.0.0.1:8000/api/students');
      var suggestionsArray = this.makeSuggestionsArray(studentsJson);
      
      var studentColumnJson = await httpGet('http://127.0.0.1:8000/api/student_column');
      this.parseCols(studentColumnJson);

      this.setState(function (previousState, currentProps) {
        return {
          mode: 'search',
          suggestionsArray: suggestionsArray,
          studentColumnJson: studentColumnJson,
          id: null,

          uploadedPic: false
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

  parseCols(cols) {
    cols.sort(this.sortCols);
    
    var profileInfo = [];
    for (var col in cols) {
      profileInfo[col] = {
        studentInfoId: null,
        colInfo: cols[col],
        value: null,
        type: null,
        updated: false,
        patchPost: {
          'student_id': null,
          'info_id': parseInt(col) + 1,
          'int_value': null,
          'str_value': null,
          'bool_value': null,
          'date_value': null,
          'time_value': null,
          'id': null
        }
      }
    }

    this.setState(function (previousState, currentProps) {
      return {
        profileInfo: profileInfo,
      };
    });
  }
  
  // Could be used to create a custom layout for the fields on the student profile page
  sortCols(a, b) {
    if (a.info_id > b.info_id) return 1;
    if (a.info_id < b.info_id) return -1;
    return 0;
  }

  handler(e, studentId) {
    var preState = {
      mode: 'display',
      id: studentId,
      profileInfo: this.state.profileInfo
    };
    this.getStudentProfile(preState);
  }

  async getStudentProfile(state) {
    try {
      const studentProfileJson = await httpGet('http://127.0.0.1:8000/api/students?id=' + state.id);
      state.profileData = studentProfileJson;
      
      const studentInfoJson = await httpGet('http://127.0.0.1:8000/api/student_info?student_id=' + state.id);
      // state.studentInfoJson = studentInfoJson;
      state.profileInfo = this.parseStudentInfo(state, studentInfoJson);

      var startDate = getEarlierDate(30);
      startDate = getPrevSunday(startDate);
      var startDateString = dateToString(startDate);
      //var startDateString = "2018-01-28";
      state.startDateString = startDateString;
      var today = getEarlierDate(0);
      var endDate = getNextSaturday(today);
      var endDateString = dateToString(endDate);
      //var endDateString = "2018-03-03";
      state.endDateString = endDateString;

      const heatMapJson = await httpGet('http://127.0.0.1:8000/api/reports/individualHeatmap/?student_id=' + state.id + '&startdate=' + startDateString + '&enddate=' + endDateString);
      state.heatMapJson = heatMapJson;

      this.setState(function (previousState, currentProps) {
        return state;
      });
    }
    catch (e) {
      console.log(e);
    }
  }

  async updateStudentInfo() {
    const studentInfoJson = await httpGet('http://127.0.0.1:8000/api/student_info?student_id=' + this.state.id);
    var profileInfo = this.parseStudentInfo(this.state, studentInfoJson);

    this.setState(function (previousState, currentProps) {
      return {
        profileInfo: profileInfo,
      };
    });
  }

  parseStudentInfo(state, info) {
    for (var entry in state.profileInfo) {
      state.profileInfo[entry].patchPost.student_id = info[0].student_id;

      // Ensure all varchar(x) types get caught as str_value
      var type;
      if ((/varchar.*/g).test(state.profileInfo[entry].colInfo.type)) {
        state.profileInfo[entry].type = 'str_value';
      } else {
        state.profileInfo[entry].type = state.profileInfo[entry].colInfo.type + '_value';
      }
    }

    for (var item in info) {
      var infoId = info[item].info_id;
      state.profileInfo[infoId - 1].patchPost = info[item];
      state.profileInfo[infoId - 1].studentInfoId = info[item].id;

      var type = state.profileInfo[infoId - 1].type;
      state.profileInfo[infoId - 1].value = info[item][type];
    }

    return state.profileInfo;
  }

  edit() {
    this.setState({ mode: 'edit' })
  }

  handleNameChange(evt, state) {
    var changedField = evt.target.id;
    state.profileData[changedField] = evt.target.value;
    this.setState(function (previousState, currentProps) {
      return state;
    });
  }

  handleInfoChange(evt, state) {
    var changedField = evt.target.id;

    var newValue = evt.target.value;
    var type = state.profileInfo[changedField].type;

    state.profileInfo[changedField].updated = true;
    state.profileInfo[changedField].value = newValue;
    state.profileInfo[changedField].patchPost[type] = newValue;

    this.setState(function (previousState, currentProps) {
      return state;
    });
  }

  handleSubmit(evt, state) {
    evt.preventDefault()
    httpPatch('http://127.0.0.1:8000/api/students/', state.profileData);
    
    var posted = false;
    for (var field in state.profileInfo) {
      var field = state.profileInfo[field];
      if (field.updated) {
        if (field.studentInfoId) {
          httpPatch('http://127.0.0.1:8000/api/student_info/?id=' + field.studentInfoId, field.patchPost);
        } else {
          httpPost('http://127.0.0.1:8000/api/student_info/', field.patchPost);
          posted = true;
        }
      }
    }

    if (posted) {
      this.updateStudentInfo();
    }

    // Ensure that the autocomplete component has an updated copy of the profile
    var entryFound = false;
    var entryIndex = 0;
    while (entryFound === false) {
      if (state.suggestionsArray[entryIndex].id === state.profileData['id']) {
        state.suggestionsArray[entryIndex] = {
          firstName: state.profileData['first_name'],
          id: state.profileData['id'],
          lastName1: state.profileData['last_name'],
          lastName2: ''
        };
        entryFound = true
      } else {
        entryIndex++;
      }
    }

    state.id = state.profileData.id;
    state.mode = 'display';

    this.setState(function (previousState, currentProps) {
      return state;
    });
  }

  sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }

  compareTime(time1, time2) {
    return new Date(time1) > new Date(time2); // true if time1 is later
  }

  formatData(state) {
    //replace hyphens in date string with slashes b/c javascript Date object requires this (weird)
    var studentId = state.id;
    var startDateString = state.startDateString;
    var endDateString = state.endDateString;
    // var startDateString = "2018-01-03";
    //var endDateString = "2018-01-31";
    var startDate = new Date(startDateString.replace(/-/g, '\/'));
    var endDate = new Date(endDateString.replace(/-/g, '\/'));
    var dateToCompare = startDate;
    var currEntryDate;
    var currIdx = 0;
    var heatMapJson = this.state.heatMapJson;

    if (heatMapJson.length == 0) {
      var firstEntry = { "date": startDateString, "daily_visits": 0 }
      heatMapJson.push(firstEntry);
    }
    //Add dummy date entries for missing dates (dates with no engagements) to json btwn start and end date
    //dateToCompare always incremented by 1
    while (this.compareTime(dateToCompare, endDate) == false) {
      //if reached the end of json but there's still dates to fill in up to the end date, stay on end entry
      if (currIdx > heatMapJson.length - 1) {
        currIdx = heatMapJson.length - 1;
      }
      currEntryDate = new Date(heatMapJson[currIdx]["date"].replace(/-/g, '\/'));
      //identified missing date, so add dummy date entry for missing date
      if (this.sameDay(dateToCompare, currEntryDate) == false) {
        var dateEntryZeroEngagements = { "date": dateToCompare.toISOString().slice(0, 10), "daily_visits": 0 };
        //add entry in place if not at end of json OR final date entry has not been added yet/surpassed
        //else add to very end of json 
        if (currIdx != heatMapJson.length - 1 || this.compareTime(currEntryDate, dateToCompare)) {
          heatMapJson.splice(currIdx, 0, dateEntryZeroEngagements);
        } else {
          heatMapJson.splice(currIdx + 1, 0, dateEntryZeroEngagements);
        }
      }
      dateToCompare.setDate(dateToCompare.getDate() + 1);
      currIdx++;
    }

    //Time to convert updated JSON with missing dates added in into
    //a list called processedData of {"x": integer day of week, "y": integer week # of month, "color": int num engagements per day} objs
    var processedData = [];
    var dayOfWeek, weekNum, dayEntry;
    var currDateObj;
    var mdyArray;
    var m, d, y;
    var strDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (var i = 0; i < heatMapJson.length; i++) {
      currDateObj = new Date(heatMapJson[i]['date'].replace(/-/g, '\/'));
      dayOfWeek = strDays[currDateObj.getDay()];
      weekNum = Math.floor(i / 7);
      mdyArray = heatMapJson[i]['date'].split(/\s*\-\s*/g);
      y = mdyArray[0];
      m = mdyArray[1];
      d = mdyArray[2];
      dayEntry = { "x": dayOfWeek, "y": weekNum + 1, "color": heatMapJson[i]['daily_visits'] };
      processedData.push(dayEntry);
    }
    return processedData;
  }

  renderDisplayInfo = () => {
    let info = [];
    
    var fields = this.state.profileInfo;
    for (var field in fields) {
      if (fields[field].colInfo.is_showing == true) {
        var value = 'N/A';
        if (fields[field].value != null && fields[field].value != null != '') {
          value = fields[field].value;
        }
        var innerHtml = fields[field].colInfo.name + ': ' + value;
        info.push(<ListGroupItem key={field}>{innerHtml}</ListGroupItem>);
      }
    }

    return info;
  }

  renderEditInfo = () => {
    let info = [];

    for (var entry in this.state.profileInfo) {
      var label = this.state.profileInfo[entry].colInfo.name + ': ';
      if (this.state.profileInfo[entry].colInfo.is_showing) {
        info.push(<Label>{label}</Label>)

        var type;
        switch (this.state.profileInfo[entry].type) {
          case 'str_value':
          type = "text";
          break;
          case 'int_value':
          type = "int";
          break;
          case 'date_value':
          type = "date";
          break;
          case 'time_value':
          type = "time";
          break;
        }
        
        info.push(<FormControl key={label} type={type} id={parseInt(entry)} defaultValue={this.state.profileInfo[entry].value} onChange={evt => this.handleInfoChange(evt, this.state)} />);
        info.push(<br/>);
      }
    }

    return info;
  }

  readImage(evt, state) {
    evt.preventDefault();

    console.log(evt.target.files[0]);

    var reader = new FileReader();
    reader.onloadend = () => {
      this.setState(function (previousState, currentProps) {
        return {
          src: reader.result,
          uploadedPic: true
        };
      });
    }
    reader.readAsDataURL(evt.target.files[0]);
  }

  render() {
    let permissions = window.localStorage.getItem('permissions').split(',')
    if (permissions.indexOf('view_students') < 0) {
      return (<Redirect to='/attendance' />);
    }
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
    }

    else if (this.state.mode === 'display') {
      var pic;
      if (this.state.uploadedPic) {
        pic = this.state.src;
      } else {
        pic = blankPic;
      }
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
              <br/>
              <div className='col-md-2 to-front top-bottom-padding'>
                <img id="studentPhoto" src={pic} width="196" height="196" /><br />
                <ListGroup>
                  <ListGroupItem>Name: {this.state.profileData.first_name} {this.state.profileData.last_name}</ListGroupItem>
                  {this.renderDisplayInfo(this.state.parsedInfo)}
                </ListGroup>
                <Button variant="primary" onClick={this.edit}>
                  Edit
                </Button>
              </div>
            </div>
          </div>
          <Heatmap
            data={this.formatData(this.state)} />
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
                <img id="studentPhoto" src={blankPic} width="196" height="196" />
                <p> Upload Student Profile Photo </p>
                <input id="upload-button" type="file" accept="image/*" name={this.state.profileInfo[0].patchPost.student_id} onChange={evt => this.readImage(evt, this.state)} /><br />
                <Form inline className='col-md-8 top-bottom-padding' onSubmit={evt => this.handleSubmit(evt, this.state)}>
                  <FormGroup>
                    <Label>First Name: </Label>
                    {/* <Col sm="10"> */}
                      <FormControl type="text" id="first_name" defaultValue={this.state.profileData.first_name} onChange={evt => this.handleNameChange(evt, this.state)} /> <br/>
                    {/* </Col> */}
                    <Label>Last Name: </Label>
                    {/* <Col sm="10"> */}
                      <FormControl type="text" id="last_name" defaultValue={this.state.profileData.last_name} onChange={evt => this.handleNameChange(evt, this.state)} /> <br/>
                    {/* </Col> */}
                    {this.renderEditInfo(this.state.parsedInfo)}
                    <br/>
                    <Button variant="primary" type="submit">Submit</Button> 
                  </FormGroup>
                </Form>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default Students;
