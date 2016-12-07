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

    componentWillUnmount() {
        if (this.unregister) {
            this.unregister();
        }
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
            var movieObject = snapshot.val();
            var movieId;
            var recommended;
            if (movieObject != null && Object.keys(movieObject).length > 0) {
                var movieIdArray = Object.keys(movieObject);
                var randNum = _.random(movieIdArray.length - 1);
                movieId = movieIdArray[randNum];
                RecommendedController.search(movieId)
                    .then((data) => {
                        var movies = data.results.slice(1,7);
                        recommended = data.results[0];
                        this.setState({ movieData: movies, recommended:recommended.id });
                        Controller.getMovieDetails(this.state.recommended)
                            .then((data) => {
                                this.setState({ movie: data });
                            });

                        Controller.getMovieTrailer(this.state.recommended)
                            .then((data) => {
                                var trailer = data.results.filter((trailer) => {
                                    return trailer.type == 'Trailer';
                                });
                                this.setState({ trailer: trailer[0] });
                            });

                        Controller.getMovieCredits(this.state.recommended)
                            .then((data) => {
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
        }
        if (this.state.movie && this.state.cast && this.props.user && this.state.trailer) {
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