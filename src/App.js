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

    componentDidMount() {
        this.unregister = firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.setState({
                    userId: firebaseUser.uid
                });
            } else {
                hashHistory.push('/login');
            }
        });
    }

    componentWillUnmount() {
        if (this.unregister) {
            this.unregister();
        }
    }

    handleOpenInbox() {
        this.setState({ openInbox: true });
    }

    handleCloseInbox() {
        console.log('closing');
        this.setState({ openInbox: false });
    }

    handleSearchChange(event) {
        var titleSearch = event.target.value;
        console.log("title to search: ", titleSearch);
        this.setState({ title: titleSearch });
    }

    handleSearch(event) {
        if (event.charCode === 13) {
            //go to the advanced search page
            hashHistory.push("/search?q=" + this.state.title);
            //the advanced search page should be set to the title
            //the search should be done on that title 
        }
    }


    render() {
        return (
            <div>
                <Layout fixedHeader fixedDrawer>
                    <Header title="The Movie Curator" className="hideOnLarge">
                    </Header>
                    <Drawer title="The Movie Curator">
                    

                        <Form>
                            <FormControl aria-label="quick search" type="text" placeholder="Quick Search..." onChange={this.handleSearchChange} onKeyPress={this.handleSearch} />

                            {/*<FormGroup>
                                <InputGroup>
                                    <FormControl aria-label="quick search" type="text" onChange={this.handleSearchChange} onKeyPress={this.handleSearch} />
                                </InputGroup>
                            </FormGroup>*/}
                        </Form>



                        <Navigation>
                            <Link to="home">Home</Link>
                            <Link to="watchlist">Movie Watchlist</Link>
                            <Link to="search">Search For Movies</Link>
                        </Navigation>
                        <div id="badgeContainer">
                            <Badge id="inboxBadge" text="..." overlap>
                                <Link onClick={() => { this.handleOpenInbox() } }>
                                    <i className="fa fa-inbox" aria-hidden="true"></i>
                                </Link>
                            </Badge>
                        </div>
                        <div className="bottomNav">

                            <Link onClick={() => { this.signOut() } } className="signOut">Sign Out</Link>
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
                        <Inbox updateParent={this.updateState} userId={this.state.userId} />
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
