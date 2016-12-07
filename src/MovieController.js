//TMDB constants (https://developers.themoviedb.org/3/getting-started)
var apiKey = "d37398a8fa01ed9f121f9074b614e320";
var baseApiUrl = "https://api.themoviedb.org/3";

// used to search for movies in API
var controller = {

  //download data from the url
  search: function(title, year, genre) {

    var searchURL = '';
    var Searchresource = '/search/movie';
    var discover = '/discover/movie';
    var details = '&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false';
    var addYear = '&primary_release_year=';
    var addGenre = '&with_genres=';

    // if searching by title (not including genre)
    if (title ) {
        searchURL =  baseApiUrl + Searchresource + '?api_key='+apiKey + '&query='+ title + '&include_adult=false';
        if (year){  // if searching by title and year released.. add year to search url 
            addYear += year;
            searchURL += addYear; 
        }
    }
    // if searching by genre (no title)
    if (genre && !title){
        searchURL = baseApiUrl + discover + '?api_key='+apiKey + details + addGenre + genre;
        if (year){  // if searching by genre and year only 
            addYear += year;
            searchURL = baseApiUrl + discover + '?api_key='+apiKey + details + addYear + addGenre + genre;
        }
    }
    // search by year only 
    if (year && !title && !genre){
        searchURL = baseApiUrl + discover + '?api_key='+apiKey + details + addYear + year;
    }
   
     console.log("fetching", searchURL);

    return fetch(searchURL) //download the data
      .then(function(res) { return res.json(); })
  }
};

export default controller; //export object