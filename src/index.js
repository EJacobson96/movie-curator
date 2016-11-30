import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { Router, Route, hashHistory } from 'react-router';

import firebase from 'firebase';
import 'bootstrap/dist/css/bootstrap.css';


// Initialize Firebase
  var config = {
    apiKey: "AIzaSyBeR0rvkB8aPUDIOBoxxDOlb2joYapzSA0",
    authDomain: "movie-curator.firebaseapp.com",
    databaseURL: "https://movie-curator.firebaseio.com",
    storageBucket: "movie-curator.appspot.com",
    messagingSenderId: "462576352543"
  };
  firebase.initializeApp(config);

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <Route path="list" component={DogList} />
    </Route>
  </Router>,
  document.getElementById('root')
);
