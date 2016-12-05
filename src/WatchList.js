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
            openDialog: true
        });
    }

    handleCloseDialog() {
        this.setState({
            openDialog: false
        });
    }

    updateParent(movieId, title) {
        console.log(movieId);
        console.log(title);
        console.log(this.state.username);
        console.log(this.state.message);
        this.handleCloseDialog();
    }

    updateUsername(event) {
        this.setState({ username: event.target.value })
    }

    updateMessage(event) {
        this.setState({ message: event.target.value })
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
            movies = <Movies user={this.state.user} dialogCallback={this.handleOpenDialog} />;
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
                    </DialogActions>
                </Dialog>

                {/*<MovieData userInput='Arrival' /> */}
                <div className="watchlist">
                    <h1>My Watchlist</h1>
                    <Grid>
                        <Cell col={9}>
                            {movies}
                        </Cell>
                        <Cell col={3}>
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
            return <li>{movie.original_title}</li>
        })
        return (
            <div className='NowPlaying'>
                <h2>Movies In Theaters Now</h2>
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
        this.state = { movieData: [] }
        this.fetchData = this.fetchData.bind(this);
    }

    // fetchData(searchTerm) {
    //     var thisComponent = this;
    //     var movies = [];
    //     Controller.search(searchTerm)
    //     .then((data) => {
    //         movies = data.results.splice(0,5);
    //         thisComponent.setState({movieData:movies})
    //     })
    //     .catch((err) => console.log(err));
    // }

    fetchData() {
        var thisComponent = this;
        var movies = [];
        NowPlayingController.search()
            .then((data) => {
                movies = data.results.splice(0, 10);
                thisComponent.setState({ movieData: movies })
            })
            .catch((err) => console.log(err));
    }

    render() {
        return (
            <div>
                <NowPlaying fetchData={this.fetchData()} searchMovies={this.state.movieData} />
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
            return <MovieCard user={this.props.user} dialogCallback={this.props.dialogCallback} MoviePoster={movie.poster_path} MovieOverview={movie.overview} MovieTitle={movie.original_title} MovieId={movie.id} key={movie.key} />;
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

    updateMessage() {
        console.log(this.props);
        console.log(this.props.MovieTitle);
        var movieTitle = this.props.MovieTitle;
        var movieId = this.props.MovieId;
        this.props.dialogCallback();
        document.querySelector('#recommendLink').href = '#/movie/' + movieId;
        document.querySelector('#recommendLink').textContent = movieTitle;
    }

    render() {
        var favorited = <button className="btn btn-primary" onClick={() => this.favoriteMovie(this.props.MovieId)}><p>Favorite</p><i className="material-icons">favorite_border</i></button>;

        var saved = saved = <button className="btn btn-primary" onClick={() => this.saveMovie(this.props.MoviePoster, this.props.MovieTitle, this.props.MovieOverview, this.props.MovieId)}><p>Watchlist</p><i className="material-icons">add_to_queue</i></button>;

        var savedRef = firebase.database().ref('users/' + this.props.user.uid + '/watchlist');
        var favoriteRef = firebase.database().ref('users/' + this.props.user.uid + '/Favorited');
        savedRef.once('value', (snapshot) => {
            var movieObject = snapshot.val();
            var idExists = this.checkId(this.props.MovieId, movieObject);
            if (!idExists) {
                saved = <button className="btn btn-primary" onClick={() => this.saveMovie(this.props.MoviePoster, this.props.MovieTitle, this.props.MovieOverview, this.props.MovieId)}><p>Watchlist</p><i className="material-icons">add_to_queue</i></button>
            } else {
                saved = <button className="btn btn-primary" onClick={() => this.saveMovie(this.props.MoviePoster, this.props.MovieTitle, this.props.MovieOverview, this.props.MovieId)}><p>Watchlist</p><i className="material-icons">indeterminate_check_box</i></button>
            }
        })
        favoriteRef.once('value', (snapshot) => {
            var movieObject = snapshot.val();
            var idExists = this.checkId(this.props.MovieId, movieObject);
            if (!idExists) {
                favorited = <button className="btn btn-primary" onClick={() => this.favoriteMovie(this.props.MovieId)}><p>Favorite</p><i className="material-icons">favorite_border</i></button>
            } else {
                favorited = <button className="btn btn-primary" onClick={() => this.favoriteMovie(this.props.MovieId)}><p>Favorite</p><i className="material-icons">favorite</i></button>
            }
        })

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
                            {saved}
                            {favorited}
                            <i onClick={this.updateMessage} className="material-icons">mail_outline</i>
                        </div>
                    </Cell>
                </Grid>
            </div>
        );
    }
}

export { DisplayMovies };
export default WatchList;