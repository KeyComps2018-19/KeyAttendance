import React, {Component} from 'react';
import Heatmap from '../components/Heatmap';
import continuousColorLegend from 'react-vis/dist/legends/continuous-color-legend';
import {getEarlierDate, getPrevSunday, getNextSaturday, dateToString,downloadReportsCSV, domain, httpGet, httpPatch} from '../components/Helpers';
import BarChart from './../components/BarChart.js'
import { Button, ButtonToolbar } from 'react-bootstrap';

class Reports extends Component {

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
            byDayHeatMap: []
        };
        this.downloadHourlyCSV = this.downloadHourlyCSV.bind(this);
        this.downloadWeeklyCSV = this.downloadWeeklyCSV.bind(this);
        this.downloadYearlyCSV = this.downloadYearlyCSV.bind(this);
      }

      async componentDidMount() {
        try {
          //hardcoded date range for testing
          var startDateStringWeek = "2018-02-08";
          var endDateStringWeek = "2018-02-14";
          //Make timerange for last 7 days to display for weekly aggregation (broken down by hour of day)
          var today = getEarlierDate(0);
          //var startDateWeek = getEarlierDate(6);
          //var startDateStringWeek = dateToString(startDateWeek);
          //var endDateStringWeek = dateToString(today);
          const byHourJson = await httpGet('http://127.0.0.1:8000/api/reports/byHourAttendance/?startdate=' + startDateStringWeek + '&enddate=' + endDateStringWeek);
          console.log("By hour:",byHourJson);
          // var byHourJson = await byHourAttendanceData.json();
          //Make timerange for last 365 days, extending back to the preceeding sunday and forward to the following sat to display yearly aggregation (broken down by day)
         // var startDateYear= getEarlierDate(365);
         // startDateYear = getPrevSunday(startDateYear);
          //var startDateStringYear = dateToString(startDateYear);
         // var endDateYear = getNextSaturday(today);
          //var endDateStringYear = dateToString(endDateYear);
          var startDateStringYear = "2018-02-04";
          var endDateStringYear = "2019-02-09";
          const byDayJson = await httpGet('http://127.0.0.1:8000/api/reports/byDayAttendance/?startdate=' + startDateStringYear + '&enddate=' + endDateStringYear);
          // var byDayJson = await byDayAttendanceData.json();
          var dayData = await this.formatDayData(byDayJson, startDateStringYear, endDateStringYear);
          var hourData = await this.formatHourData(byHourJson, startDateStringWeek, endDateStringWeek);


          //Delete this block later, this is just here for testing
          // var dayData = this.formatDayData(this.state);
          // console.log("processed day of year data after setting state: ", this.state.byDayJson);
          // var hourData = this.formatHourData(this.state);
          // console.log("processed hour of week data: ", hourData);

        } catch (e) {
          console.log(e);
        }
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
        downloadReportsCSV(this.state.byDayJsonForDownload.splice(0,7), ["Date","# Engagements"], title);
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

      sameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();
      }


      compareTime(time1, time2) {
        return new Date(time1) > new Date(time2); // true if time1 is later
      }

      //Format json data from day-of-yr endpoint into format usable by heatmap (and also add missing entries)
      formatDayData(state, startDateStringYear, endDateStringYear) {
        //replace hyphens in date string with slashes b/c javascript Date object requires this (weird)
        var startDateString = startDateStringYear;
        var endDateString = endDateStringYear;
        var startDate = new Date(startDateString.replace(/-/g, '\/'));
        var endDate = new Date(endDateString.replace(/-/g, '\/'));
        var dateToCompare = startDate;
        var currEntryDate;
        var currIdx = 0;
        var byDayJson = state;

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
          currEntryDate = new Date(byDayJson[currIdx]["date"].replace(/-/g, '\/'));
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

        //process json into list of lists and store into state for downloading as csv
        var byDayJsonForDownload = [];
        var entryAsList;
        for(var i=0; i<byDayJson.length; i++){
          entryAsList = Object.values(byDayJson[i]);
          byDayJsonForDownload.push(entryAsList);
        }

        //Time to convert updated JSON with missing dates added in into
        //a list called processedData of {"x": integer day of week, "y": integer week # of month, "color": int num engagements per day} objs
        var processedData = [];
        var processedDataAnnual = [];
        var dayOfWeek, weekNum, dayEntry, annualHeatMapEntry, dayOfWeekConverted;
        var currDateObj;
        var mdyArray;
        var d, m, y;
        var strDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (var i = 0; i < byDayJson.length; i++) {
          currDateObj = new Date(byDayJson[i]['date'].replace(/-/g, '\/'));
          dayOfWeek = currDateObj.getDay();
          dayOfWeekConverted = strDays[dayOfWeek];
          weekNum = Math.floor(i / 7);
          mdyArray = byDayJson[i]['date'].split(/\s*\-\s*/g);
          y = mdyArray[0];
          m = mdyArray[1];
          d = mdyArray[2];
          annualHeatMapEntry = {"x": weekNum+1, "y": dayOfWeekConverted, "color": byDayJson[i]['daily_visits']};
          processedDataAnnual.push(annualHeatMapEntry);
          dayEntry = {"y": byDayJson[i]['daily_visits'], "x": dayOfWeekConverted};
          processedData.push(dayEntry);
        }
          this.setState(function (previousState, currentProps) {
              return {
                  startDateStringYear: startDateStringYear,
                  endDateStringYear : endDateStringYear,
                  byDayJson : processedData,
                  byDayJsonForDownload: byDayJsonForDownload,
                  byDayHeatMap: processedDataAnnual

              };
          });
        return processedData;
      }

      //Format json data from hour-of-week endpoint into format usable by heatmap (and also add missing entries)
      formatHourData(state, startDateStringWeek, endDateStringWeek) {
        //replace hyphens in date string with slashes b/c javascript Date object requires this (weird)
        var startDateString = startDateStringWeek;
        var endDateString = endDateStringWeek;
        var startDate = new Date(startDateString.replace(/-/g, '\/'));
        var endDate = new Date(endDateString.replace(/-/g, '\/'));
        var dateToCompare = startDate;
        var currEntryDate;
        var currHour;
        var currIdx = 0;
        var byHourJson = state;
        var hourArray = ["14:00:00", "15:00:00", "16:00:00", "17:00:00","18:00:00","19:00:00","20:00:00","21:00:00","22:00:00"];

        //first filter out any entries that have timestamps outside of key operating hours
        byHourJson = byHourJson.filter(function(entry) {
          var inValidTimeRange = hourArray.includes(entry.time);
          return inValidTimeRange === true;
         });
        var hourToCompareIdx= 0;
        var hourToCompare = hourArray[0];

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
          currEntryDate = new Date(byHourJson[currIdx]["date"].replace(/-/g, '\/'));
          currHour = byHourJson[currIdx]["time"];
          //identified missing date, so add dummy date entry for missing date
          if (this.sameDay(dateToCompare, currEntryDate) === false) {
            var dateEntryZeroEngagements = { "date": dateToCompare.toISOString().slice(0, 10), "time": hourToCompare, "count": 0 };
            //add entry in place if not at end of json OR final date entry has not been added yet/surpassed
            //else add to very end of json
            if (currIdx !== byHourJson.length - 1 || (this.compareTime(currEntryDate, dateToCompare) && currHour > hourToCompare)){
              byHourJson.splice(currIdx, 0, dateEntryZeroEngagements);
            } else {
              byHourJson.splice(currIdx+1,0, dateEntryZeroEngagements);
            }
          }
          //the two date-hour combos are on same day, but different hours so add the missing hour as a dummy entry
          else if(hourToCompare !== currHour){
            var dateEntryZeroEngagements = { "date": dateToCompare.toISOString().slice(0, 10), "time": hourToCompare, "count": 0 };
            //add entry in place if not at end of json OR final date entry has not been added yet/surpassed
            //else add to very end of json
            if (currIdx !== byHourJson.length - 1 || (this.compareTime(currEntryDate, dateToCompare) && currHour > hourToCompare)){
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
        var mdyArray;
        var d, m, y;
        var strDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (var i = 0; i < byHourJson.length; i++) {
          currDateObj = new Date(byHourJson[i]['date'].replace(/-/g, '\/'));
          dayOfWeek = strDays[currDateObj.getDay()];
          hourOfDay = byHourJson[i]['time'].slice(0,2);
          mdyArray = byHourJson[i]['date'].split(/\s*\-\s*/g);
          y = mdyArray[0];
          m = mdyArray[1];
          d = mdyArray[2];
          hourEntry = {"x": hourOfDay.concat(" hrs"), "y": dayOfWeek, "color": byHourJson[i]['count']};
          processedData.push(hourEntry);
        }
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
        return (
            <div className="container py-4">
                <h1> Reports </h1>
                <div className="row">
                    <div className="col-md-8 align-self-center">
                        <h3> Hourly Attendance </h3>
                        <p> Number of engagements per hour in the past week.</p>
                        <ButtonToolbar style={{ float: 'right'}}>
                    <Button onClick={this.downloadHourlyCSV} disabled={buildingCSV}>{buildingCSV ? 'Downloading...' : 'Download Hourly'}</Button>
                </ButtonToolbar>
                        <Heatmap
                        data = {this.state.byHourJson}
                        heatMapType = "weekly" />

                    </div>
                    <div className='col-md-4 align-self-center'>
                        <h3> Daily Attendance </h3>
                        <p> Number of engagements per day in the past week.</p>
                        <ButtonToolbar style={{ float: 'right'}}>
                    <Button onClick={this.downloadWeeklyCSV} disabled={buildingCSV}>{buildingCSV ? 'Downloading...' : 'Download Daily'}</Button>
                </ButtonToolbar>
                        <BarChart data = {this.state.byDayJson.slice(0, 7)}/> </div>
                    </div>
              <div className="row">
                <div className="col-md-8">
                    <h3> Annual Daily Attendance </h3>
                    <p> Number of engagements per day in the past year.</p>
                    <ButtonToolbar style={{ float: 'right'}}>
                          <Button onClick={this.downloadYearlyCSV} disabled={buildingCSV}>{buildingCSV ? 'Downloading...' : 'Download Annual'}</Button>
                        </ButtonToolbar>
                  <Heatmap data = {this.state.byDayHeatMap} heatMapType = "annual" />
                </div>
                 </div>
            </div>

        );
    }
}

export default Reports;