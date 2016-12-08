import React, { Component } from 'react';
import './App.css';
import { Layout, Header, Navigation, Drawer, Content, Dialog, DialogActions, DialogContent, DialogTitle, Badge, Textfield } from 'react-mdl';
import { Link, hashHistory } from 'react-router';
import SignIn from './SignIn';
import Inbox from './Inbox';
import firebase from 'firebase';
import AdvancedSearch from './AdvancedSearch';
import { Form, FormControl, InputGroup, Button, Glyphicon, FormGroup, ControlLabel } from 'react-bootstrap';

import Controller from './DataController'

import 'whatwg-fetch';

// Overarching app component that contains navigation around the child components
class App extends Component {
    constructor(props) {
        super(props);

        this.state = { openInbox: false, title: '' };

        this.handleOpenInbox = this.handleOpenInbox.bind(this);
        this.handleCloseInbox = this.handleCloseInbox.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
    }

    // Signs the user out
    signOut() {
        firebase.auth().signOut();
    }

    // Get the user info when the component mounts and update state with data
    // If user is not logged in, redirect to login screen
    componentDidMount() {
        this.unregister = firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.setState({
                    user: firebaseUser,
                    userId: firebaseUser.uid
                });
            } else {
                hashHistory.push('/login');
            }
        });
    }

    // Unregister the firebase listener when the component is unmounted
    componentWillUnmount() {
        if (this.unregister) {
            this.unregister();
        }
    }

    // Adjust the state to open the inbox dialog
    handleOpenInbox() {
        this.setState({ openInbox: true });
    }

    // Adjust the state to close the inbox dialog
    handleCloseInbox() {
        this.setState({ openInbox: false });
        // Necessary to fix a bug with React-MDL's Dialog component
        // https://github.com/react-mdl/react-mdl/issues/253
        document.getElementsByClassName('mdl-layout__inner-container')[0].style.overflowX = 'auto';
        document.getElementsByClassName('mdl-layout__inner-container')[0].style.overflowX = '';
    }

    // Adjust the state to the event's target
    handleSearchChange(event) {
        var titleSearch = event.target.value;
        this.setState({ title: titleSearch });
    }

    // Redirect the user to the advanced search page with a the input's search query
    handleSearch(event) {
        // If enter key is pressed, search
        if (event.charCode === 13) {
            event.preventDefault();
            //go to the advanced search page
            hashHistory.push("/search?q=" + this.state.title);
        }
    }

    // Render the main App component
    render() {
        // Conditionally render the logout button to show the name, and the inbox, once the 
        // user data is set
        var logout = <Link onClick={() => { this.signOut() } } className="signOut">Sign Out</Link>;
        if (this.state.user) {
            logout = <Link onClick={() => { this.signOut() } } className="signOut">Sign Out{', ' + this.state.user.displayName.split(' ')[0]}</Link>;
            var inbox = <Inbox updateParent={this.updateState} userId={this.state.user.uid} />;
        }

        return (
            <div>
                <Layout fixedHeader fixedDrawer>
                    <Header title="THE MOVIE CURATOR" className="hideOnLarge">
                    </Header>
                    <Drawer title="THE MOVIE CURATOR">
                        <Form>
                            <FormGroup>
                                <InputGroup className="searchForm">
                                    <InputGroup.Addon><Glyphicon glyph="search" /></InputGroup.Addon>
                                    <FormControl className="quickSearch" aria-label="quick search" type="text" placeholder="Search" onChange={this.handleSearchChange} onKeyPress={this.handleSearch} />
                                </InputGroup>
                            </FormGroup>
                        </Form>
                        <Navigation>
                            <Link to="home" activeClassName="activeLink">Home</Link>
                            <Link to="recommended" activeClassName="activeLink">Recommended Movies</Link>
                            <Link to="watchlist" activeClassName="activeLink">Movie Watchlist</Link>
                            <Link to="search" activeClassName="activeLink">Advanced Search</Link>
                        </Navigation>

                        <div className="bottomNav">
                            <div id="badgeContainer">
                                <Badge id="inboxBadge" text="..." overlap>
                                    <Link onClick={() => { this.handleOpenInbox() } } className="inboxButton">Inbox</Link>
                                </Badge>
                            </div>

                            {logout}
                        </div>
                    </Drawer>
                    <Content>
                        <div className="mainContent">
                            {this.props.children}
                        </div>
                    </Content>
                </Layout>

                <Dialog open={this.state.openInbox}>
                    <DialogTitle>Inbox</DialogTitle>
                    <DialogContent>
                        {inbox}
                    </DialogContent>
                    <DialogActions>
                        <Button type='button' onClick={this.handleCloseInbox}>Close</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default App;