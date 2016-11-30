import React, { Component } from 'react';
import './App.css';
import {Layout, Header, Navigation, Drawer, Content} from 'react-mdl';
import { Link, hashHistory } from 'react-router';
import SignIn from './SignIn';


class App extends Component {
  render() {
    return (
      // <div className="App">
      //   <div className="App-header">
      //     <img src={logo} className="App-logo" alt="logo" />
      //     <h2>Welcome to React</h2>
      //   </div>
      //   <p className="App-intro">
      //     To get started, edit <code>src/App.js</code> and save to reload.
      //   </p>
      // </div>
      <div>
          <Layout fixedDrawer>
              <Drawer title="The Movie Curator">
                  <Navigation>
                      <Link href="">Home</Link>
                      <Link href="">Recommended Movies</Link>
                      <Link href="">Movie Watchlist</Link>
                      <Link href="">Search For Movies</Link>
                  </Navigation>
              </Drawer>
              <Content />
          </Layout>
      </div>
    );
  }
}

export default App;
