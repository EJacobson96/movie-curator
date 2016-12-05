import React from 'react';
import { Link, hashHistory } from 'react-router';
import {Form, FormControl, InputGroup, Button, Glyphicon,FormGroup, ControlLabel} from 'react-bootstrap';
import firebase from 'firebase';
import MovieController from './MovieController';
//import md5 from 'js-md5';

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
      movies: [], 
      totalResults: 0
    };

    this.fetchData = this.fetchData.bind(this);
  }

  //helper method
  fetchData(title, year, genre) {
    var thisComponent = this; 
    MovieController.search(title, year, genre)
      .then(function(data) { 
        thisComponent.setState({
          movies:data.results, 
          totalResults:data.total_results
        })

        if (genre && title){    // if searching by genre and title
            console.log("searching both title and genre: " + thisComponent.state.movies)
                // array filtered with genreIDs matching genre search
                var titleGenreMovies = thisComponent.state.movies.filter((movie) => {
                    return movie.genre_ids.some((genreID) => { return genreID == genre });   // checks genre_ids array for matches to genre searched
                })
                thisComponent.setState({movies: titleGenreMovies})   // sets new array of movie objects to state    
            }
      });
       
  }  

  render() {
    return (
      <div className="container">
        <header>
          <h1>Advanced Search</h1>
        </header>
        <main>
          <SearchForm totalResults={this.state.totalResults} searchCallback={this.fetchData}/>
          <MovieTable movies={this.state.movies} />
        </main>
      </div>
    );
  }
}

//table of movie data
class MovieTable extends React.Component {
  render() {

    var rows = this.props.movies.map(function(movieObj){
      return <MovieRow movie={movieObj} />;
    });
  
    return (
      <table className="table table-hover">
        <thead>
          <tr><th className="col-xs-1">Poster</th><th className="col-xs-4">Title</th><th>Released</th><th>Genre</th></tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>      
    );
  }
}

class MovieRow extends React.Component {
  render() {

    var posterUrl = MovieController.getPosterUrl(this.props.movie);

     var genreNames = this.props.movie.genre_ids.map(function(genreID){    // converts genreIDs into words
            return  genresObj[genreID] + "/"
     })

    return (
      <tr>
        <td><img className="poster-lg" src={posterUrl} alt="poster for movie title"/></td>
        <td>{this.props.movie.title}</td>
        <td>{this.props.movie.release_date}</td>
        <td>{genreNames}</td>
      </tr>
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

    handleClick() {
        console.log("You clicked search!");
        console.log('the state title is: ' + this.state.title);

        this.props.searchCallback(this.state.title, this.state.year, this.state.genre); 
    }

    handleChangeTitle(event) {
        var titleSearch = event.target.value;
        console.log("title to search: ", titleSearch);
        this.setState({title: titleSearch});
    }

    handleChangeYear(event) {
        var yearSearch = event.target.value;
        console.log("year to search: ", yearSearch);
        this.setState({year: yearSearch});
    }
    
    handleChangeGenre(event) {
    var newGenre = event.target.value;
    console.log("genre to search:", newGenre);
    this.setState({genre: newGenre});
  }

  render() {
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
                <option value="28">Action</option>
                <option value="12">Adventure</option>
                <option value="16">Animation</option>
                <option value="35">Comedy</option>
                <option value="80">Crime</option>
                <option value="99">Documentary</option>
                <option value="18">Drama</option>
                <option value="10751">Family</option>
                <option value="14">Fantasy</option>
                <option value="36">History</option>
                <option value="27">Horror</option>
                <option value="10402">Music</option>
                <option value="9648">Mystery</option>
                <option value="10749">Romance</option>
                <option value="878">Science Fiction</option>
                <option value="10770">TV Movie</option>
                <option value="53">Thriller</option>
                <option value="10752">War</option>
                <option value="37">Western</option>    
            </FormControl>
            </FormGroup>
        {' '}
        <Button type="submit" onClick={this.handleClick}>
        Search
        </Button>

        <InputGroup>
          <InputGroup.Addon> {this.props.totalResults} results found! </InputGroup.Addon>
        </InputGroup>
      </Form>
    );
  }
}


export default  AdvancedSearch;
