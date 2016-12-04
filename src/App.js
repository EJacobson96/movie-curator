import React, { Component } from 'react';
import './App.css';
import { Layout, Header, Navigation, Drawer, Content, Dialog, DialogActions, DialogContent, DialogTitle, Button } from 'react-mdl';
import { Link, hashHistory } from 'react-router';
import SignIn from './SignIn';
import Inbox from './Inbox';
import firebase from 'firebase';


import Controller from './DataController'

import 'whatwg-fetch';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { openInbox: true };

    this.handleOpenInbox = this.handleOpenInbox.bind(this);
    this.handleCloseInbox = this.handleCloseInbox.bind(this);
  }

  componentDidMount() {
    this.unregister = firebase.auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        this.setState({
          userId: firebaseUser.uid
        });
      } else {
        hashHistory.push('/login');
      }
    });
  }

  componentWillUnmount() {
    if(this.unregister) {
      this.unregister();
    }
  }

  handleOpenInbox() {
    this.setState({ openInbox: true });
  }

  handleCloseInbox() {
    this.setState({ openInbox: false });
  }


  render() {
    console.log('user on app', this.state.userId);
    return (
      <div>
        <Layout fixedDrawer>
          <Drawer title="The Movie Curator">
            <Navigation>
              <Link href="">Home</Link>
              <Link href="">Recommended Movies</Link>
              <Link href="">Movie Watchlist</Link>
              <Link href="">Search For Movies</Link>
              <Link onClick={() => { this.handleOpenInbox() } }>Inbox</Link>
            </Navigation>
          </Drawer>
          <Content>
            {this.props.children}
          </Content>
        </Layout>
        <Dialog open={this.state.openInbox}>
          <DialogTitle>Inbox</DialogTitle>
          <DialogContent>
            <Inbox userId={this.state.userId} />
          </DialogContent>
          <DialogActions>
            <Button type='button' onClick={this.handleCloseInbox}>Close</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default App;
