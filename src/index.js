import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Router, Route, hashHistory, IndexRoute } from 'react-router';
import SignInForm from './Components/SignIn';
import SignUpForm from './Components/SignUp';
import Watchlist from './Components/Watchlist';
import Home from'./Components/Home';
import AdvancedSearch from './Components/AdvancedSearch';
import Movies from './Components/Movies';
import Landing from './Components/Landing';
import Start from './Start';
import RecommendedMoviePage from './Components/RecommendedMoviesPage';
import firebase from 'firebase';

// import styles
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

// Set up the routing for the website
ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="start" component={Start}>
      <IndexRoute component={Landing} />    
      <Route path="/join" component={SignUpForm} />
      <Route path="/login" component={SignInForm} />
    </Route>
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="home" component={Home} />
      <Route path="recommended" component={RecommendedMoviePage} />
      <Route path="watchlist" component={Watchlist} />
      <Route path="search" component={AdvancedSearch} />
      <Route path="/movie/:movieId" component={Movies} />
    </Route>
    
  </Router>,
  document.getElementById('root')
);


