import React, { Component } from 'react';
import { Grid, Cell } from 'react-mdl';
import { Link, hashHistory } from 'react-router';
import Landing, { Header } from './Landing';

import './landing.css';

class Start extends Component {
    render() {
        return (
            <div className="landingPage">
                <Header />
                {this.props.children}
            </div>
        );
    }
}


export default Start;
