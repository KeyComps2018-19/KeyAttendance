import React, { Component } from 'react';
import { Button, ButtonToolbar, Form, ControlLabel, FormControl, FormGroup, Tabs, Tab } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import Heatmap from '../components/Heatmap';
import { domain, downloadReportsCSV, getEarlierDate, dateToString, getNextSaturday, getPrevSunday, getPermissions, httpGet, protocol, downloadAttendanceCSV } from '../components/Helpers';
import BarChart from './../components/BarChart.js';
import AttendanceByProgramReport from '../components/AttendanceByProgramReport';
import NewStudentsReport from '../components/NewStudentsReport';
import MilestoneReport from '../components/MilestoneReport';

class Reports extends Component {

    
    //Initialize state vars that will be reused thru various functions in this component!
    constructor(props) {
        super(props);
        this.state = {
            startDateStringWeek: "",
            endDateStringWeek: "",
            startDateStringYear: "",
            endDateStringYear: "",
            byHourJson: [],
            byHourJsonForDownload: [],
            byDayJson: [],
            byDayJsonForDownload: [],
            byDayInPastWeekJson: [],
            byDayInPastWeekForDownload : [],
            byDayHeatMap: [],
            dateOne: "",
            dateTwo: "",
            buildingCSV: false,
            tab: 1,
            mobile: (window.innerWidth < 768)
        };
        //Initialize vars to handle download csv buttons
        this.downloadHourlyCSV = this.downloadHourlyCSV.bind(this);
        this.downloadWeeklyCSV = this.downloadWeeklyCSV.bind(this);
        this.downloadYearlyCSV = this.downloadYearlyCSV.bind(this);
        this.updateDateOne = this.updateDateOne.bind(this);
        this.updateDateTwo = this.updateDateTwo.bind(this);
        this.downloadCSV = this.downloadCSV.bind(this);
        this.handleTabSelect = this.handleTabSelect.bind(this);
      }

      whiteBorderStyle() {
        return {
            background: 'white',
            borderRadius: 'inherit',
            padding: '10px',
            borderColor: '#e7e7e7',
            borderStyle: 'solid',
            borderWidth: 'thin'
        }
        }

      async componentDidMount() {
        try {
          //Set time range for weekly report (broken down by hour) as the past 7 days
          var today = getEarlierDate(0);
          var startDateWeek = getEarlierDate(6);
          var startDateStringWeek = dateToString(startDateWeek);
          var endDateStringWeek = dateToString(today);
          const byHourJson = await httpGet(`${protocol}://${domain}/api/reports/byHourAttendance/?startdate=${startDateStringWeek}&enddate=${endDateStringWeek}`);
          //Set time range for annual report as the last 365 days, 
          //extending back to the preceeding sunday and forward to the following saturday
          var startDateYear= getEarlierDate(365);
          startDateYear = getPrevSunday(startDateYear);
          var startDateStringYear = dateToString(startDateYear);
          var endDateYear = getNextSaturday(today);
          var endDateStringYear = dateToString(endDateYear);
          const byDayJson = await httpGet(`${protocol}://${domain}/api/reports/byDayAttendance/?startdate=${startDateStringYear}&enddate=${endDateStringYear}`);
          //Call helper funcs to format the datasets broken down by day and hour
          await this.formatDayData(byDayJson, startDateStringYear, endDateStringYear, startDateWeek);
          await this.formatHourData(byHourJson, startDateStringWeek, endDateStringWeek);
        } catch (e) {
          console.log(e);
        }
      }

      //Series of functions to handle download csv buttons
      handleTabSelect(tab) {
        this.setState({ tab });
      }

      updateDateOne(e) {
        this.setState({dateOne: e.target.value});
      }

      updateDateTwo(e) {
        this.setState({dateTwo: e.target.value});
      }

      async downloadCSV() {
          if (this.state.dateOne === "" || this.state.dateTwo === "") {
            return
          }
          this.setState({ buildingCSV: true });
          await downloadAttendanceCSV(this.state.dateOne, this.state.dateTwo)
          this.setState({ buildingCSV: false });
      }
    
      downloadHourlyCSV() {
        this.setState({ buildingCSV: true });
        var title = "Reports_Hourly_Attendance_".concat(this.state.startDateStringWeek);
        title = title.concat("_to_");
        title = title.concat(this.state.endDateStringWeek);
        downloadReportsCSV(this.state.byHourJsonForDownload, ["Date", "Hour", "# Engagements"], title);
        this.setState({ buildingCSV: false });
      }

      downloadWeeklyCSV() {
        this.setState({ buildingCSV: true });
        var title = "Reports_Daily_Attendance_".concat(this.state.startDateStringWeek);
        title = title.concat("_to_");
        title = title.concat(this.state.endDateStringWeek);
        downloadReportsCSV(this.state.byDayInPastWeekForDownload, ["Date","# Engagements"], title);
        this.setState({ buildingCSV: false });
      }

      downloadYearlyCSV() {
        this.setState({ buildingCSV: true });
        var title = "Reports_Annual_Attendance_".concat(this.state.startDateStringYear);
        title = title.concat("_to_");
        title = title.concat(this.state.endDateStringYear);
        downloadReportsCSV(this.state.byDayJsonForDownload, ["Date", "# Engagements"], title);
        this.setState({ buildingCSV: false });
      }

      //Given two JS Date objects, returns True if the two Dates represent the same day; False otherwise
      sameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();
      }

      //Given two JS Date objects, returns True if first Date (time1) is later
      compareTime(time1, time2) {
        return new Date(time1) > new Date(time2);
      }

      //Format json data from day-of-yr API return into format usable by heatmap (and also add missing entries)
      formatDayData(state, startDateStringYear, endDateStringYear, startDateWeek) {
        //replace hyphens in date string with slashes b/c javascript Date object requires this (weird)
        var startDateString = startDateStringYear;
        var endDateString = endDateStringYear;
        //Convert timerange to JS Date objects
        var startDate = new Date(startDateString.replace(/-/g, '/'));
        var endDate = new Date(endDateString.replace(/-/g, '/'));
        var dateToCompare = startDate;
        var currEntryDate;
        var currIdx = 0;
        var byDayJson = state;
        //If the JSON is empty, add in a dummy entry to initialize formatting
        if(byDayJson.length === 0){
          var firstEntry = {"date": startDateString, "daily_visits": 0}
          byDayJson.push(firstEntry);
        }
        //Add dummy date entries for missing dates (dates with no engagements) to json btwn start and end date
        //dateToCompare always incremented by 1
        while (this.compareTime(dateToCompare, endDate) === false) {
          //if reached the end of json but there's still dates to fill in up to the end date, stay on end entry
          if (currIdx > byDayJson.length - 1) {
            currIdx = byDayJson.length - 1;
          }
          currEntryDate = new Date(byDayJson[currIdx]["date"].replace(/-/g, '/'));
          //identified missing date, so add dummy date entry for missing date
          if (this.sameDay(dateToCompare, currEntryDate) === false) {
            var dateEntryZeroEngagements = { "date": dateToCompare.toISOString().slice(0, 10), "daily_visits": 0 };
            //add entry in place if not at end of json OR final date entry has not been added yet/surpassed
            //else add to very end of json 
            if (currIdx !== byDayJson.length - 1 || this.compareTime(currEntryDate, dateToCompare)) {
              byDayJson.splice(currIdx, 0, dateEntryZeroEngagements);
            } else {
              byDayJson.splice(currIdx + 1, 0, dateEntryZeroEngagements);
            }
          }
          dateToCompare.setDate(dateToCompare.getDate() + 1);
          currIdx++;
        }

        //process jsons into lists of lists and store into state for downloading as csv
        var byDayJsonForDownload = [];
        var byDayInPastWeekForDownload = [];
        var entryAsList;
        var currDateObj;
        var startPastWeek = startDateWeek;
        startPastWeek.setDate(startPastWeek.getDate()-1);
        var endPastWeek = getEarlierDate(0);
        for(var i=0; i<byDayJson.length; i++){
          entryAsList = Object.values(byDayJson[i]);
          byDayJsonForDownload.push(entryAsList);
          //add to daily attendance csv if date is within past week
          currDateObj = new Date(byDayJson[i]['date'].replace(/-/g, '/'));
          if(this.compareTime(currDateObj,startPastWeek) && (this.compareTime(currDateObj,endPastWeek) == false) ){
            byDayInPastWeekForDownload.push(entryAsList);
          }
        }

        //Time to convert updated JSON with missing dates added in into
        //a list called processedData of {"x": integer day of week, "y": integer week # of month, "color": int num engagements per day} objs
        var processedData = [];
        var processedDataAnnual = [];
        var byDayInPastWeekJson = [];
        var dayOfWeek, weekNum, dayEntry, annualHeatMapEntry, dayOfWeekConverted;
        var currDateObj;
        var strDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (var i = 0; i < byDayJson.length; i++) {
          currDateObj = new Date(byDayJson[i]['date'].replace(/-/g, '/'));
          dayOfWeek = currDateObj.getDay();
          dayOfWeekConverted = strDays[dayOfWeek];
          weekNum = Math.floor(i / 7);
          annualHeatMapEntry = {"x": weekNum+1, "y": dayOfWeekConverted, "color": byDayJson[i]['daily_visits']};
          processedDataAnnual.push(annualHeatMapEntry);
          dayEntry = {"y": byDayJson[i]['daily_visits'], "x": dayOfWeekConverted};
          processedData.push(dayEntry);
          //add to daily attendance dataset if date is within past week
          if(this.compareTime(currDateObj,startPastWeek) && (this.compareTime(currDateObj,endPastWeek) == false) ){
            byDayInPastWeekJson.push(dayEntry);
          }
        }
          //Set state so these vars can be used elsewhere!
          this.setState(function (previousState, currentProps) {
              return {
                  startDateStringYear: startDateStringYear,
                  endDateStringYear : endDateStringYear,
                  byDayJson : processedData,
                  byDayInPastWeekJson : byDayInPastWeekJson,
                  byDayJsonForDownload: byDayJsonForDownload,
                  byDayInPastWeekForDownload : byDayInPastWeekForDownload,
                  byDayHeatMap: processedDataAnnual

              };
          });
        return processedData;
      }

      //Format json data from hour-of-week API return into format usable by heatmap (and also add missing entries)
      formatHourData(state, startDateStringWeek, endDateStringWeek) {
        //replace hyphens in date string with slashes b/c javascript Date object requires this (weird)
        var startDateString = startDateStringWeek;
        var endDateString = endDateStringWeek;
        //Convert time range to JS Date objects
        var startDate = new Date(startDateString.replace(/-/g, '/'));
        var endDate = new Date(endDateString.replace(/-/g, '/'));
        var dateToCompare = startDate;
        var currEntryDate;
        var currHour;
        var currIdx = 0;
        var byHourJson = state;
        //!!!Set the Key's range of operating hours here!!!!
        var hourArray = ["14:00:00", "15:00:00", "16:00:00", "17:00:00","18:00:00","19:00:00","20:00:00","21:00:00","22:00:00"];
        //first filter out any entries that have timestamps outside of key operating hours
        byHourJson = byHourJson.filter(function(entry) {
          var inValidTimeRange = hourArray.includes(entry.time);
          return inValidTimeRange === true;
         });
        var hourToCompareIdx= 0;
        var hourToCompare = hourArray[0];
        //If JSON is empty, add in dummy entry to initialize formatting
        if(byHourJson.length === 0){
          var firstEntry = {"date": startDateString, "time": hourArray[0], "count": 0};
          byHourJson.push(firstEntry);
        }
        //Add dummy date entries for missing date-hour combos (no engagements) to json btwn start and end date
        while (this.compareTime(dateToCompare, endDate) === false) {
          //if reached the end of json but there's still dates to fill in up to the end date, stay on end entry
          if (currIdx > byHourJson.length - 1) {
            currIdx = byHourJson.length - 1;
          }
          currEntryDate = new Date(byHourJson[currIdx]["date"].replace(/-/g, '/'));
          currHour = byHourJson[currIdx]["time"];
          //identified missing date, so add dummy date entry for missing date
          if (this.sameDay(dateToCompare, currEntryDate) === false) {
            var dateEntryZeroEngagements = { "date": dateToCompare.toISOString().slice(0, 10), "time": hourToCompare, "count": 0 };
            //add entry in place if not at end of json OR final date entry has not been added yet/surpassed
            //else add to very end of json
            if (currIdx !== byHourJson.length - 1 || (this.compareTime(currEntryDate, dateToCompare))){
              byHourJson.splice(currIdx, 0, dateEntryZeroEngagements);
            } else {
              byHourJson.splice(currIdx+1,0, dateEntryZeroEngagements);
            }
          }
          //the two date-hour combos are on SAME DAY, but different hours so add the missing hour as a dummy entry
          else if(hourToCompare !== currHour){
            var dateEntryZeroEngagements = { "date": dateToCompare.toISOString().slice(0, 10), "time": hourToCompare, "count": 0 };
            //add entry in place if not at end of json OR final date entry has not been added yet/surpassed
            //else add to very end of json
            if (currIdx !== byHourJson.length - 1 || currHour > hourToCompare){
              byHourJson.splice(currIdx, 0, dateEntryZeroEngagements);
            } else {
              byHourJson.splice(currIdx+1,0, dateEntryZeroEngagements);
            }
          }
          //the two date-hour combos match exactly
          currIdx++;
          if(hourToCompare === hourArray[hourArray.length-1]){
           hourToCompare = "next day";
          }
          //on last hour of the current day, increment date and set hour to first hour
          if(hourToCompare === "next day"){
            dateToCompare.setDate(dateToCompare.getDate() + 1);
            hourToCompare = hourArray[0];
            hourToCompareIdx = 0;
          }
          //otherwise just increment the hour
          else{
            hourToCompareIdx++;
            hourToCompare = hourArray[hourToCompareIdx];
          }
        }
        //process json into list of lists and store into state for downloading as csv
        var byHourJsonForDownload = [];
        var entryAsList;
        for(var i=0; i<byHourJson.length; i++){
          entryAsList = Object.values(byHourJson[i]);
          byHourJsonForDownload.push(entryAsList);
        }

        //Time to convert updated JSON with missing date-hour combos added in into
        //a list called processedData of {"x": string hour of day, "y": string day of week, "color": int num engagements per day} objs
        var processedData = [];
        var dayOfWeek, hourEntry, hourOfDay;
        var currDateObj;
        var strDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (var i = 0; i < byHourJson.length; i++) {
          currDateObj = new Date(byHourJson[i]['date'].replace(/-/g, '/'));
          dayOfWeek = strDays[currDateObj.getDay()];
          hourOfDay = byHourJson[i]['time'].slice(0,5);
          hourEntry = {"x": hourOfDay, "y": dayOfWeek, "color": byHourJson[i]['count']};
          processedData.push(hourEntry);
        }
          //Set state so these vars can be used elsewhere!
          this.setState(function (previousState, currentProps) {
              return {
                  startDateStringWeek: startDateStringWeek,
                  endDateStringWeek: endDateStringWeek,
                  byHourJson: processedData,
                  byHourJsonForDownload: byHourJsonForDownload
              };
          });
        return processedData;
      }

    render() {
        const buildingCSV = this.state.buildingCSV;
        const permissions = getPermissions();
        if (permissions.indexOf('view_reports') < 0) {
            return (<Redirect to='/attendance'/>);
        }

        return (
          
          <div className="content" style={{minWidth: 'fit-content'}}>
          <h1 style={{textAlign: 'center', fontSize: '30px'}}>Reports Panel</h1>
        <br />
            <Tabs 
            style={{background:'#f8f8f8', borderRadius: 'inherit', display: 'grid'}}
            activeKey={this.state.tab} onSelect={this.handleTabSelect}>
              <Tab key={1} eventKey={1} title="Hourly Attendance">
                <h3
                style={{textAlign: 'center', fontSize: '25px'}}
                > Hourly Attendance </h3>
                <div style={{margin: '20px'}}>
                <ButtonToolbar style={{ display: 'inline-block', marginTop:'10px', marginBottom:'10px'}}>
                <Button ostyle={{marginTop: '10px'}} nClick={this.downloadHourlyCSV} disabled={buildingCSV}>{buildingCSV ? 'Downloading...' : 'Download Hourly'}</Button>
                </ButtonToolbar>
                <div style={this.whiteBorderStyle()}>
                <p> Number of engagements per hour in <b>{this.state.startDateStringWeek}</b> to <b>{this.state.endDateStringWeek}</b>.</p>
                <p><b>Note:</b> Data is displayed chronologically, with the top row representing the oldest day and the bottom row representing the current day.</p>
                {!this.state.mobile && 
                  <Heatmap
                  data = {this.state.byHourJson}
                  heatMapType = "weekly" />
                }{this.state.mobile && 
                  <b>Mobile Does Not Display Visualization</b>
                  }
                </div>
                </div>
              </Tab>
              <Tab key={2} eventKey={2} title="Daily Attendance">
                <h3
                style={{textAlign: 'center', fontSize: '25px'}}
                > Daily Attendance </h3>
                <div style={{margin: '20px'}}>
                <ButtonToolbar style={{ display: 'inline-block', marginTop:'10px', marginBottom:'10px'}}>
                <Button style={{marginTop: '10px'}} onClick={this.downloadWeeklyCSV} disabled={buildingCSV}>{buildingCSV ? 'Downloading...' : 'Download Daily'}</Button>
                </ButtonToolbar>
                
                <div style={this.whiteBorderStyle()}>
                <p> Number of engagements per day in the past week from <b>{this.state.startDateStringWeek}</b> to <b>{this.state.endDateStringWeek}</b>.</p>
                {!this.state.mobile && 
                <BarChart data = {this.state.byDayInPastWeekJson}/>
                }{this.state.mobile && 
                  <b>Mobile Does Not Display Visualization</b>
                  }
                </div>
                </div>
              </Tab>
              <Tab key={3} eventKey={3} title="Annual Attendance">
                <h3
                style={{textAlign: 'center', fontSize: '25px'}}
                > Annual Daily Attendance </h3>
                <div style={{margin: '20px'}}>
                <ButtonToolbar style={{ display: 'inline-block', marginTop:'10px', marginBottom:'10px'}}>
                <Button style={{marginTop: '10px'}} onClick={this.downloadYearlyCSV} disabled={buildingCSV}>{buildingCSV ? 'Downloading...' : 'Download Annual'}</Button>
                </ButtonToolbar>
                <div style={this.whiteBorderStyle()}>
                <p> Number of engagements per day in the past year from <b>{this.state.startDateStringYear}</b> to <b>{this.state.endDateStringYear}</b>.</p>
                <p><b>Note:</b> Data is displayed chronologically, with the leftmost column representing the oldest week and the rightmost column representing the current week.</p> 
                {!this.state.mobile && 
                <Heatmap data = {this.state.byDayHeatMap} heatMapType = "annual" />
                }
                {this.state.mobile && 
                  <b>Mobile Does Not Display Visualization</b>
                  }
                </div>
                </div>
                </Tab>
              <Tab key={4} eventKey={4} title="Multi-Date Attendance Sheet">
                <h3
                style={{textAlign: 'center', fontSize: '25px'}}
                > Download Multi-Date Attendance Sheet </h3>
                <div style={{margin: '20px'}}>
                <p>Combines and downloads attendance sheets from multiple dates</p>
                <Form style={{paddingRight: '5px', paddingLeft: '5px'}}>
                  <FormGroup>
                    <ControlLabel>Start Date</ControlLabel>{' '}
                    <FormControl onChange={this.updateDateOne} value={this.state.dateOne} type="date"/>{'  '}
                    <ControlLabel>End Date</ControlLabel>{' '}
                    <FormControl onChange={this.updateDateTwo} value={this.state.dateTwo} type="date"/>{'  '}
                    <Button style={{marginTop: '10px'}} onClick={this.downloadCSV} disabled={buildingCSV}>{buildingCSV ? 'Downloading...' : 'Download'}</Button>
                  </FormGroup>
                </Form>
                </div>
              </Tab>
              <Tab key={5} eventKey={5} title="Attendance By Program">
                <AttendanceByProgramReport/>
              </Tab>
              <Tab key={6} eventKey={6} title="New Students">
                <NewStudentsReport/>
              </Tab>
              <Tab key={7} eventKey={7} title="Attendance Milestones">
                <MilestoneReport/>
              </Tab>
            </Tabs>
          </div>
        );
    }
}

// List of students who attended a particular category over a given time span
// List of students who attended for the first time
// List of students who have attended the key at least *n* number of times.

export default Reports;
