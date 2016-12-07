import React, { Component } from 'react';
import NowPlayingController from './NowPlayingController';
import firebase from 'firebase';
import { Link, hashHistory } from 'react-router';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Grid, Cell } from 'react-mdl'

class WatchList extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.handleOpenDialog = this.handleOpenDialog.bind(this);
        this.handleCloseDialog = this.handleCloseDialog.bind(this);
    }

    handleOpenDialog() {
        this.setState({
            openDialog: true,
        });
    }

    handleCloseDialog() {
        this.setState({
            openDialog: false
        });
    }

    sendMessage(event) {
        var movieId = document.querySelector('#recommendLink').href;
        movieId = movieId.substring(movieId.lastIndexOf('/') + 1);
        var movieTitle = document.querySelector('#recommendLink').textContent;
        var userId;
        var avatar;
        var userRef = firebase.database().ref('users/');
        userRef.once('value', (snapshot) => {
            var object = snapshot.val();
            var keys = Object.keys(object);
            for (var i = 0; i < keys.length; i++) {
                if (object[keys[i]].watchlist && object[keys[i]].handle == this.state.username) {
                    userId = keys[i];
                    avatar = object[keys[i]].avatar;
                }
            }
            var inboxRef = firebase.database().ref('users/' + userId + '/inbox');
            var newMessage = {
                content: movieTitle,
                id: movieId,
                date: firebase.database.ServerValue.TIMESTAMP,
                fromUserAvatar: avatar,
                fromUserID: userId,
                fromUserName: this.state.username
            };
            inboxRef.push(newMessage);
        })
    }

    updateUsername(event) {
        this.setState({username:event.target.value })
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

    submitMessage (e) {
        this.sendMessage(e);
        this.handleCloseDialog();
    }

    render() {
        var movies = <p>There are no movies in your watchlist.</p>;
        var id = null;
        if (this.state.user) {
            movies = <Movies user={this.state.user} dialogCallback={this.handleOpenDialog} />;
        }
        if (this.state.id) {
            id = this.state.id;
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

                {/*<MovieData userInput='Arrival' /> */}
                <div className="watchlist">
                    <Grid>
                        <Cell col={9} phone={12} tablet={12}>
                            <h1>My Watchlist</h1>
                            {movies}
                        </Cell>
                        <Cell col={3} phone={12} tablet={12}>
                            <MovieData />
                        </Cell>
                    </Grid>
                </div>

            </div>
        )
    }
}


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

class MovieData extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        NowPlayingController.search()
            .then((data) => {
                var movies = data.results.splice(0, 10);
                this.setState({ movieData: movies });
            })
            .catch((err) => console.log(err));
    }

    render() {
        var nowPlaying = <p>Loading movies...</p>;
        if(this.state.movieData) {
            nowPlaying = <NowPlaying searchMovies={this.state.movieData} />;
        }
        return (
            <div>
                {nowPlaying}
            </div>
        );
    }
}

class Movies extends Component {
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
            Object.keys(movieObjects).forEach(function (child) {
                watchlistArray.push(movieObjects[child]); //make into an array
            });
            this.setState({ watchlist: watchlistArray });
        });
    }

    componentWillUnmount() {
        //unregister listeners
        firebase.database().ref('users').off();
        firebase.database().ref('users/' + this.props.user.uid + '/watchlist').off();
    }

    render() {
        // var movierow = this.state.watchlist.map((movie) => {
        //     return <MovieCard  MoviePoster={movie.poster_path} MovieOverview={movie.overview}
        //         MovieTitle={movie.original_title} MovieId={movie.id} key={movie.key} />;
        // })
        return (
            <div className="">
                <DisplayMovies user={this.props.user} dialogCallback={this.props.dialogCallback} movies={this.state.watchlist} />
            </div>
        );
    }
}

class DisplayMovies extends Component {
    render() {
        var movierow = this.props.movies.map((movie) => {
            return <MovieCard user={this.props.user} dialogCallback={this.props.dialogCallback} MoviePoster={movie.poster_path} MovieOverview={movie.overview} MovieTitle={movie.original_title} MovieId={movie.id} />;
        })
        return (
            <div className="Watchlist">
                {movierow}
            </div>
        )
    }
}

class MovieCard extends Component {
    constructor(props) {
        super(props);
        this.state = { username: '', message: '' };
        this.updateMessage = this.updateMessage.bind(this);
    }

    updateMessage() {
        var movieTitle = this.props.MovieTitle;
        var movieId = this.props.MovieId;
        this.props.dialogCallback();
        document.querySelector('#recommendLink').href = '#/movie/' + movieId;
        document.querySelector('#recommendLink').textContent = movieTitle;
    }

    render() {
        return (
            <div className="movieCard">
                <Grid>
                    <Cell col={4}>
                        <div className="imgSection">
                            <img className="responsive-img" src={'https://image.tmdb.org/t/p/original/' + this.props.MoviePoster} role='presentation' />
                        </div>
                    </Cell>

                    <Cell col={8}>
                        <div className="cardSection">
                            <Link to={"/movie/" + this.props.MovieId}><h2>{this.props.MovieTitle}</h2></Link>
                            <p>{this.props.MovieOverview}</p>

                            {/*{saved}
                            {favorited}
                            <i onClick={this.updateMessage} className="material-icons">mail_outline</i>*/}

                            <div className="buttons">
                                <button className="btn btn-primary trailer" onClick={() => this.saveMovie(this.props.MoviePoster)}>
                                    <p>Watch Trailer</p>
                                </button>
                                <DisplayButtons user={this.props.user} MoviePoster={this.props.MoviePoster} MovieOverview={this.props.MovieOverview} MovieTitle={this.props.MovieTitle} MovieId={this.props.MovieId} />
                                <button className="btn btn-primary adder send" onClick={() => { this.props.dialogCallback(); this.props.updateParent(); } }>
                                    <i className="material-icons">mail_outline</i>
                                </button>
                            </div>

                        </div>
                    </Cell>
                </Grid>
            </div>
        );
    }
}

class DisplayButtons extends Component {

    saveMovie(poster, title, overview, id) {
        console.log(id);
        var idRef = firebase.database().ref('users/' + this.props.user.uid + '/watchlist');
        idRef.once('value', (snapshot) => {
            var movieObject = snapshot.val();
            console.log('method called');
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
        })
        this.setState({});
    }

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
    render() {
        var favorited = null;
        var saved = <button className="btn btn-primary" onClick={() => this.saveMovie(this.props.MoviePoster, this.props.MovieTitle, this.props.MovieOverview, this.props.MovieId)}><p>Watchlist</p><i className="material-icons">add_to_queue</i></button>;
        var savedRef = firebase.database().ref('users/' + this.props.user.uid + '/watchlist');
        //console.log(savedRef);
        savedRef.once('value', (snapshot) => {
            //console.log('saved working');
            var movieObject = snapshot.val();
            var idExists = this.checkId(this.props.MovieId, movieObject);
            if (!idExists) {
                saved = <button className="btn btn-primary" onClick={() => this.saveMovie(this.props.MoviePoster, this.props.MovieTitle, this.props.MovieOverview, this.props.MovieId)}><p>Watchlist</p><i className="material-icons">add_to_queue</i></button>
            } else {
                saved = <button className="btn btn-primary" onClick={() => this.saveMovie(this.props.MoviePoster, this.props.MovieTitle, this.props.MovieOverview, this.props.MovieId)}><p>Watchlist</p><i className="colored material-icons">indeterminate_check_box</i></button>
            } 
        })
        var favoriteRef = firebase.database().ref('users/' + this.props.user.uid + '/Favorited');
        favoriteRef.once('value', (snapshot) => {
            //console.log('favorite working');
            var movieObject = snapshot.val();
            var idExists = this.checkId(this.props.MovieId, movieObject);
            if (!idExists) {
                //console.log('favorite working 2');
                favorited = <button className="btn btn-primary" onClick={() => this.favoriteMovie(this.props.MovieId)}><p>Favorite</p><i className="material-icons">favorite_border</i></button>
            } else {
                favorited = <button className="btn btn-primary" onClick={() => this.favoriteMovie(this.props.MovieId)}><p>Favorite</p><i className="material-icons colored">favorite</i></button>
            } 
        })

        return (
            <div>
                {saved}
                {favorited}
            </div>
        )
    }
}

export { DisplayMovies, MovieData, MovieCard, DisplayButtons };
export default WatchList;