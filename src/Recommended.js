import React, { Component } from 'react';
import firebase from 'firebase';
import { Link, hashHistory } from 'react-router';
import RecommendedController from './RecommendedController';
import { MovieData } from './WatchList'

class RecommendedMovie extends Component {
    constructor(props) {
    super(props);
    this.state = {};
    this.fetchData = this.fetchData.bind(this);
}

    fetchData(id) {
        var thisComponent = this;
        var movies = [];
        RecommendedController.search(id)
            .then((data) => {
                console.log(data);
                movies = data.results.slice(0, 5);
                console.log(movies);
                thisComponent.setState({ movieData: movies })
            })
            .catch((err) => console.log(err));
    }

    signOut() {
        firebase.auth().signOut()
        hashHistory.push('login');
    }


    render() {
        console.log('hello');
        var content = null;
        if(this.state.movieData) {
            content = <DisplayRecommendedMovies searchMovies={this.state.movieData} />
        }
        return (
            <div>
                <button className="btn btn-primary" onClick={() => this.signOut()}>Log Out</button>
                <RecommendedMovieData fetchCallback={this.fetchData} />
                {content}
                <MovieData />
            </div>
        )
    }
}

class RecommendedMovieData extends Component {
    constructor(props) {
        super(props);
        this.state = {} 
    }
    componentDidMount() {
        var favoritesRef = firebase.database().ref('users/'+ firebase.auth().currentUser.uid + '/Favorited');
        favoritesRef.once('value', (snapshot) => {
            console.log('1');
            var movieObject = snapshot.val();
            var movieIdArray = Object.keys(movieObject);
            var randNum = Math.random(0, movieIdArray.length - 1);
            console.log(movieIdArray[0]);
            this.props.fetchCallback(movieIdArray[0]);
        })
    }
    render() {
        return (
            <div>
            </div>
        );
    }
}

class DisplayRecommendedMovies extends Component {
    render() {
        var movierow = this.props.searchMovies.map((movie) => {
            return <Link to={'movie/' + movie.id}><img src={'https://image.tmdb.org/t/p/original/' + movie.poster_path} role='presentation' /></Link>;
        })
        return (
            <div className="imgSection">
                {movierow}
            </div>
        )
    }
}



export default RecommendedMovie;