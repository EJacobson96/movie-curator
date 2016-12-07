import React, { Component } from 'react';
import NowPlayingController from './NowPlayingController';
import firebase from 'firebase';
import { Link, hashHistory } from 'react-router';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Grid, Cell } from 'react-mdl';

// Takes the watchlist from current users in firebase and displays 
// their saved watchlist movies
class Watchlist extends Component {
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
            for (var i = 0; i < keys.length; i++) {
                if (object[keys[i]].handle == this.state.username) {
                    userId = keys[i];
                    avatar = object[keys[i]].avatar;
                }
            }

            var inboxRef = firebase.database().ref('users/' + userId + '/inbox');
            console.log('this.state.user', this.state.user);
            var newMessage = {
                content: movieTitle,
                id: movieId,
                date: firebase.database.ServerValue.TIMESTAMP,
                fromUserAvatar: this.state.user.photoURL,
                fromUserID: this.state.user.uid,
                fromUserName: this.state.user.displayName
            };
            var status = inboxRef.push(newMessage);
        })
    }

    //retrieves given username input value
    updateUsername(event) {
        this.setState({ username: event.target.value })
    }

    //closes dialogbox and uplaods to firebase
    submitMessage(e) {
        this.sendMessage(e);
        this.handleCloseDialog();
    }

    componentDidMount() {
        /* Add a listener and callback for authentication events */
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
        if (this.unregister) { //if have a function to unregister with
            this.unregister(); //call that function!
        }
    }

    render() {
        var movies = <p>There are no movies in your watchlist.</p>;
        if (this.state.user) {
            movies = <WatchlistMovies user={this.state.user} dialogCallback={this.handleOpenDialog} />;
        }

        return (
            <div>
                <Dialog open={this.state.openDialog} onCancel={this.handleCloseDialog}>
                    <DialogTitle>Share A Movie</DialogTitle>
                    <DialogContent>
                        <form role="form">
                            <textarea placeholder="Friend's Username" name="text" className="form-control" onChange={(e) => this.updateUsername(e)}></textarea>
                            <p id="recommendMessage">You should watch <Link id="recommendLink" to=""></Link>!</p>
                            <div className="form-group">
                            </div>
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button type='button' onClick={this.handleCloseDialog}>Close</Button>
                        <Button type='button' onClick={(e) => this.submitMessage(e)}>Send</Button>
                    </DialogActions>
                </Dialog>

                <div className="watchlist">
                    <Grid>
                        <Cell col={9} phone={12} tablet={12}>
                            <h1>My Watchlist</h1>
                            {movies}
                        </Cell>
                        <Cell col={3} phone={12} tablet={12}>
                            <NowPlayingMovieData />
                        </Cell>
                    </Grid>
                </div>
            </div>
        )
    }
}

// Fetches the now playing movie data and displays
//10 of the movies using MovieCards
class NowPlayingMovieData extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        NowPlayingController.search()
            .then((data) => {
                var movies = data.results.slice(7, 17);
                this.setState({ movieData: movies });
            })
            .catch((err) => console.log(err));

    }

    render() {
        var nowPlaying = <p>Loading movies...</p>;
        if (this.state.movieData) {
            nowPlaying = <NowPlaying searchMovies={this.state.movieData} />;
        }
        return (
            <div>
                {nowPlaying}
            </div>
        )
    }
}

// Displays list of 10 now playing movies queried from the tmdb api
class NowPlaying extends Component {
    render() {
        var nowPlaying = this.props.searchMovies.map((movie) => {
            return <Link to={'movie/' + movie.id}><li>{movie.original_title}</li></Link>
        })
        return (
            <div className='NowPlaying'>
                <h1>Movies In Theaters Now</h1>
                <ul>
                    {nowPlaying}
                </ul>
            </div>
        )
    }
}

// Uses Firebase to find all of the current user's watchlist movies
// and displays them using MovieCard
class WatchlistMovies extends Component {
    constructor(props) {
        super(props);
        this.state = { watchlist: [] };
    }

    //Lifecycle callback executed when the component appears on the screen.
    //It is cleaner to use this than the constructor for fetching data
    componentDidMount() {
        var usersRef = firebase.database().ref('users');
        usersRef.on('value', (snapshot) => {
            this.setState({ users: snapshot.val() });
        });
        /* Add a listener for changes to the movies object, and save in the state */
        var watchlistRef = firebase.database().ref('users/' + this.props.user.uid + '/watchlist');
        watchlistRef.on('value', (snapshot) => {
            var watchlistArray = []; //could also do this processing in render
            var movieObjects = snapshot.val();
            if (movieObjects) {
                Object.keys(movieObjects).forEach(function (child) {
                    watchlistArray.push(movieObjects[child]); //make into an array
                });
            }
            this.setState({ watchlist: watchlistArray });
        });
    }

    componentWillUnmount() {
        //unregister listeners
        firebase.database().ref('users').off();
        firebase.database().ref('users/' + this.props.user.uid + '/watchlist').off();
    }

    render() {

        return (
            <div className="">
                <DisplayMovies user={this.props.user} dialogCallback={this.props.dialogCallback} movies={this.state.watchlist} />
            </div>
        );
    }
}

// Takes in an array of movies and displays them using MovieCards
class DisplayMovies extends Component {
    render() {
        var movierow = this.props.movies.map((movie) => {
            return <MovieCard user={this.props.user} dialogCallback={this.props.dialogCallback} MoviePoster={movie.poster_path} MovieOverview={movie.overview} MovieTitle={movie.original_title} MovieId={movie.id} />;
        })

        if (this.props.movies.length == 0) {
            movierow = "Please add movies to your watchlist!"
        }

        return (
            <div className="Watchlist">
                {movierow}
            </div>
        )
    }
}

// Displays given movie title, overview and poster. Then, for each MovieCard displays
//DisplayButtons component
class MovieCard extends Component {
    render() {
        return (
            <div className="movieCard">
                <Grid>
                    <Cell col={4}>
                        <div className="imgSection">
                            <Link to={'movie/' + this.props.MovieId}><img className="responsive-img" src={'https://image.tmdb.org/t/p/original/' + this.props.MoviePoster} alt={this.props.MovieTitle} role='presentation' /></Link>
                        </div>
                    </Cell>

                    <Cell col={8}>
                        <div className="cardSection">
                            <Link to={"/movie/" + this.props.MovieId}>
                                <h2>{this.props.MovieTitle}</h2>
                            </Link>
                            <p>{this.props.MovieOverview}</p>
                            <div className="buttons">
                                <DisplayButtons user={this.props.user} dialogCallback={this.props.dialogCallback} MoviePoster={this.props.MoviePoster} MovieOverview={this.props.MovieOverview} MovieTitle={this.props.MovieTitle} MovieId={this.props.MovieId} />
                            </div>

                        </div>
                    </Cell>
                </Grid>
            </div>
        );
    }
}

//displays watchlist, favorite and message box buttons
class DisplayButtons extends Component {
    constructor(props) {
        super(props);
        this.state = { username: '', message: '' };
        this.updateMessage = this.updateMessage.bind(this);
    }

    //forcibly changes the text within the messagebox so that the movie id and title
    //can be accessed by parent component
    updateMessage() {
        var movieTitle = this.props.MovieTitle;
        var movieId = this.props.MovieId;
        this.props.dialogCallback();
        document.querySelector('#recommendLink').href = '#/movie/' + movieId;
        document.querySelector('#recommendLink').textContent = movieTitle;
    }

    //if the clicked on movie is already in the watchlist, this method removes it from firebase. Otherwise,
    //it adds the movie to firebase
    saveMovie(poster, title, overview, id) {
        var idRef = firebase.database().ref('users/' + this.props.user.uid + '/watchlist');
        idRef.once('value', (snapshot) => {
            var movieObject = snapshot.val();
            var idExists = this.checkId(id, movieObject);
            if (!idExists) {
                var userRef = firebase.database().ref('users/' + this.props.user.uid + '/watchlist/' + id);
                var newMovie = {
                    poster_path: poster,
                    original_title: title,
                    overview: overview,
                    id: id,
                    Saved: false,
                    Favorited: false
                };
                userRef.set(newMovie);
            } else {
                firebase.database().ref('users/' + this.props.user.uid + '/watchlist/' + id).remove();
            }
        });

        this.setState({});
    }

    //if the clicked on movie is already in favorites, this method removes it from firebase. Otherwise,
    //it adds the movie to firebase
    favoriteMovie(id) {
        var idRef = firebase.database().ref('users/' + this.props.user.uid + '/Favorited');
        idRef.once('value', (snapshot) => {
            var movieObject = snapshot.val();
            var idExists = this.checkId(id, movieObject);
            if (!idExists) {
                var userRef = firebase.database().ref('users/' + this.props.user.uid + '/Favorited/' + id);
                var newMovie = {
                    id: id
                }
                userRef.set(newMovie);
            } else {
                firebase.database().ref('users/' + this.props.user.uid + '/Favorited/' + id).remove();
            }
        })
        this.setState({});
    }

    //checks if the given movie is in firebase
    checkId(movieId, obj) {
        if (obj == null) {
            return false;
        }
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            if (keys[i] == movieId) {
                return true;
            }
        }
        return false;
    }

    componentDidMount() {
        var savedRef = firebase.database().ref('users/' + this.props.user.uid + '/watchlist');
        this.unregister = savedRef.on('value', (snapshot) => {
            var movieObject = snapshot.val();
            var idExists = this.checkId(this.props.MovieId, movieObject);
            this.setState({ saved: !idExists });
        });

        var favoriteRef = firebase.database().ref('users/' + this.props.user.uid + '/Favorited');
        favoriteRef.on('value', (snapshot) => {
            var movieObject = snapshot.val();
            var idExists = this.checkId(this.props.MovieId, movieObject);
            this.setState({ favorited: !idExists });
        });
    }

    render() {
        var favorited, saved;

        if (this.state.saved) {
            saved = <button className="btn btn-primary adder" onClick={() => this.saveMovie(this.props.MoviePoster, this.props.MovieTitle, this.props.MovieOverview, this.props.MovieId)}><p>Watchlist</p><i className="material-icons">add_to_queue</i></button>;
        } else {
            saved = <button className="btn btn-primary adder" onClick={() => this.saveMovie(this.props.MoviePoster, this.props.MovieTitle, this.props.MovieOverview, this.props.MovieId)}><p>Watchlist</p><i className="material-icons added">indeterminate_check_box</i></button>;
        }

        if (this.state.favorited) {
            favorited = <button className="btn btn-primary adder" onClick={() => this.favoriteMovie(this.props.MovieId)}><p>Favorite</p><i className="material-icons">favorite_border</i></button>;
        } else {
            favorited = <button className="btn btn-primary adder" onClick={() => this.favoriteMovie(this.props.MovieId)}><p>Favorite</p><i className="material-icons added">favorite</i></button>;
        }

        return (
            <div>
                {saved}
                {favorited}
                <button onClick={this.updateMessage} className="btn btn-primary adder"><i className="material-icons">mail_outline</i></button>
            </div>
        )
    }
}

export { DisplayMovies, NowPlayingMovieData, MovieCard, DisplayButtons };
export default Watchlist;
