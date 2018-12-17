import React, { Component } from 'react';
import Router from './components/Router';
import { history } from './components/Helpers'

class App extends Component {
  render() {
    return (
      <div>
        <Router history={history}/>
      </div>
    );
  }
}

export default App;
