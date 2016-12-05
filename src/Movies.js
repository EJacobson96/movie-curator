import React from 'react';
import firebase from 'firebase';
import { Grid, Cell, List, ListItem } from 'react-mdl';
import YouTube from 'react-youtube';
import moment from 'moment';
import { hashHistory } from 'react-router';
import Controller from './DataController';
import Comments from './Comments';


class Movies extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
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

    render() {
        var card = [];
        if (this.state.movie && this.state.cast) {
            card = <DetailedMovieCard cast={this.state.cast} movie={this.state.movie} trailer={this.state.trailer} />;
        }

        var comments = [];
        if (this.state.movie && this.state.user) {
            comments = <Comments user={this.state.user} movieId={this.state.movie.id} />
        }

        return (
            <div className="moviePage">
                <h1>Movie Details</h1>
                {card}

                <h1>Comments</h1>
                {comments}
            </div>
        );
    }
}

class DetailedMovieCard extends React.Component {
    render() {
        console.log('movie', this.props.movie);
        const opts = {
            height: '316px',
            width: '100%',
        };

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
                                <img className="responsive-img" src={'https://image.tmdb.org/t/p/original/' + this.props.movie.poster_path} role='presentation' />
                            </div>
                        </Cell>

                        <Cell col={9}>
                            <div className="trailerSection video-container">
                                {/*<iframe width="560" height="315" src={"https://www.youtube.com/embed/" + this.props.trailer.key} frameborder="0" allowfullscreen></iframe>*/}

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

                                            <button className="btn btn-primary" onClick={() => this.saveMovie(this.props.movie.poster_path, this.props.movie.original_title, this.props.movie.overview)}>
                                                <p>Watchlist</p>
                                                <i className="material-icons">add_to_queue</i>
                                            </button>

                                            <button className="btn btn-primary" onClick={() => this.saveMovie(this.props.movie.poster_path, this.props.movie.original_title, this.props.movie.overview)}>
                                                <p>Favorite</p>
                                                <i className="material-icons">favorite_border</i>
                                            </button>
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

export default Movies;