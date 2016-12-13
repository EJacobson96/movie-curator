import React from 'react';
import firebase from 'firebase';
import YouTube from 'react-youtube';
import moment from 'moment';
import { hashHistory, Link } from 'react-router';
import Controller from '../DataController';
import Comments from './Comments';
import { DisplayButtons } from './Watchlist';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Grid, Cell, List, ListItem } from 'react-mdl';

// Displays a movie page with detailed movie info for any movie
//  pre: must be given a movie id
class Movies extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.handleOpenDialog = this.handleOpenDialog.bind(this);
        this.handleCloseDialog = this.handleCloseDialog.bind(this);
    }

    // Adjust state to open dialog
    handleOpenDialog() {
        this.setState({
            openDialog: true,
        });
    }

    // Adjust state to close dialog
    handleCloseDialog() {
        this.setState({
            openDialog: false
        });
        // Workaround for React-MDL Dialog bug
        document.getElementsByClassName('mdl-layout__inner-container')[0].style.overflowX = 'auto';
        document.getElementsByClassName('mdl-layout__inner-container')[0].style.overflowX = '';
    }

    // Send the message to the user
    //  pre: takes in an input event whose value is a user's name
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

    // Adjust the state to include the username input's value
    updateUsername(event) {
        this.setState({ username: event.target.value })
    }

    // sends a message and closes the dialog
    submitMessage(e) {
        e.preventDefault();
        this.sendMessage(e);
    }

    // When component mounts, fetch needed movie data and update state
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

        Controller.getMovieDetails(this.props.params.movieId)
            .then((data) => {
                this.setState({ movie: data });
            });

        Controller.getMovieTrailer(this.props.params.movieId)
            .then((data) => {
                var trailer = data.results.filter((trailer) => {
                    return trailer.type == 'Trailer';
                });
                this.setState({ trailer: trailer[0] });
            });

        Controller.getMovieCredits(this.props.params.movieId)
            .then((data) => {
                this.setState({ cast: data.cast });
            });


    }

    // unregister firebase listener when the component unmounts
    componentWillUnmount() {
        if (this.unregister) {
            this.unregister();
        }
    }

    // In case user switches from one detailed movie, to the next
    // ie: through use of the inbox, or navigating back/forth, changing url
    componentWillReceiveProps(nextProps) {
        this.unregister = firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.setState({
                    user: firebaseUser
                });
            } else {
                hashHistory.push('/login');
            }
        });

        if (this.props.params.movieId !== nextProps.params.movieId) {
            Controller.getMovieDetails(nextProps.params.movieId)
                .then((data) => {
                    this.setState({ movie: data });
                });

            Controller.getMovieTrailer(nextProps.params.movieId)
                .then((data) => {
                    var trailer = data.results.filter((trailer) => {
                        return trailer.type == 'Trailer';
                    });
                    this.setState({ trailer: trailer[0] });
                });

            Controller.getMovieCredits(nextProps.params.movieId)
                .then((data) => {
                    this.setState({ cast: data.cast });
                });
        }
    }

    // render our movie page
    render() {
        var card = [];
        if (this.state.movie && this.state.cast && this.state.user) {
            card = <DetailedMovieCard cast={this.state.cast} movie={this.state.movie} user={this.state.user} trailer={this.state.trailer} dialogCallback={this.handleOpenDialog} />;
        }

        var comments = [];
        if (this.state.movie && this.state.user) {
            comments = <Comments user={this.state.user} movieId={this.state.movie.id} />
        }

        var errorMessage = [];
        if (this.state.error) {
            errorMessage = <p className="errorMessage">{this.state.error}</p>;
        }

        return (
            <div className="moviePage">
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
                <h1>Movie Details</h1>
                {card}

                <h1>Comments</h1>
                {comments}
            </div>
        );
    }
}

// Displays a more detailed movie card for the given movie
//  pre: requires a movie object
class DetailedMovieCard extends React.Component {
    // renders our component
    render() {
        var runtime = (parseInt(this.props.movie.runtime / 60)) + 'h ' + this.props.movie.runtime % 60 + 'm';
        var releaseDate = moment(this.props.movie.release_date).format('MMMM Do, YYYY');

        var genres = this.props.movie.genres.map((genre) => {
            return genre.name;
        }).join('/');

        var castArray = Object.keys(this.props.cast).slice(0, 5);
        var cast = this.props.cast.slice(0, 3).map((actor) => {
            return <ListItem>{actor.name + ' - ' + actor.character}</ListItem>;
        });

        return (
            <div>
                <div className="detailedCard">
                    <Grid>
                        <Cell col={3} hidePhone hideTablet>
                            <div className="imgSection">
                                <img className="responsive-img" src={'https://image.tmdb.org/t/p/original/' + this.props.movie.poster_path} alt={this.props.original_title} role='presentation' />
                            </div>
                        </Cell>

                        <Cell col={9}>
                            <div className="trailerSection video-container">
                                <YouTube
                                    videoId={this.props.trailer.key}
                                    />
                            </div>
                        </Cell>
                    </Grid>

                    <Grid>
                        <Cell col={12}>
                            <div className="cardSection">
                                <Grid>
                                    <Cell col={6} tablet={12}>
                                        <Cell col={11} tablet={12}>
                                            <h2>{this.props.movie.original_title}</h2>
                                            <p className="contentParagraph">{releaseDate + ' • ' + genres + ' film • ' + runtime}</p>
                                            <p className="contentParagraph">{this.props.movie.overview}</p>
                                            <div className="buttons">
                                                <DisplayButtons dialogCallback={this.props.dialogCallback} MoviePoster={this.props.movie.poster_path} MovieTitle={this.props.movie.original_title}
                                                    MovieOverview={this.props.movie.overview} MovieId={this.props.movie.id} user={this.props.user} />
                                            </div>
                                        </Cell>
                                    </Cell>

                                    <Cell col={6} tablet={12}>
                                        <Grid>
                                            <Cell col={6} phone={12} tablet={4}>
                                                <div className="ratingBox">
                                                    <p>{this.props.movie.vote_average + '/10'}</p>
                                                    <a href="https://www.themoviedb.org">TMDB</a>
                                                </div>
                                            </Cell>
                                            <Cell col={6} phone={12} tablet={4}>
                                                <div className="ratingBox">
                                                    <p>{Math.round(this.props.movie.popularity) + ' %'}</p>
                                                    <a href="https://www.themoviedb.org">Popularity</a>
                                                </div>
                                            </Cell>
                                        </Grid>

                                        <Cell col={12}>
                                            <div className="castBox">
                                                <h3>Top Cast</h3>
                                                <List>
                                                    {cast}
                                                </List>
                                            </div>
                                        </Cell>
                                    </Cell>
                                </Grid>

                            </div>
                        </Cell>
                    </Grid>

                </div>
            </div>
        );
    }
}

export { DetailedMovieCard };
export default Movies;
