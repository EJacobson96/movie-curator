import React, { Component } from 'react';
import firebase from 'firebase';
import { Link, hashHistory } from 'react-router';
import { Grid, Cell } from 'react-mdl';
import RecommendedController from './RecommendedController';
import NowPlayingController from './NowPlayingController';
import { MovieData, MovieCard } from './WatchList';
import _ from 'lodash';

class RecommendedMovie extends Component {
    constructor(props) {
        super(props);
        this.state = {};

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


    signOut() {
        firebase.auth().signOut()
        hashHistory.push('login');
    }


    render() {
        console.log('hello');

        var content = null;
        if (this.state.user) {
            content = <DisplayRecommendedMovies user={this.state.user} />;
        }
        return (
            <div>
                {content}
            </div>
        )
    }
}


class DisplayRecommendedMovies extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {     
        NowPlayingController.search()
            .then((data) => {
                var movies = data.results.slice(1, 7);
                var top = data.results[0];
                this.setState({ movieData: movies, top: top });
            })
    }

    render() {
        var topMovie = [];
        if (this.state.top && this.props.user) {
            topMovie = <MovieCard user={this.props.user} MoviePoster={this.state.top.poster_path} MovieOverview={this.state.top.overview} MovieTitle={this.state.top.original_title} MovieId={this.state.top.id} />;
        }
        var movieRow = <p>Please add some movies to your favorites first!</p>;
        if (this.state.movieData) {
            movieRow = this.state.movieData.map((movie) => {
                return (
                    <Cell col={2} phone={12} tablet={3}>
                        <Link to={'movie/' + movie.id}><img className="responsive-img" src={'https://image.tmdb.org/t/p/original/' + movie.poster_path} role='presentation' />
                        </Link>
                    </Cell>
                );
            });
        }
        return (
            <div>
                <Grid>
                    <Cell col={7}>
                        <h1>Featured Movie of the Day</h1>
                        {topMovie}
                    </Cell>
                    <Cell col={5}>
                        <MovieData />
                    </Cell>
                </Grid>
                <h1>Other Suggestions</h1>
                <div className="recommendedMovieList">
                    <Grid>
                        {movieRow}
                    </Grid>
                </div>
            </div >
        )
    }
}



export default RecommendedMovie;