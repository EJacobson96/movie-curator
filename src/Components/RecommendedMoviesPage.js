import React, { Component } from 'react';
import firebase from 'firebase';
import { Link, hashHistory } from 'react-router';
import DataController from '../DataController';
import Controller from '../DataController';
import { DetailedMovieCard } from './Movies';
import _ from 'lodash';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Grid, Cell, List, ListItem } from 'react-mdl';


// Uses the favorited movies of user and displays a similar movie from that data
class RecommendedMoviePage extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.handleOpenDialog = this.handleOpenDialog.bind(this);
        this.handleCloseDialog = this.handleCloseDialog.bind(this);
    }

    //handles whether the message box should be open
    handleOpenDialog() {
        this.setState({
            openDialog: true,
        });
    }

    //handles whether the message box should be open
    handleCloseDialog() {
        this.setState({
            openDialog: false
        });
        document.getElementsByClassName('mdl-layout__inner-container')[0].style.overflowX = 'auto';
        document.getElementsByClassName('mdl-layout__inner-container')[0].style.overflowX = '';
    }

    //finds a given username and uploads a specified movie from current user
    //into their inbox into firebase
    sendMessage(event) {
        var movieId = document.querySelector('#recommendLink').href;
        movieId = movieId.substring(movieId.lastIndexOf('/') + 1);
        var movieTitle = document.querySelector('#recommendLink').textContent;
        var userId;
        var avatar;
        var userRef = firebase.database().ref('users/');
        userRef.once('value', (snapshot) => {
            var object = snapshot.val();
            if (object != null) {
                var keys = Object.keys(object);
            }

            var recipientId = Object.keys(object).filter((key) => {
                return object[key].email == this.state.username;
            });

            if (recipientId.length > 0) {
                var inboxRef = firebase.database().ref('users/' + recipientId + '/inbox');
                var newMessage = {
                    content: movieTitle,
                    id: movieId,
                    date: firebase.database.ServerValue.TIMESTAMP,
                    fromUserAvatar: this.state.user.photoURL,
                    fromUserID: this.state.user.uid,
                    fromUserName: this.state.user.displayName
                };
                var status = inboxRef.push(newMessage);
                this.handleCloseDialog();
            } else {
                this.setState({ error: 'Could not find a user with that email' });
            }
        })
    }

    //retrieves given username input value
    updateUsername(event) {
        this.setState({ username: event.target.value })
    }

    //closes dialogbox and uplaods to firebase
    submitMessage(e) {
        e.preventDefault();
        this.sendMessage(e);
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

    render() {
        var content = <p>Please add some movies to your favorites first!</p>;
        if (this.state.user) {
            content = <RecommendedMovies dialogCallback={this.handleOpenDialog} user={this.state.user} />
        }

        var errorMessage = [];
        if (this.state.error) {
            errorMessage = <p className="errorMessage">{this.state.error}</p>;
        }

        return (
            <div>
                <Dialog open={this.state.openDialog} onCancel={this.handleCloseDialog}>
                    <DialogTitle>Share A Movie</DialogTitle>
                    <DialogContent>
                        <form role="form">
                            <label htmlFor="text">Friend's email (must be a registered user)</label>
                            <input type="text" name="text" placeholder="Email Address" className="form-control" onChange={(e) => this.updateUsername(e)} />

                            <p id="recommendMessage">You should watch <Link id="recommendLink" to=""></Link>!</p>
                        </form>
                        {errorMessage}
                    </DialogContent>
                    <DialogActions>
                        <Button type='button' onClick={this.handleCloseDialog}>Close</Button>
                        <Button type='button' onClick={(e) => this.submitMessage(e)}>Send</Button>
                    </DialogActions>
                </Dialog>
                {content}
            </div>
        )
    }
}

//Uses randomly generated favorited movie from current user's favorite list.
//Then fetches the recommended movies from TMDB based off of that movie.
//Displays the top recommended movie in a detailed view, and simply the images of the next 6.
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
            //Takes a randomly chosen movie from favorites list and fetches similar movies
            if (movieObject != null && Object.keys(movieObject).length > 0) {
                var movieIdArray = Object.keys(movieObject);
                var randNum = _.random(movieIdArray.length - 1);
                movieId = movieIdArray[randNum];
                DataController.getRecommended(movieId)
                    .then((data) => {
                        var movies;
                        if (0 == 1) {//data.results.length > 0) {
                            movies = _.shuffle(data.results);
                            this.setState({ movieData: movies.slice(1, 7), recommended: movies[0].id });
                        } else { // in case there are no recommendations for a given movie, use favorites
                            movies = _.shuffle(movieObject);
                            this.setState({ movieData: movies.slice(1, 7), recommended: movies[0].id });
                        }

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
        var movieRowHeader;
        var topMovie = <p>Please add some movies to your favorites first!</p>;
        if (this.state.movie && this.state.cast && this.props.user && this.state.trailer) {
            topMovie = <DetailedMovieCard dialogCallback={this.props.dialogCallback} cast={this.state.cast} movie={this.state.movie} user={this.props.user} trailer={this.state.trailer} />;
            movieRowHeader = <h1>Other Recommendations</h1>;
        }
        var movieRow = null;
        if (this.state.movieData) {
            movieRow = this.state.movieData.map((movie) => {
                return (
                    <Cell col={2} phone={12} tablet={4}>
                        <Link to={'movie/' + movie.id}><img className="responsive-img" src={'https://image.tmdb.org/t/p/original/' + movie.poster_path} alt={this.props.original_title} role='presentation' />
                        </Link>
                    </Cell>
                );
            });
        }
        return (
            <div className="moviePage">
                <h1>Movie Details</h1>
                {topMovie}
                {movieRowHeader}
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