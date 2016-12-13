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

    //download data from the url
    advancedSearch: function (title, year, genre) {

        var searchURL = '';
        var Searchresource = '3/search/movie';
        var discover = '/discover/movie';
        var details = '&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false';
        var addYear = '&primary_release_year=';
        var addGenre = '&with_genres=';

        // if searching by title (not including genre)
        if (title) {
            searchURL = baseApiUrl + Searchresource + '?api_key=' + ApiKey + '&query=' + title + '&include_adult=false';
            if (year) {  // if searching by title and year released.. add year to search url 
                addYear += year;
                searchURL += addYear;
            }
        }
        // if searching by genre (no title)
        if (genre && !title) {
            searchURL = baseApiUrl + discover + '?api_key=' + ApiKey + details + addGenre + genre;
            if (year) {  // if searching by genre and year only 
                addYear += year;
                searchURL = baseApiUrl + discover + '?api_key=' + ApiKey + details + addYear + addGenre + genre;
            }
        }
        // search by year only 
        if (year && !title && !genre) {
            searchURL = baseApiUrl + discover + '?api_key=' + ApiKey + details + addYear + year;
        }

        console.log("fetching", searchURL);

        return fetch(searchURL) //download the data
            .then(function (res) { return res.json(); })
    },

    getNowPlaying: function() {
        var resource = '3/movie/now_playing?api_key=' + ApiKey + '&language=en-US&page=1';
        var uri = baseApiUrl + resource;

        return fetch(uri)
            .then((response) => {
                return response.json();
            })

    },

    getRecommended: function(movieId) {
        var resource = '3/movie/' + movieId + '/recommendations?api_key=' + ApiKey + '&language=en-US&page=1';
        var uri = baseApiUrl + resource;

        return fetch(uri)
            .then((response) => {
                return response.json();
            })

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
    getMovieTrailer: function (movieId) {
        var resource = '3/movie/' + movieId + '/videos?api_key=' + ApiKey;
        var uri = baseApiUrl + resource;

        return fetch(uri)
            .then((response) => {
                return response.json();
            }).catch((err) => console.log(err));
    },

    // Gets the credit data for a given movie
    //  pre: takes in a movie is as a string
    getMovieCredits: function (movieId) {
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