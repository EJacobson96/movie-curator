import React, { Component } from 'react';
import firebase from 'firebase';
import { Link, hashHistory } from 'react-router';
import RecommendedController from './RecommendedController';
import Controller from './DataController';
import { DetailedMovieCard }  from './Movies';
import _ from 'lodash';
import { Grid, Cell, List, ListItem } from 'react-mdl';

class RecommendedMoviePage extends Component {
    constructor(props) {
        super(props);
        this.state= {};
    }
    componentDidMount() {
        this.unregister = firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.setState({
                    user: firebaseUser
                });
            } else {
                hashHistory.push('/login');
            }
        });
    }

    render () {
        var content = <p>Please add some movies to your favorites first!</p>;
        if (this.state.user) {
            content = <RecommendedMovies user={this.state.user} />
        }
        return (
            <div>
                {content}
            </div>
        )
    }
}

class RecommendedMovies extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
        var favoritesRef = firebase.database().ref('users/' + this.props.user.uid + '/Favorited');
        favoritesRef.on('value', (snapshot) => {
            console.log('recommended snapshot', snapshot.val());
            var movieObject = snapshot.val();
            var randNum = 0;
            var movieId = 0;
            var recommended = 0;
            if (movieObject != null) {
                var movieIdArray = Object.keys(movieObject);
                randNum = _.random(0, movieIdArray.length - 1);
                movieId = movieIdArray[randNum];
                RecommendedController.search(movieId)
                    .then((data) => {
                        console.log(data);
                        var movies = data.results.slice(1,7);
                        recommended = data.results[0];
 
                        this.setState({ movieData: movies, recommended:recommended.id });
                        console.log(this.state.recommended);
                        Controller.getMovieDetails(this.state.recommended)
                            .then((data) => {
                                console.log('im going in 1 ');
                                this.setState({ movie: data });
                            });

                        Controller.getMovieTrailer(this.state.recommended)
                            .then((data) => {
                                console.log('im going in 2');
                                var trailer = data.results.filter((trailer) => {
                                    return trailer.type == 'Trailer';
                                });
                                this.setState({ trailer: trailer[0] });
                            });

                        Controller.getMovieCredits(this.state.recommended)
                            .then((data) => {
                                console.log('im going in 3');
                                this.setState({ cast: data.cast });
                            });
                    })
                    .catch((err) => console.log(err));
            } 

        });
    }
    render() {
        var topMovie = <p>Please add some movies to your favorites first!</p>;
        if (this.state.movie && this.state.cast && this.props.user && this.state.trailer) {
            console.log(true);
        }
        if (this.state.movie && this.state.cast && this.props.user && this.state.trailer) {
            console.log('im going in 4');
            topMovie = <DetailedMovieCard cast={this.state.cast} movie={this.state.movie} user={this.props.user} trailer={this.state.trailer} />;
        }
        var movieRow = null;
        if (this.state.movieData) {
            movieRow = this.state.movieData.map((movie) => {
                return (
                    <Cell col={2}>
                        <Link to={'movie/' + movie.id}><img className="responsive-img" src={'https://image.tmdb.org/t/p/original/' + movie.poster_path} role='presentation' />
                        </Link>
                    </Cell>
                );
            });
        }
        return (
            <div className="moviePage">
                <h1>Movie Details</h1>
                {topMovie}
                <h1>Other Recommendations</h1>
                <div className="recommendedMovieList">
                    <Grid>
                        {movieRow}
                    </Grid>
                </div>
            </div>
        )
    }
}

export default RecommendedMoviePage;