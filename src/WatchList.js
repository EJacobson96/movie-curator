import React, { Component } from 'react';
import Controller from './DataController';
import firebase from 'firebase';

class WatchList extends Component {
    render () {
        return (
            <div>
                <MovieData userInput='Arrival' /> 
            </div>
        )
    }
}

class MovieData extends Component {
    constructor(props) {
        super(props);
        this.state = {movieData:[]}
        this.fetchData = this.fetchData.bind(this);
    }

    fetchData(searchTerm) {
        var thisComponent = this;
        var movies = [];
        Controller.search(searchTerm)
        .then((data) => {
            movies = data.results.splice(0,5);
            thisComponent.setState({movieData:movies})
        })
        .catch((err) => console.log(err));
    }
    
    render() {
        return (
            <div>
                <Movies fetchData={this.fetchData(this.props.userInput)} searchMovies={this.state.movieData} />
            </div>
        );
    }
}

class Movies extends Component {

    render() {
        var movierow = this.props.searchMovies.map(function(movie) {
            return <MovieCard movie={movie} key={movie.id} />;
        })
        return (
            <div> 
                {movierow}
            </div>
        );
    }
}

class MovieCard extends Component {
    saveMovie(poster, title, overview) {
        var moviesRef = firebase.database().ref('movies'); //the messages in the JOITC
        var newMovie = {
            MoviePoster: poster,
            MovieTitle: title,
            MovieOverview: overview
        };
        moviesRef.push(newMovie); //upload
    }

    render() {
        return (
            <div className="movieCard">
                <div className="imgSection"><img src={'https://image.tmdb.org/t/p/original/' + this.props.movie.poster_path} role='presentation'/></div>
                <div className="cardSection">
                    <h2>{this.props.movie.original_title}</h2>
                    <p>{this.props.movie.overview}</p>    
                    <button className="btn btn-primary" onClick={()=> this.saveMovie(this.props.movie.poster_path, this.props.movie.original_title, this.props.movie.overview)}><p>Watch Later</p><i className="material-icons">add_to_queue</i></button>             
                </div>
            </div>
        );
    }
}

export default WatchList;