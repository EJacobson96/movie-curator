import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; //import our component

// Base Api url and unique API key for TMDB
var baseApiUrl = 'https://api.themoviedb.org/';
var ApiKey = 'e5a950c4e6cdc4d9f08e95bd4bd1b68e';

// Controller object for fetching data from The Movie Database API
var controller = {

    // Search for a movie based on the given search query
    //  pre: takes in a search query as a string
    search: function (search) {
        var resource = '3/search/movie?language=en-US&include_adult=false&api_key=' + ApiKey + '&query=' + search;
        var uri = baseApiUrl + resource;

        return fetch(uri)
            .then((response) => {
                return response.json();
            }).catch((err) => console.log(err));
    },

    // Gets more detailed information for a given movie
    //  pre: takes in a movie id as a string
    getMovieDetails: function (movieId) {
        var resource = '3/movie/' + movieId + '?api_key=' + ApiKey;
        var uri = baseApiUrl + resource;

        return fetch(uri)
            .then((response) => {
                return response.json();
            }).catch((err) => console.log(err));
    },

    // Gets the data for movie trailers for a given movie
    //  pre: takes in a movie id as a string
    getMovieTrailer: function(movieId) {
        var resource = '3/movie/' + movieId + '/videos?api_key=' + ApiKey;
        var uri = baseApiUrl + resource;

        return fetch(uri)
            .then((response) => {
                return response.json();
            }).catch((err) => console.log(err));
    },

    // Gets the credit data for a given movie
    //  pre: takes in a movie is as a string
    getMovieCredits: function(movieId) {
        var resource = '3/movie/' + movieId + '/credits?api_key=' + ApiKey;
        var uri = baseApiUrl + resource;

        return fetch(uri)
            .then((response) => {
                return response.json();
            }).catch((err) => console.log(err));
    }


};

// export the controller so it's available in other classes
export default controller;