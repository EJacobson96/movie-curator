import React, { Component } from 'react';
import Controller from './DataController';
import firebase from 'firebase';
import { hashHistory } from 'react-router';

class WatchList extends Component {
    componentDidMount() {
        /* Add a listener and callback for authentication events */
        this.state = {};
        this.unregister = firebase.auth().onAuthStateChanged(user => {
            if(user) {
                console.log('Auth state changed: logged in as', user.email);
                this.setState({userId:user.uid, userName:user.displayName});
            }
            else{
                hashHistory.push('login');
                //null out the saved state
            }
        })
    }

    componentWillUnmount() {
        if(this.unregister){ //if have a function to unregister with
            this.unregister(); //call that function!
        }
    }
    signOut() {
        firebase.auth().signOut()
        hashHistory.push('login');
    }
    render () {
        return (
            <div>
                <button className="btn btn-primary logOutDrawer" onClick={()=>this.signOut()}>Log Out</button>
                {/*<MovieData userInput='Arrival' /> */}
                <Movies />
                
            </div>
        )
    }
}

class MovieData extends Component {
    constructor(props) {
        super(props);
        this.state = {movieData:[]}
        this.fetchData = this.fetchData.bind(this);
    }

    fetchData(searchTerm) {
        var thisComponent = this;
        var movies = [];
        Controller.search(searchTerm)
        .then((data) => {
            movies = data.results.splice(0,5);
            thisComponent.setState({movieData:movies})
        })
        .catch((err) => console.log(err));
    }

    render() {
        return (
            <div>
                <Movies fetchData={this.fetchData(this.props.userInput)} searchMovies={this.state.movieData} />
            </div>
        );
    }
}

class Movies extends Component {
    constructor(props){
        super(props);
        this.state = {watchlist:[]};
    }

    //Lifecycle callback executed when the component appears on the screen.
    //It is cleaner to use this than the constructor for fetching data
    componentDidMount() {
         var usersRef = firebase.database().ref('users');
             usersRef.on('value', (snapshot) => {
             this.setState({users:snapshot.val()});
         });
        /* Add a listener for changes to the movies object, and save in the state */
         var watchlistRef = firebase.database().ref('users/'+ firebase.auth().currentUser.uid + '/watchlist');
         watchlistRef.on('value', (snapshot) => {
         var watchlistArray = []; //could also do this processing in render
         var movieObjects = snapshot.val();
         Object.keys(movieObjects).forEach(function(child){
             watchlistArray.push(movieObjects[child]); //make into an array
         });
         this.setState({watchlist:watchlistArray});
         });
    }

    componentWillUnmount() {
        //unregister listeners
        firebase.database().ref('users').off();
        firebase.database().ref('users/'+ firebase.auth().currentUser.uid + '/watchlist').off();
    }

    render() {
        var movierow = this.state.watchlist.map(function(movie) {
            return <MovieCard MoviePoster={movie.poster_path} MovieOverview={movie.overview}
            MovieTitle={movie.original_title} MovieId={movie.id} key={movie.key} />;
        })
        return (
            <div> 
                {movierow}
            </div>
        );
    }
}

class MovieCard extends Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    saveMovie(poster, title, overview, id) {
        var idRef = firebase.database().ref('users/'+ firebase.auth().currentUser.uid + '/watchlist');
        idRef.once('value', (snapshot) => {
            console.log('1');
            var movieObject = snapshot.val();
            var idExists = this.checkId(id, movieObject);
            console.log(movieObject);
            console.log(idExists);
            if (movieObject == null || !idExists) {
                console.log('2');
                var userRef = firebase.database().ref('users/'+ firebase.auth().currentUser.uid + '/watchlist/' + id);
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
                console.log('3');
                var watchlistRef = firebase.database().ref('users/'+ firebase.auth().currentUser.uid + '/watchlist/' + id)
                if (movieObject[id].Saved) {
                    watchlistRef.child('Saved').set(false);
                } else {
                    watchlistRef.child('Saved').set(true);
                }    
            }
        })
        this.setState({});
    }

    favoriteMovie(id) {
        var idRef = firebase.database().ref('users/'+ firebase.auth().currentUser.uid + '/watchlist');
        idRef.once('value', (snapshot) => {
            var movieObject = snapshot.val();
            var watchlistRef = firebase.database().ref('users/'+ firebase.auth().currentUser.uid + '/watchlist/' + id)
            if (movieObject[id].Favorited) {
                watchlistRef.child('Favorited').set(false);
            } else {
                watchlistRef.child('Favorited').set(true);
            }    
        })
        this.setState({});        
    }

    checkId (movieId, obj) {
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
        var saved = null;
        var userRef = firebase.database().ref('users/'+ firebase.auth().currentUser.uid + '/watchlist/');
        userRef.once('value', (snapshot) => {
            var movieObject = snapshot.val();
            if (!movieObject[this.props.MovieId].Saved) {
                saved = <button className="btn btn-primary" onClick={()=> this.saveMovie(this.props.MoviePoster, this.props.MovieTitle, this.props.MovieOverview,this.props.MovieId)}><p>Watchlist</p><i className="material-icons">add_to_queue</i></button>
            } else {
            saved = <button className="btn btn-primary" onClick={()=> this.saveMovie(this.props.MoviePoster, this.props.MovieTitle, this.props.MovieOverview,this.props.MovieId)}><p>Watchlist</p><i className="material-icons">indeterminate_check_box</i></button> 
        }
            if (!movieObject[this.props.MovieId].Favorited) {
                favorited = <button className="btn btn-primary" onClick={()=> this.favoriteMovie(this.props.MovieId)}><p>Favorite</p><i className="material-icons">favorite_border</i></button>  
        } else {
                favorited = <button className="btn btn-primary" onClick={()=> this.favoriteMovie(this.props.MovieId)}><p>Favorite</p><i className="material-icons">favorite</i></button>
            }           
        })
        return (
            <div className="movieCard">
                <div className="imgSection"><img src={'https://image.tmdb.org/t/p/original/' + this.props.MoviePoster} role='presentation'/></div>
                <div className="cardSection">
                    <h2>{this.props.MoviteTitle}</h2>
                    <p>{this.props.MovieOverview}</p>    
                    {saved}
                    {favorited}  
                    <button className="btn btn-primary" onClick={()=> this.shareMovie()}><i className="material-icons">mail_outline</i></button>
                </div>
            </div>
        );
    }
}

export default WatchList;