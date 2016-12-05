import React, { Component } from 'react';
import firebase from 'firebase';
import { Link, hashHistory } from 'react-router';
import { Grid, Cell } from 'react-mdl';
import RecommendedController from './RecommendedController';
import { MovieData, MovieCard } from './WatchList'
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

        // var favoritesRef = firebase.database().ref('users/' + this.props.user.uid + '/Favorited');
        // favoritesRef.on('value', (snapshot) => {
        //     console.log('recommended snapshot', snapshot.val());
        //     var movieObject = snapshot.val();
        //     var movieIdArray = Object.keys(movieObject);
        //     var randNum = Math.random(0, movieIdArray.length - 1);
        //     var movieId = movieIdArray[0];
        //     this.fetchData(movieId);
        // });
    }

    // fetchData(id) {
    //     RecommendedController.search(id)
    //         .then((data) => {
    //             var movies = data.results.slice(0, 5);
    //             this.setState({ movieData: movies })
    //         })
    //         .catch((err) => console.log(err));
    // }

    signOut() {
        firebase.auth().signOut()
        hashHistory.push('login');
    }


    render() {
        console.log('hello');

        var content = <p>Please add some movies to your favorites first!</p>;
        if (this.state.user) {
            content = <DisplayRecommendedMovies user={this.state.user} />;
        }
        return (
            <div>
                {content}
                <MovieData />
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
        var favoritesRef = firebase.database().ref('users/' + this.props.user.uid + '/Favorited');
        favoritesRef.on('value', (snapshot) => {
            console.log('recommended snapshot', snapshot.val());
            var movieObject = snapshot.val();
            var movieIdArray = Object.keys(movieObject);
            var randNum = 0;
            var movieId = 0;
            if (movieIdArray.length > 0) {
                randNum = _.random(0, movieIdArray.length - 1)
                movieId = movieIdArray[randNum];
                console.log(randNum);
            } else {

            }

            RecommendedController.search(movieId)
                .then((data) => {
                    console.log(data);
                    var top = data.results.slice(0,1);
                    var movies = data.results.slice(0, 5);
                    console.log('top first', this.state.top);
                    this.setState({ movieData: movies, top: top })
                })
                .catch((err) => console.log(err));
        });
    }

    render() {
        var topMovie = [];
        console.log('top 2', this.state.top);
        if (this.state.top) {
            // console.log('setting top');
            // console.log('top again', this.state.top);
            // topMovie = <MovieCard MoviePoster={this.state.top.poster_path} MovieOverview={this.state.top.overview} MovieTitle={this.state.top.original_title} MovieId={this.state.top.id} />;
        }
        var movieRow = <p>Please add some movies to your favorites first!</p>;
        if (this.state.movieData && this.state.user) {
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
            <div>
                {topMovie}
                <div className="imgSection">
                    <Grid>
                        {movieRow}
                    </Grid>
                </div>
            </div>
        )
    }
}



export default RecommendedMovie;