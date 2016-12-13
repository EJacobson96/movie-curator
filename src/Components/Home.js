import React, { Component } from 'react';
import firebase from 'firebase';
import { Link, hashHistory } from 'react-router';
import DataController from '../DataController';
import { NowPlayingMovieData, MovieCard } from './Watchlist';
import _ from 'lodash';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Grid, Cell } from 'react-mdl';


//displays the home page containing now playing movies
class Home extends Component {
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

    //handles whether the message box should closed
    handleCloseDialog() {
        this.setState({
            openDialog: false
        });
        // Workaround for React-MDL Dialog bug
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

    // Get the user info when the component mounts and update state with data
    // If user is not logged in, redirect to login screen
    componentDidMount() {
        this.unregister = firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.setState({
                    user: firebaseUser
                });
            } else {
                hashHistory.push('/Start');
            }
        });
    }

    //signs user out
    signOut() {
        firebase.auth().signOut()
        hashHistory.push('login');
    }

    // Conditionally render our component, setting the content when the user is set in state 
    render() {
        var content = null;
        if (this.state.user) {
            content = <DisplayFeaturedMovies user={this.state.user} dialogCallback={this.handleOpenDialog} />;
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

// Displays the featured movie card and a list of other Suggestions
// Using the queried now playing the tmdb api
class DisplayFeaturedMovies extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    // Fetch now playing movies, and add them to state
    componentDidMount() {
        DataController.getNowPlaying()
            .then((data) => {
                var movies = data.results.slice(1, 7);
                var top = data.results[0];
                this.setState({ movieData: movies, top: top });
            })
    }

    // Conditionally render our component when the user, 
    // top movie and other movies are set 
    render() {
        var topMovie = [];
        if (this.state.top && this.props.user) {
            topMovie = <MovieCard user={this.props.user} MoviePoster={this.state.top.poster_path} MovieOverview={this.state.top.overview} MovieTitle={this.state.top.original_title} MovieId={this.state.top.id} dialogCallback={this.props.dialogCallback} />;
        }
        var movieRow = <p>Please add some movies to your favorites first!</p>;
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
            <div>
                <Grid>
                    <Cell col={7}>
                        <h1>Featured Movie</h1>
                        {topMovie}
                    </Cell>
                    <Cell col={4} tablet={12} phone={12} offsetDesktop={1}>
                        <NowPlayingMovieData />
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

export default Home;