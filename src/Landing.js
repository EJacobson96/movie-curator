import React, { Component } from 'react';
import { Grid, Cell } from 'react-mdl';
import { Link, hashHistory } from 'react-router';

import './landing.css';

class Landing extends Component {
    render() {
        return (
            <div className="landingPage">
                <Header />
                <GetStarted />
                <Info />
            </div>
        );
    }
}


class Header extends React.Component {
    render() {
        return (
            <header>
                <h1 className="name">THE MOVIE CURATOR</h1>
                <div>
                    <ul>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/join" className="signUp">Sign Up</Link></li>
                    </ul>
                </div>
            </header>
        );
    }
}

class Info extends React.Component {
    render() {
        return (
            <div id="container-two">
                <Grid>
                    <Cell col={5} phone={12} tablet={10} offsetTablet={1}>
                        <div className="info container">
                            <h4>Our personalized movie platform has many capabilities. </h4><br />
                            <ul>
                                <li>Lets you search through a vast database of movies</li>
                                <li>Store a queue of movies to watch</li>
                                <li>You can favorite movies that you like</li>
                                <li>Get a personalized movie list based on the movies that you favorite!</li>
                                <li>Watch trailers and view ratings before adding movies to your watchlist</li>
                                <li>Share movies with other users through a personal inbox!</li>
                            </ul>
                        </div>
                    </Cell>
                    <Cell col={7} tablet={12} hidePhone>
                        <div className="prop">
                            <img className="responsive-img" src={require('../images/prop.png')} alt="website preview" />
                        </div>
                    </Cell>
                </Grid >
            </div >
        );
    }
}

class GetStarted extends React.Component {
    render() {
        return (
            <div id="container-one">
                <div className="poster">
                </div>
                <div className="join contain">
                    <Grid>
                        <Cell col={6}>
                            <div className="joinContent">
                                <p>Find movies specially curated for you</p>
                                <a className="" href="#">Get Started</a>
                            </div>
                        </Cell>
                    </Grid>
                </div>
            </div>
        );
    }
}

export { Header };
export default Landing;
