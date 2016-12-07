import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Router, Route, hashHistory, IndexRoute } from 'react-router';
import SignInForm from './SignIn';
import SignUpForm from './SignUp';
import Watchlist from './WatchList';
import RecommendedMovie from'./Recommended';
import AdvancedSearch from './AdvancedSearch';
import Movies from './Movies';
import Landing from './Landing';
import firebase from 'firebase';

import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import './index.css';



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
    <Route path="/landing" component={Landing} />
    <Route path="/" component={App}>
      <IndexRoute component={Watchlist} />
      <Route path="home" component={RecommendedMovie} />
      <Route path="watchlist" component={Watchlist} />
      <Route path="advanced" component={AdvancedSearch} />
      <Route path="/movie/:movieId" component={Movies} />
    </Route>
    <Route path="join" component={SignUpForm} />
    <Route path="login" component={SignInForm} />
  </Router>,
  document.getElementById('root')
);


