import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { Router, Route, hashHistory, IndexRoute } from 'react-router';
import SignInForm from './SignIn';
import SignUpForm from './SignUp';
import Watchlist from './WatchList';
import RecommendedMovie from'./Recommended';
import AdvancedSearch from './AdvancedSearch';
import firebase from 'firebase';

import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';


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
      <Route path="home" component={RecommendedMovie} />
      <Route path="watchlist" component={Watchlist} />
      <Route path="advancedsearch" component={AdvancedSearch} />
    </Route>
    <Route path="join" component={SignUpForm} />
    <Route path="login" component={SignInForm} />
  </Router>,
  document.getElementById('root')
);


