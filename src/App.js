import React, { Component } from 'react';
import './App.css';
import {Layout, Header, Navigation, Drawer, Content} from 'react-mdl';
import { Link, hashHistory } from 'react-router';
import SignIn from './SignIn';


class App extends Component {
  render() {
    return (
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
