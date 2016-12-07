import React from 'react';
import { Link, hashHistory } from 'react-router';
import { Form, FormControl, InputGroup, Button, Glyphicon, FormGroup, ControlLabel } from 'react-bootstrap';
import firebase from 'firebase';
import MovieController from './MovieController';
import { DisplayMovies, MovieCard } from './Watchlist';
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Cell } from 'react-mdl';

// import './App.css';
// import './index.css';

// genreIDs that correspond with genre in API
const genresObj = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: "Science Fiction",
    10770: "TV Movie",
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
};

// Allows user to search for movies then displays the results.
// Then, from results user can send message, like, or add to watchlist
class AdvancedSearch extends React.Component {
    constructor(props) {
        super(props);
        this.handleOpenDialog = this.handleOpenDialog.bind(this);
        this.handleCloseDialog = this.handleCloseDialog.bind(this);
        this.state = {
            movies: []
        };

        this.fetchData = this.fetchData.bind(this);
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

    // sends message to user provided 
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
            console.log(this.state.user.handle);
            var newMessage = {
                content: movieTitle,
                id: movieId,
                date: firebase.database.ServerValue.TIMESTAMP,
                fromUserAvatar: this.state.user.photoURL,
                fromUserID: this.state.user.uid,
                fromUserName: this.state.user.displayName
            };
            inboxRef.push(newMessage);
        })
    }

    updateUsername(event) {
        this.setState({ username: event.target.value })
    }

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

    componentWillReceiveProps(nextProps) {
        if (nextProps.location !== this.props.location) {
            var theMovieTitle = '';
            if (nextProps.location.query.q) {
                theMovieTitle = nextProps.location.query.q;
            }

            this.fetchData(nextProps.location.query.q);
        }
    }


    //helper method- calls MovieController search function to fetch 
    //data from API based on parameters passed in
    fetchData(title, year, genre) {
        MovieController.search(title, year, genre)
            .then((data) => {
                this.setState({
                    movies: data.results
                });

                if (genre && title) {    // if searching by genre and title
                    // array filtered with genreIDs matching genre search
                    var titleGenreMovies = this.state.movies.filter((movie) => {
                        // checks genre_ids array for matches to genre searched
                        return movie.genre_ids.some((genreID) => { return genreID == genre });
                    });
                    // sets new array of movie objects to state
                    this.setState({ movies: titleGenreMovies });
                }
            });

    }

    render() {
        var displayMovies = [];
        if (this.state.user && this.state.movies) {
            displayMovies = <DisplayMovies dialogCallback={this.handleOpenDialog} movies={this.state.movies} user={this.state.user} />;
        }
        return (
            <div className="container">
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
                <header>
                    <h1>Advanced Search</h1>
                </header>
                <main>
                    <SearchForm totalResults={this.state.totalResults} searchCallback={this.fetchData} />
                    <Grid>
                        <Cell col={10}>
                            {displayMovies}
                        </Cell>
                    </Grid>
                </main>
            </div>
        );
    }
}

//Displays a form for user to input search information along 
//with search button that calls searchCallback function 
class SearchForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = { //track values for each search
            title: '',
            year: '',
            genre: '',
            movies: [],
        };

        this.handleClick = this.handleClick.bind(this);
        this.handleChangeTitle = this.handleChangeTitle.bind(this);

    }

    componentWillReceiveProps(nextProps) {
        var theMovieTitle = '';
        if (nextProps && (nextProps !== this.props)) {
            theMovieTitle = nextProps;
            //set the state to be new
            this.setState({ title: theMovieTitle.movieTitle });
        }

        //call your search function
        this.props.searchCallback(this.state.title);

    }
    // submits form
    handleClick(event) {
        event.preventDefault();
        this.props.searchCallback(this.state.title, this.state.year, this.state.genre);
    }
    //updates title
    handleChangeTitle(event) {
        var titleSearch = event.target.value;
        this.setState({ title: titleSearch });
    }
    //updates year
    handleChangeYear(event) {
        var yearSearch = event.target.value;
        this.setState({ year: yearSearch });
    }
    //updates genre
    handleChangeGenre(event) {
        var newGenre = event.target.value;
        this.setState({ genre: newGenre });
    }

    render() {
        //generates genre options
        var genreArray = Object.keys(genresObj);
        var options = genreArray.map((key) => {
            return <option value={key}>{genresObj[key]}</option>;
        });

        return (
            <Form inline role="form">
                <FormGroup controlId="formInlineTitle">
                    <ControlLabel>Title</ControlLabel>
                    {' '}
                    <FormControl type="text" placeholder="i.e. Titanic" onChange={this.handleChangeTitle} />
                </FormGroup>
                {' '}
                <FormGroup controlId="formInlineYear">
                    <ControlLabel>Year Released</ControlLabel>
                    {' '}
                    <FormControl type="text" placeholder="i.e. 1997" onChange={(e) => this.handleChangeYear(e)} />
                </FormGroup>
                {' '}
                <FormGroup controlId="formControlsSelect">
                    <ControlLabel>Genre</ControlLabel>
                    <FormControl componentClass="select" placeholder="select" onChange={(e) => this.handleChangeGenre(e)}>
                        <option value="">Select</option>
                        {options}
                    </FormControl>
                </FormGroup>
                {' '}
                <Button type="submit" onClick={(e) => this.handleClick(e)}>
                    Search
        </Button>
            </Form>
        );
    }
}


export default AdvancedSearch;