(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{166:function(e,t,a){},168:function(e,t,a){"use strict";a.r(t);var n=a(0),s=a.n(n),r=a(20),i=a.n(r),o=(a(91),a(9)),c=a(10),l=a(13),u=a(11),d=a(12),h=a(183),m=a(140),p=a(139),g=a(184),f=a(170),b=a(171),v=a(172),y=function(e){function t(e){var a;return Object(o.a)(this,t),(a=Object(l.a)(this,Object(u.a)(t).call(this,e))).handleItemClick=function(e){return function(){a.props.history.push("/".concat(e))}},a.logout=function(){return function(){window.localStorage.removeItem("key_credentials"),window.localStorage.removeItem("isAdmin"),a.props.history.push("/")}},a.state={activeItem:"home"},a}return Object(d.a)(t,e),Object(c.a)(t,[{key:"render",value:function(){return this.props.show?s.a.createElement("div",null,s.a.createElement(g.a,null,s.a.createElement(g.a.Header,null,s.a.createElement(g.a.Brand,{onClick:this.handleItemClick("attendance")},"Key"),s.a.createElement(g.a.Toggle,null)),s.a.createElement(g.a.Collapse,null,s.a.createElement(f.a,null,s.a.createElement(b.a,{onClick:this.handleItemClick("attendance")},"Attendance"),s.a.createElement(b.a,{onClick:this.handleItemClick("students")},"Students"),s.a.createElement(b.a,{onClick:this.handleItemClick("reports")},"Reports"),s.a.createElement(b.a,{onClick:this.handleItemClick("alerts")},"Alerts"),s.a.createElement(b.a,{onClick:this.handleItemClick("admin")},"Admin")),s.a.createElement(f.a,{pullRight:!0},s.a.createElement(b.a,{onClick:this.logout()},"Logout")))),this.props.children):this.props.children}}]),t}(n.Component),k=Object(v.a)(y),C=a(8),E=a(173),S=a(174),w=a(175),j=a(186),O=a(176),I=a(177),N=a(187),D=a(21),_=a.n(D),x=a(28),A=a(83),M=a.n(A)()(),L="ec2-3-16-129-180.us-east-2.compute.amazonaws.com";function T(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},a=window.localStorage.getItem("key_credentials");if(null!==a)return fetch(e,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"JWT "+a},body:JSON.stringify(t)}).then(function(e){return e.status>=400?(403===e.status&&(window.localStorage.removeItem("key_credentials"),M.push("/")),{error:e.status}):e.json()});M.push("/")}function F(e){var t=window.localStorage.getItem("key_credentials");if(null!==t)return fetch(e,{method:"GET",headers:{"Content-Type":"application/json",Authorization:"JWT "+t}}).then(function(e){return e.status>=400?(403===e.status&&(window.localStorage.removeItem("key_credentials"),M.push("/")),{error:e.status}):e.json()});M.push("/")}function R(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},a=window.localStorage.getItem("key_credentials");if(null!==a)return fetch(e,{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:"JWT "+a},body:JSON.stringify(t)}).then(function(e){return e.status>=400?(403===e.status&&(window.localStorage.removeItem("key_credentials"),M.push("/")),{error:e.status}):{}});M.push("/")}function P(e,t){return e.ordering<t.ordering?-1:e.ordering>t.ordering?1:0}function W(){return(W=Object(x.a)(_.a.mark(function e(t){var n,s,r,i,o,c,l,u,d,h,m,p,g,f,b,v,y=arguments;return _.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return n=y.length>1&&void 0!==y[1]?y[1]:null,s=t===n||null===n?"http://".concat(L,"/api/attendance/?day=").concat(t):"http://".concat(L,"/api/attendance/?startdate=").concat(t,"&enddate=").concat(n),e.next=4,F(s);case 4:return r=e.sent,e.next=7,F("http://".concat(L,"/api/students/"));case 7:return i=e.sent,e.next=10,F("http://".concat(L,"/api/activities/"));case 10:if((o=e.sent).sort(P),0!==r.length&&0!==o.length){e.next=14;break}return e.abrupt("return");case 14:for(c={},l=0;l<o.length;l++)o[l].is_showing&&(c[o[l].name]={id:o[l].activity_id,ordering:o[l].ordering});for(u={},l=0;l<r.length;l++)null==u["".concat(r[l].student_id).concat(r[l].date)]&&(u["".concat(r[l].student_id).concat(r[l].date)]={date:r[l].date,id:r[l].student_id}),u["".concat(r[l].student_id).concat(r[l].date)][r[l].activity_id]="Y";for(d=[],h=["Date","First","Last","Student Key"],l=0;l<o.length;l++)h.push(o[l].name);m=Object.keys(u),l=0;case 23:if(!(l<m.length)){e.next=53;break}p=[],g=0;case 26:if(!(g<i.length)){e.next=34;break}if(i[g].id!==u[m[l]].id){e.next=31;break}return p[1]=i[g].first_name,p[2]=i[g].last_name,e.abrupt("break",34);case 31:g++,e.next=26;break;case 34:g=0;case 35:if(!(g<h.length)){e.next=49;break}e.t0=h[g],e.next="Date"===e.t0?39:"First"===e.t0?41:"Last"===e.t0?42:"Student Key"===e.t0?43:45;break;case 39:return p[g]=u[m[l]].date,e.abrupt("break",46);case 41:case 42:return e.abrupt("break",46);case 43:return p[g]="N/A",e.abrupt("break",46);case 45:null!=u[m[l]][c[h[g]].id]?p[g]=u[m[l]][c[h[g]].id]:p[g]="N";case 46:g++,e.next=35;break;case 49:d.push(p);case 50:l++,e.next=23;break;case 53:f=a(147),b=f.unparse({fields:h,data:d}),(v=document.createElement("a")).setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(b)),v.setAttribute("download","Attendance_".concat(t===n||null===n?t:"".concat(t,"_").concat(n),".csv")),v.style.display="none",document.body.appendChild(v),v.click(),document.body.removeChild(v);case 62:case"end":return e.stop()}},e,this)}))).apply(this,arguments)}var B=function(e){return null===window.localStorage.getItem("key_credentials")?s.a.createElement(N.a,{to:"/"}):s.a.createElement(e,null)},J=function(e){function t(e){var a;return Object(o.a)(this,t),(a=Object(l.a)(this,Object(u.a)(t).call(this,e))).state={username:"",password:"",error:!1,firstLogin:!0},a.onUsernameChange=a.onUsernameChange.bind(Object(C.a)(Object(C.a)(a))),a.onPasswordChange=a.onPasswordChange.bind(Object(C.a)(Object(C.a)(a))),a.submit=a.submit.bind(Object(C.a)(Object(C.a)(a))),a}return Object(d.a)(t,e),Object(c.a)(t,[{key:"componentDidMount",value:function(){null!=localStorage.getItem("loggedIn")&&this.setState({firstLogin:!1})}},{key:"onUsernameChange",value:function(e){this.setState({username:e.target.value})}},{key:"onPasswordChange",value:function(e){this.setState({password:e.target.value})}},{key:"submit",value:function(){var e=this;fetch("http://".concat(L,"/api-token-auth/"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:this.state.username,password:this.state.password})}).then(function(t){t.status>=400?e.setState({error:!0,username:"",password:""}):t.json().then(function(t){window.localStorage.setItem("key_credentials",t.token);var a=t.token.split("."),n=JSON.parse(atob(a[1]));window.localStorage.setItem("isAdmin",n.is_staff),window.localStorage.setItem("loggedIn","true"),e.props.history.push("/attendance")})})}},{key:"render",value:function(){var e={textAlign:"center"};return null!==window.localStorage.getItem("key_credentials")?s.a.createElement(N.a,{to:"/attendance"}):s.a.createElement("div",{className:"center"},s.a.createElement("div",{className:"login-container"},s.a.createElement(E.a,null,s.a.createElement("h2",{style:e},"Key Attendance"),s.a.createElement("h4",{style:e},"Sign In"),s.a.createElement("form",null,s.a.createElement(S.a,null,s.a.createElement(w.a,null,"Username"),s.a.createElement(j.a,{type:"text",value:this.state.username,placeholder:"Username",onChange:this.onUsernameChange}),s.a.createElement("br",null),s.a.createElement(w.a,null,"Password"),s.a.createElement(j.a,{type:"password",value:this.state.password,placeholder:"Password",onChange:this.onPasswordChange})),s.a.createElement(O.a,{block:!0,onClick:this.submit,bsStyle:"primary"},"Continue"),s.a.createElement("br",null),this.state.error&&s.a.createElement(I.a,{bsStyle:"danger"},"Invalid username or password. Please try again."),!this.state.firstLogin&&s.a.createElement(I.a,{bsStyle:"info"},"You have been logged out.")))))}}]),t}(s.a.Component),U=a(84),K=a.n(U),V=function(e){function t(){var e,a;Object(o.a)(this,t);for(var n=arguments.length,s=new Array(n),r=0;r<n;r++)s[r]=arguments[r];return(a=Object(l.a)(this,(e=Object(u.a)(t)).call.apply(e,[this].concat(s)))).state={isChecked:!1},a.toggleCheckboxChange=function(){var e=a.props,t=e.toggleCheckbox,n=e.label;a.setState(function(e){return{isChecked:!e.isChecked}}),t(a.state.isChecked,n)},a}return Object(d.a)(t,e),Object(c.a)(t,[{key:"componentDidMount",value:function(){this.setState({isChecked:this.props.checked,attendanceItemID:this.props.attendanceItemID?this.props.attendanceItemID:0})}},{key:"componentDidUpdate",value:function(){this.props.checked!==this.state.isChecked&&this.setState({isChecked:this.props.checked})}},{key:"render",value:function(){var e=this.props.label,t=this.state.isChecked;return s.a.createElement("span",{className:"checkbox"},s.a.createElement("label",null,s.a.createElement("input",{type:"checkbox",value:e,checked:t,onChange:this.toggleCheckboxChange}),e))}}]),t}(n.Component),H=a(178),Y=function(e){function t(e){var a;return Object(o.a)(this,t),(a=Object(l.a)(this,Object(u.a)(t).call(this,e))).toggleCheckbox=function(e,t){var n=a.state,s=n.activities,r=n.studentID,i=n.numChecked,o=Object(C.a)(Object(C.a)(a)),c=s[t].activityID,l=s[t].attendanceItemID;if(e)1===i||R("http://".concat(L,"/api/attendance?key=").concat(l)).then(function(e){"error"in e?o.setState({error:e.error}):(s[t].value=!1,o.setState({activities:s,numChecked:i-1}))});else{var u=new Date;T("http://".concat(L,"/api/attendance/"),{student_id:r,activity_id:c,date:"".concat(u.getFullYear(),"-").concat(u.getMonth()+1,"-").concat(u.getDate()),time:"".concat(u.getHours(),":").concat(u.getMinutes()>10?u.getMinutes():"0".concat(u.getMinutes()),":").concat(u.getSeconds()>10?u.getSeconds():"0".concat(u.getSeconds()))}).then(function(e){"error"in e?o.setState({error:e.error}):(s[t].value=!0,s[t].attendanceItemID=e.id,o.setState({activities:s,numChecked:i+1}))})}},a.createCheckboxes=function(){for(var e=a.state.activities,t=Object.keys(e),n=[],r=0;r<t.length;r++)n.push(s.a.createElement(V,{label:t[r],key:t[r],checked:e[t[r]].value,toggleCheckbox:a.toggleCheckbox}));return n},a.state={activities:{},studentID:0,error:"",numChecked:0},a.toggleCheckbox=a.toggleCheckbox.bind(Object(C.a)(Object(C.a)(a))),a}return Object(d.a)(t,e),Object(c.a)(t,[{key:"componentDidMount",value:function(){for(var e=0,t=this.props.row.activities,a=Object.keys(t),n=0;n<a.length;n++)!0===t[a[n]].value&&e++;this.setState({activities:t,studentID:this.props.row.studentID,numChecked:e})}},{key:"render",value:function(){return s.a.createElement("span",{className:"container"},s.a.createElement("span",{className:"row"},s.a.createElement("span",{className:"col-sm-12"},this.state.numChecked<2&&s.a.createElement(H.a,{bsStyle:"warning"},"At least one box must be checked"),""!==this.state.error&&s.a.createElement(H.a,{bsStyle:"danger"},"Error ",this.state.error,": Your changes have not been saved. Please refresh and try again."),this.createCheckboxes())))}}]),t}(s.a.Component),z=function(e){function t(e){var a;return Object(o.a)(this,t),(a=Object(l.a)(this,Object(u.a)(t).call(this,e))).state={row:{}},a.deleteRow=a.deleteRow.bind(Object(C.a)(Object(C.a)(a))),a}return Object(d.a)(t,e),Object(c.a)(t,[{key:"componentDidMount",value:function(){this.setState({row:this.props.row})}},{key:"componentDidUpdate",value:function(){this.props.row.studentID!==this.state.row.studentID&&this.setState({row:this.props.row})}},{key:"deleteRow",value:function(){for(var e=this.state.row,t=e.activities,a=Object.keys(t),n=[],s=0;s<a.length;s++)0!==t[a[s]].attendanceItemID&&n.push(t[a[s]].attendanceItemID);for(var r=0;r<n.length;r++)R("http://".concat(L,"/api/attendance/?key=").concat(n[r]));this.props.CustomFunction(e.studentID)}},{key:"render",value:function(){return s.a.createElement(O.a,{bsStyle:"danger",onClick:this.deleteRow},"Delete")}}]),t}(s.a.Component),G=a(185),$=function(e){function t(e){var a;return Object(o.a)(this,t),(a=Object(l.a)(this,Object(u.a)(t).call(this,e))).state={firstName:"",lastName:""},a.cancel=a.cancel.bind(Object(C.a)(Object(C.a)(a))),a.submit=a.submit.bind(Object(C.a)(Object(C.a)(a))),a.onFirstNameChange=a.onFirstNameChange.bind(Object(C.a)(Object(C.a)(a))),a.onLastNameChange=a.onLastNameChange.bind(Object(C.a)(Object(C.a)(a))),a}return Object(d.a)(t,e),Object(c.a)(t,[{key:"validateInput",value:function(){var e=this.state,t=e.firstName,a=e.lastName;return t.length>0&&a.length>0?"success":0===t.length&&0===a.length?null:"error"}},{key:"onFirstNameChange",value:function(e){this.setState({firstName:e.target.value})}},{key:"onLastNameChange",value:function(e){this.setState({lastName:e.target.value})}},{key:"cancel",value:function(){this.props.onSubmit()}},{key:"submit",value:function(){var e=this;T("http://".concat(L,"/api/students/"),{first_name:this.state.firstName,last_name:this.state.lastName}).then(function(t){"error"in t?console.log(t):e.props.onSubmit(t)})}},{key:"render",value:function(){return s.a.createElement(G.a,{show:this.props.show},s.a.createElement(G.a.Header,null,s.a.createElement(G.a.Title,null,"Create New Student")),s.a.createElement(G.a.Body,null,s.a.createElement("form",null,s.a.createElement(S.a,{controlId:"addStudentForm",validationState:this.validateInput()},s.a.createElement(w.a,null,"First Name"),s.a.createElement(j.a,{type:"text",value:this.state.firstName,placeholder:"First",onChange:this.onFirstNameChange}),s.a.createElement(j.a.Feedback,null),s.a.createElement("br",null),s.a.createElement(w.a,null,"Last Name"),s.a.createElement(j.a,{type:"text",value:this.state.lastName,placeholder:"Last",onChange:this.onLastNameChange}),s.a.createElement(j.a.Feedback,null)))),s.a.createElement(G.a.Footer,null,s.a.createElement(O.a,{onClick:this.cancel},"Cancel"),s.a.createElement(O.a,{onClick:this.submit,bsStyle:"primary"},"Create")))}}]),t}(s.a.Component),q=(a(166),a(179)),Q=function(e){function t(e){var a;return Object(o.a)(this,t),(a=Object(l.a)(this,Object(u.a)(t).call(this,e))).onChange=function(e){var t=a.props.suggestions,n=e.currentTarget.value,s=t.filter(function(e){return!0===e.firstName.toLowerCase().startsWith(n.toLowerCase())||!0===e.lastName1.toLowerCase().startsWith(n.toLowerCase())||!0===e.lastName2.toLowerCase().startsWith(n.toLowerCase())||!0===e.id.toString().startsWith(n.toLowerCase())||!0===(e.firstName.toLowerCase()+" "+e.lastName1.toLowerCase()+" "+e.id.toString()).startsWith(n.toLowerCase())});a.setState({activeSuggestion:0,filteredSuggestions:s,showSuggestions:!0,userInput:e.currentTarget.value})},a.onClick=function(e){a.setState({activeSuggestion:0,filteredSuggestions:[],showSuggestions:!1,userInput:e.currentTarget.innerText}),a.props.handler(e,e._targetInst.key),a.setState({userInput:""})},a.handleSubmit=function(e){e.preventDefault()},a.onKeyDown=function(e){var t=a.state,n=t.activeSuggestion,s=t.filteredSuggestions;if(13===e.keyCode&&-1===a.state.activeSuggestion)a.props.handler(e,a.state.selectedId),a.setState({userInput:""});else if(13===e.keyCode){if("object"===typeof s[n]){var r=s[n].firstName+" "+s[n].lastName1;a.setState({activeSuggestion:-1,showSuggestions:!1,userInput:r,selectedId:s[n].id})}}else if(38===e.keyCode){if(0===n)return;a.setState({activeSuggestion:n-1}),a.scrollUpHandler()}else if(40===e.keyCode){if(n===s.length-1)return;a.setState({activeSuggestion:n+1}),a.scrollDownHandler()}},a.state={activeSuggestion:0,filteredSuggestions:[],showSuggestions:!1,userInput:""},a}return Object(d.a)(t,e),Object(c.a)(t,[{key:"scrollDownHandler",value:function(){var e=document.getElementsByClassName("suggestions"),t=document.getElementsByClassName("suggestion-active")[0].getBoundingClientRect().height,a=e[0].scrollTop,n=e[0].getBoundingClientRect().height,s=Math.round(Math.round(n/t)/2)*t;(this.state.activeSuggestion+2)*t>=a+n&&(e[0].scrollTop=e[0].scrollTop+s)}},{key:"scrollUpHandler",value:function(){var e=document.getElementsByClassName("suggestions"),t=document.getElementsByClassName("suggestion-active")[0].getBoundingClientRect().height,a=e[0].scrollTop,n=e[0].getBoundingClientRect().height,s=Math.round(Math.round(n/t)/2)*t;(this.state.activeSuggestion-1)*t<=a&&(e[0].scrollTop=e[0].scrollTop-s)}},{key:"render",value:function(){var e,t=this.onChange,a=this.onClick,r=this.onKeyDown,i=this.handleSubmit,o=this.state,c=o.activeSuggestion,l=o.filteredSuggestions,u=o.showSuggestions,d=o.userInput;return u&&d&&(e=l.length?s.a.createElement("div",{className:"suggestions"},l.map(function(e,t){var n;return t===c&&(n="suggestion-active"),s.a.createElement("p",{className:n,key:e.id,onClick:a},e.firstName," ",e.lastName1," ",e.lastName2)})):s.a.createElement("div",{className:"no-suggestions"},s.a.createElement("em",null,"No suggestions."))),s.a.createElement(n.Fragment,null,s.a.createElement(q.a,{inline:!0,onSubmit:i},s.a.createElement(S.a,{controlId:"formInlineName"},s.a.createElement(w.a,null,"Search:")," ",s.a.createElement(j.a,{autoComplete:"off",type:"text",value:d,onChange:t,onKeyDown:r,placeholder:"Name or ID"}),e)," "))}}]),t}(n.Component);Q.defaultProps={suggestions:[],handler:null};var X=Q,Z=a(180),ee=function(e){function t(e){var a;return Object(o.a)(this,t),(a=Object(l.a)(this,Object(u.a)(t).call(this,e))).state={buildingCSV:!1,students:[],activities:[],attendanceItems:[],suggestionsArray:[],attendance:[],showStudentModal:!1},a.downloadCSV=a.downloadCSV.bind(Object(C.a)(Object(C.a)(a))),a.addStudent=a.addStudent.bind(Object(C.a)(Object(C.a)(a))),a.removeAttendanceRow=a.removeAttendanceRow.bind(Object(C.a)(Object(C.a)(a))),a.openModal=a.openModal.bind(Object(C.a)(Object(C.a)(a))),a.closeModal=a.closeModal.bind(Object(C.a)(Object(C.a)(a))),a}return Object(d.a)(t,e),Object(c.a)(t,[{key:"componentDidMount",value:function(){var e=Object(x.a)(_.a.mark(function e(){var t,a,n,s,r;return _.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,t=new Date,e.next=4,F("http://".concat(L,"/api/students/"));case 4:return a=e.sent,e.next=7,F("http://".concat(L,"/api/attendance/?day=","".concat(t.getFullYear(),"-").concat(t.getMonth()+1,"-").concat(t.getDate())));case 7:return n=e.sent,e.next=10,F("http://".concat(L,"/api/activities/"));case 10:(s=e.sent).sort(P),r=this.makeSuggestionsArray(a),this.setState({suggestionsArray:r,students:a,activities:s,attendanceItems:n}),e.next=19;break;case 16:e.prev=16,e.t0=e.catch(0),console.log(e.t0);case 19:this.buildSheet();case 20:case"end":return e.stop()}},e,this,[[0,16]])}));return function(){return e.apply(this,arguments)}}()},{key:"buildSheet",value:function(){for(var e=this.state,t=e.activities,a=e.attendanceItems,n=e.students,s={},r=0;r<a.length;r++)-1!==a[r].activity_id&&(null==s["".concat(a[r].student_id)]&&(s["".concat(a[r].student_id)]={time:a[r].time}),s["".concat(a[r].student_id)][a[r].activity_id]={value:!0,itemID:a[r].id});var i=[],o=Object.keys(s),c=["Name"];for(r=0;r<t.length;r++)c.push(t[r].name);for(r=0;r<o.length;r++){for(var l={},u=0;u<n.length;u++)if(n[u].id===parseInt(o[r])){l.name="".concat(n[u].first_name," ").concat(n[u].last_name),l.studentID=n[u].id;break}l.time=s[o[r]].time,l.activities={};for(u=0;u<t.length;u++)l.activities[t[u].name]={value:!!s[o[r]][t[u].activity_id],activityID:t[u].activity_id,attendanceItemID:s[o[r]][t[u].activity_id]?s[o[r]][t[u].activity_id].itemID:0};i.push(l)}this.setState({attendance:i})}},{key:"addStudent",value:function(e,t){for(var a=this.state,n=a.students,s=a.attendance,r=a.activities,i=new Date,o=this,c=0;c<s.length;c++)if(parseInt(t)===s[c].studentID)return;T("http://".concat(L,"/api/attendance/"),{student_id:t,activity_id:7,date:"".concat(i.getFullYear(),"-").concat(i.getMonth()+1,"-").concat(i.getDate()),time:"".concat(i.getHours(),":").concat(i.getMinutes()>10?i.getMinutes():"0".concat(i.getMinutes()),":").concat(i.getSeconds()>10?i.getSeconds():"0".concat(i.getSeconds()))}).then(function(e){for(var a="",i=0;i<n.length;i++)if(n[i].id===parseInt(t)){a="".concat(n[i].first_name," ").concat(n[i].last_name);break}var c={};for(i=0;i<r.length;i++)c[r[i].name]={activityID:r[i].activity_id,attendanceItemID:0,value:!1};c.Key.value=!0,c.Key.attendanceItemID=e.id;var l={name:a,studentID:parseInt(t),time:e.time,activities:c};s.push(l),o.setState({attendance:s})})}},{key:"makeSuggestionsArray",value:function(e){var t,a,n,s=[];for(var r in e)e[r].last_name.includes(" ")?(t=(n=e[r].last_name.split(" "))[0],a=n[1]):(t=e[r].last_name,a=""),s.push({firstName:e[r].first_name,lastName1:t,lastName2:a,id:e[r].id});return s}},{key:"downloadCSV",value:function(){var e=new Date;this.setState({buildingCSV:!0}),function(e){W.apply(this,arguments)}("".concat(e.getFullYear(),"-").concat(e.getMonth()+1,"-").concat(e.getDate())),this.setState({buildingCSV:!1})}},{key:"removeAttendanceRow",value:function(e){for(var t=this.state.attendance,a=0;a<t.length;a++)t[a].studentID===e&&t.splice(a,1);this.setState({attendance:t})}},{key:"openModal",value:function(){this.setState({showStudentModal:!0})}},{key:"closeModal",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=this.state.students,a=[];null!==e&&(t.push({first_name:e.first_name,last_name:e.last_name,id:e.id}),a=this.makeSuggestionsArray(t),this.addStudent(null,e.id)),this.setState({showStudentModal:!1,students:t,suggestions:a})}},{key:"render",value:function(){var e=this.state.attendance.map(function(e){return{name:e.name,time:e.time,activities:e.activities,studentID:e.studentID}}).sort(function(e,t){return t.time.localeCompare(e.time)}),t=[{accessor:"name",label:"Name",priorityLevel:1,position:1,minWidth:100,sortable:!0},{accessor:"time",label:"Check-in Time",priorityLevel:2,position:2,minWidth:100,sortable:!0},{accessor:"options",label:"Options",priorityLevel:3,position:3,CustomComponent:z,sortable:!1,minWidth:100},{accessor:"activities",label:"Activities",priorityLevel:4,position:4,minWidth:2e3,CustomComponent:Y,sortable:!1}],a=this.state.buildingCSV,n=new Date;return s.a.createElement("div",{className:"content"},s.a.createElement($,{show:this.state.showStudentModal,onSubmit:this.closeModal}),s.a.createElement("h1",null,"Attendance for ",n.getMonth()+1,"-",n.getDate(),"-",n.getFullYear()),s.a.createElement("br",null),s.a.createElement(Z.a,{style:{float:"right"}},s.a.createElement(O.a,{onClick:this.openModal},"New Student"),s.a.createElement(O.a,{onClick:this.downloadCSV,disabled:a},a?"Downloading...":"Download")),s.a.createElement(X,{suggestions:this.state.suggestionsArray,handler:this.addStudent}),s.a.createElement("br",null),s.a.createElement(K.a,{rows:e,columns:t,column:"time",direction:"descending",showPagination:!0,callbacks:{options:this.removeAttendanceRow}}))}}]),t}(s.a.Component),te=function(e){function t(e){var a;return Object(o.a)(this,t),(a=Object(l.a)(this,Object(u.a)(t).call(this,e))).state={mode:"search",studentsJson:{},suggestionsArray:[],id:null,profileData:{}},a.handler=a.handler.bind(Object(C.a)(Object(C.a)(a))),a}return Object(d.a)(t,e),Object(c.a)(t,[{key:"componentDidMount",value:function(){var e=Object(x.a)(_.a.mark(function e(){var t,a;return _.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,F("http://".concat(L,"/api/students/"));case 3:t=e.sent,a=this.makeSuggestionsArray(t),this.setState(function(e,n){return{mode:"search",studentsJson:t,suggestionsArray:a,id:null,profileData:{}}}),e.next=11;break;case 8:e.prev=8,e.t0=e.catch(0),console.log(e.t0);case 11:case"end":return e.stop()}},e,this,[[0,8]])}));return function(){return e.apply(this,arguments)}}()},{key:"makeSuggestionsArray",value:function(e){var t,a,n,s=[];for(var r in e)e[r].last_name.includes(" ")?(t=(n=e[r].last_name.split(" "))[0],a=n[1]):(t=e[r].last_name,a=""),s.push({firstName:e[r].first_name,lastName1:t,lastName2:a,id:e[r].id});return s}},{key:"handler",value:function(e,t){var a={mode:"display",id:t};this.getStudentProfile(a)}},{key:"getStudentProfile",value:function(){var e=Object(x.a)(_.a.mark(function e(t){var a;return _.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,F("http://".concat(L,"/api/students/?id=")+t.id);case 3:a=e.sent,t.profileData=a,this.setState(function(e,a){return t}),e.next=11;break;case 8:e.prev=8,e.t0=e.catch(0),console.log(e.t0);case 11:case"end":return e.stop()}},e,this,[[0,8]])}));return function(t){return e.apply(this,arguments)}}()},{key:"render",value:function(){return"search"===this.state.mode?s.a.createElement("div",{className:"content"},s.a.createElement("h1",null," Key Students "),s.a.createElement("div",{className:"container-fluid no-padding"},s.a.createElement("div",{className:"row justify-content-start"},s.a.createElement("div",{className:"col-md-12 to-front top-bottom-padding"},s.a.createElement(X,{suggestions:this.state.suggestionsArray,handler:this.handler}))))):"display"===this.state.mode?s.a.createElement("div",{className:"content"},s.a.createElement("h1",null," Student Profile "),s.a.createElement("div",{className:"container-fluid no-padding"},s.a.createElement("div",{className:"row justify-content-start"},s.a.createElement("div",{className:"col-md-4 to-front top-bottom-padding"},s.a.createElement(X,{suggestions:this.state.suggestionsArray,handler:this.handler})),s.a.createElement("div",{className:"col-md-8 top-bottom-padding"},"Name: ",this.state.profileData.first_name," ",this.state.profileData.last_name," ",s.a.createElement("br",null),"ID: ",s.a.createElement(H.a,null,"N/A")," ",s.a.createElement("br",null),"Birthday: xx/xx/xxxx ",s.a.createElement("br",null),"Nickname: N/A ",s.a.createElement("br",null),"Gender: N/A ",s.a.createElement("br",null),"First Attendance: ",this.state.profileData.first_attendance," ",s.a.createElement("br",null),"Number of Visits: ",this.state.profileData.number_visits," ",s.a.createElement("br",null))))):void 0}}]),t}(n.Component),ae=function(e){function t(){return Object(o.a)(this,t),Object(l.a)(this,Object(u.a)(t).apply(this,arguments))}return Object(d.a)(t,e),Object(c.a)(t,[{key:"render",value:function(){return s.a.createElement("div",{className:"content"},s.a.createElement("p",null,"Reports"))}}]),t}(s.a.Component),ne=function(e){function t(){return Object(o.a)(this,t),Object(l.a)(this,Object(u.a)(t).apply(this,arguments))}return Object(d.a)(t,e),Object(c.a)(t,[{key:"render",value:function(){return s.a.createElement("div",{className:"content"},s.a.createElement("p",null,"Admin"))}}]),t}(s.a.Component),se=function(e){function t(){return Object(o.a)(this,t),Object(l.a)(this,Object(u.a)(t).apply(this,arguments))}return Object(d.a)(t,e),Object(c.a)(t,[{key:"render",value:function(){return s.a.createElement("div",{className:"content"},s.a.createElement("p",null,"Alerts"))}}]),t}(s.a.Component),re=a(182),ie=a(181),oe=function(e){function t(){return Object(o.a)(this,t),Object(l.a)(this,Object(u.a)(t).apply(this,arguments))}return Object(d.a)(t,e),Object(c.a)(t,[{key:"render",value:function(){return s.a.createElement("div",{className:"content"},s.a.createElement(ie.a,null,s.a.createElement("div",{className:"content-jumbotron"},s.a.createElement("h1",null,"404 ",s.a.createElement("small",null,"page not found")),s.a.createElement("p",null,"The page you're looking for has mysteriously disappeared! Try navigating from ",s.a.createElement(re.a,{to:"/attendance"},"the home page")," to take another look."))))}}]),t}(s.a.Component),ce=function(e){function t(){return Object(o.a)(this,t),Object(l.a)(this,Object(u.a)(t).apply(this,arguments))}return Object(d.a)(t,e),Object(c.a)(t,[{key:"render",value:function(){return s.a.createElement(k,{show:"/"!==this.props.location.pathname},s.a.createElement(h.a,null,s.a.createElement(m.a,{exact:!0,path:"/",component:J}),s.a.createElement(m.a,{exact:!0,path:"/attendance",render:function(){return B(ee)}}),s.a.createElement(m.a,{path:"/students",component:function(e){return B(te)}})," ",s.a.createElement(m.a,{path:"/reports",render:function(){return B(ae)}}),s.a.createElement(m.a,{path:"/admin",render:function(){return B(ne)}}),s.a.createElement(m.a,{path:"/alerts",render:function(){return B(se)}}),s.a.createElement(m.a,{render:function(){return B(oe)}})))}}]),t}(s.a.Component),le=Object(p.a)(ce),ue=function(e){function t(){return Object(o.a)(this,t),Object(l.a)(this,Object(u.a)(t).apply(this,arguments))}return Object(d.a)(t,e),Object(c.a)(t,[{key:"render",value:function(){return s.a.createElement("div",null,s.a.createElement(le,{history:M}))}}]),t}(n.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));var de=a(188);i.a.render(s.a.createElement(de.a,null,s.a.createElement(ue,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})},86:function(e,t,a){e.exports=a(168)},91:function(e,t,a){}},[[86,2,1]]]);
//# sourceMappingURL=main.5c01ed52.chunk.js.map