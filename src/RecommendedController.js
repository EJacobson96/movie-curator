var baseApiUrl = 'https://api.themoviedb.org/';
var ApiKey = 'e5a950c4e6cdc4d9f08e95bd4bd1b68e';

var controller = {

    search: function(movieId) {
        var resource = '3/movie/' + movieId + '/recommendations?api_key=' + ApiKey + '&language=en-US&page=1';
        var uri = baseApiUrl + resource;

        return fetch(uri)
            .then((response) => {
                return response.json();
            })

    }


};

export default controller;