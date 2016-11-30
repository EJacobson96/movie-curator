import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { Router, Route, hashHistory } from 'react-router';
<<<<<<< HEAD
=======
import SignIn from './SignIn';

>>>>>>> f08db79d544d1a881abfc5faa990ee542c14b3f1
import firebase from 'firebase';

import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';
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
<<<<<<< HEAD

=======
      <Route path="login" component={SignIn} />
>>>>>>> f08db79d544d1a881abfc5faa990ee542c14b3f1
    </Route>
  </Router>,
  document.getElementById('root')
);
