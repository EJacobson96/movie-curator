import React from 'react';
import { Link, hashHistory } from 'react-router';
import { Form, FormControl, InputGroup, Button, Glyphicon, FormGroup, ControlLabel } from 'react-bootstrap';
import firebase from 'firebase';
import DataController from '../DataController';
import { DisplayMovies, PleaseWork, MovieCard } from './Watchlist';
import { Grid, Cell } from 'react-mdl';

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

class AdvancedSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      movies: []
    };

    this.fetchData = this.fetchData.bind(this);
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


  //helper method
  fetchData(title, year, genre) {
    DataController.advancedSearch(title, year, genre)
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
    var displayMovies = <p>No results found.</p>;
    if (this.state.user && this.state.movies && this.state.movies.length > 0) {
      displayMovies = <DisplayMovies movies={this.state.movies} user={this.state.user} />;
    }

    return (
      <div className="container">
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
    //   look like the above thing a bit
    var theMovieTitle = '';
    if (nextProps && (nextProps !== this.props)) {
      theMovieTitle = nextProps;
      //set the state to be new
      this.setState({ title: theMovieTitle.movieTitle });
    }

    //call your search function
    this.props.searchCallback(this.state.title);

  }

  handleClick(event) {
    event.preventDefault();
    this.props.searchCallback(this.state.title, this.state.year, this.state.genre);
  }

  handleChangeTitle(event) {
    var titleSearch = event.target.value;
    this.setState({ title: titleSearch });
  }

  handleChangeYear(event) {
    var yearSearch = event.target.value;
    this.setState({ year: yearSearch });
  }


  handleChangeGenre(event) {
    var newGenre = event.target.value;
    this.setState({ genre: newGenre });
  }

  render() {
    var genreArray = Object.keys(genresObj);
    var options = genreArray.map((key) => {
      return <option value={key}>{genresObj[key]}</option>;
    });

    return (
      <Form inline>
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