import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; //import our component

var baseApiUrl = 'https://api.themoviedb.org/';
var ApiKey = 'e5a950c4e6cdc4d9f08e95bd4bd1b68e';

var controller = {

    search: function (search) {
        var resource = '3/search/movie?language=en-US&include_adult=false&api_key=' + ApiKey + '&query=' + search;
        var uri = baseApiUrl + resource;

        return fetch(uri)
            .then((response) => {
                return response.json();
            }).catch((err) => console.log(err));
    },

    getMovieDetails: function (movieId) {
        var resource = '3/movie/' + movieId + '?api_key=' + ApiKey;
        var uri = baseApiUrl + resource;

        return fetch(uri)
            .then((response) => {
                return response.json();
            }).catch((err) => console.log(err));
    },

    getMovieTrailer: function(movieId) {
        var resource = '3/movie/' + movieId + '/videos?api_key=' + ApiKey;
        var uri = baseApiUrl + resource;

        return fetch(uri)
            .then((response) => {
                return response.json();
            }).catch((err) => console.log(err));
    },

    getMovieCredits: function(movieId) {
        var resource = '3/movie/' + movieId + '/credits?api_key=' + ApiKey;
        var uri = baseApiUrl + resource;

        return fetch(uri)
            .then((response) => {
                return response.json();
            }).catch((err) => console.log(err));
    }


};

export default controller;