import React, { Component } from 'react';
import firebase from 'firebase';
import moment from 'moment';
import _ from 'lodash';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, List, ListItem, ListItemAction, Icon, ListItemContent, Textfield, Cell, FABButton, Grid } from 'react-mdl';

import Controller from './DataController';

// Component for displaying a list of comments for a movie
class Comments extends React.Component {
    constructor(props) {
        super(props);

        this.state = { loading: true };
        this.updateState = this.updateState.bind(this);
    }

    // Update the state when first mounted
    componentDidMount() {
        this.updateState(this.props);
    }

    // If new props are received (new movie page is loaded), update the state
    componentWillReceiveProps(nextProps) {
        if (nextProps.movieId !== this.props.movieId) {
            this.updateState(nextProps);
        }
    }

    // Updates the state of the component with the given props,
    // setting the messages and the user
    updateState(props) {
        var inboxRef = firebase.database().ref('comments/' + props.movieId);
        inboxRef.on('value', (snapshot) => {
            this.setState({
                messages: snapshot.val(),
                loading: false,
                user: props.user
            });
        });
    }

    // render our Comments component with a post section, and comment list 
    render() {
        return (
            <div>
                <PostComment currentUser={this.props.user} movieId={this.props.movieId} />
                <CommentList currentUser={this.props.user} messages={this.state.messages} movieId={this.props.movieId} />
            </div>
        );
    }
}

// Displays a form for the user to post a new comment
class PostComment extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            message: ''
        };
    }

    // Update the component with the user's message
    // pre: must have an event from a textfield 
    updateMessage(event) {
        this.setState({ message: event.target.value });
    }

    // Post the new message to the channel/database
    postMessage(event) {
        event.preventDefault();
        var commentRef = firebase.database().ref('comments/' + this.props.movieId);
        var newMessage = {
            fromUserID: this.props.currentUser.uid,
            fromUserName: this.props.currentUser.displayName,
            fromUserAvatar: this.props.currentUser.photoURL,
            content: this.state.message,
            date: firebase.database.ServerValue.TIMESTAMP
        }

        commentRef.push(newMessage);

        // Reset component's message after update
        this.setState({ message: '' });
        document.querySelector('#message_input').value = '';
    }

    // render our form
    render() {
        return (
            <Grid>
                <Cell col={12} className="message_entry">
                    <Grid id="formGrid">
                        <Cell col={10}>
                            <Textfield
                                onChange={(e) => { this.updateMessage(e) } }
                                label="New Comment..."
                                aria-label="new comment text"
                                id="message_input"
                                />
                        </Cell>
                        <Cell col={2}>
                            <FABButton className="FABCell" ripple onClick={(e) => this.postMessage(e)}>
                                <Icon name="add" />
                            </FABButton>
                        </Cell>
                    </Grid>
                </Cell>
            </Grid>
        );
    }
}

// Displays a list of comments
class CommentList extends React.Component {
    // render the list of comments with all of the messages for the movie
    render() {
        var messages = <p>Loading comments...</p>;
        if (this.props.messages && this.props.currentUser) {
            var messagesArray = _.reverse(Object.keys(this.props.messages));
            messages = messagesArray.map((message) => {
                return <Comment currentUser={this.props.currentUser} message={this.props.messages[message]} messageId={message} movieId={this.props.movieId} />
            });
        } else {
            messages = <p>No comments. Be the first to share your thoughts!</p>
        }

        return (
            <List>
                {messages}
            </List>
        );
    }
}

// Displays a single comment, allowing you to delete your own
class Comment extends React.Component {
    constructor(props) {
        super(props);

        this.deleteMessage = this.deleteMessage.bind(this);
    }

    // Deletes the message from firebase
    deleteMessage() {
        firebase.database().ref('comments/' + this.props.movieId + '/' + this.props.messageId).remove();
    }

    // Render the single comment with the passed down message data
    render() {
        var content = this.props.message.content;
        var author = this.props.message.fromUserName;
        var avatar = <img src={this.props.message.fromUserAvatar} alt={author} />;
        var date = this.props.message.date;

        var actions = [];
        if (this.props.currentUser.uid == this.props.message.fromUserID) {
            actions = <a className="actions" caria-label="delete" onClick={this.deleteMessage}><Icon name="delete" /></a>;
        }

        return (
            <ListItem threeLine>
                <ListItemContent avatar={avatar} subtitle={content}>{author} <span className="time">{moment(date).fromNow()}</span></ListItemContent>
                <ListItemAction>
                    {actions}
                </ListItemAction>
            </ListItem>
        );
    }
}

export default Comments;