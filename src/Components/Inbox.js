import React, { Component } from 'react';
import firebase from 'firebase';
import moment from 'moment';
import { Link } from 'react-router';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, List, ListItem, ListItemAction, Icon, ListItemContent } from 'react-mdl';

import Controller from '../DataController';

//  Displays an inbox for viewing your messages, as a user
class Inbox extends React.Component {
    constructor(props) {
        super(props);

        this.state = { loading: true };
        this.getMessages = this.getMessages.bind(this);
    }

    componentDidMount() {
        this.getMessages(this.props);
    }

    // If component (somehow) receives new data, get messages for the new user
    componentWillReceiveProps(nextProps) {
        this.getMessages(nextProps);
    }

    // Get the messages for the signed in user, adjust the badge to reflect number of messages
    getMessages(props) {
        var inboxRef = firebase.database().ref('users/' + props.userId + '/inbox');
        inboxRef.on('value', (snapshot) => {
            this.setState({
                messages: snapshot.val(),
                loading: false
            });
            if (snapshot.val()) {
                document.querySelector('#inboxBadge').setAttribute('data-badge', Object.keys(snapshot.val()).length);
            } else {
                document.querySelector('#inboxBadge').setAttribute('data-badge', '0');
            }
        });
    }

    // Render our inbox
    render() {
        return (
            <MessageList userId={this.props.userId} messages={this.state.messages} />
        );
    }
}

// Displays a list of the users messages
class MessageList extends React.Component {
    // Conditionally render the messages, when they have been fetched,
    // otherwise, show a loading message
    render() {
        var messages = <p>Loading messages...</p>;
        if (this.props.messages) {
            var messageArray = Object.keys(this.props.messages);
            messages = messageArray.map((message) => {
                return <Message userId={this.props.userId} messageId={message} message={this.props.messages[message]} />
            });
        } else {
            messages = <p>No new messages here.</p>;
        }

        return (
            <List>
                {messages}
            </List>
        );
    }
}

// Displays a message component that allows you to delete your messages
class Message extends React.Component {
    constructor(props) {
        super(props);

        this.deleteMessage = this.deleteMessage.bind(this);
    }

    // Delete the message
    deleteMessage() {
        firebase.database().ref('users/' + this.props.userId + '/inbox/' + this.props.messageId).remove();
    }

    // render our message, with actions
    render() {
        var sentence = "Check out the movie";
        var content = <Link to={'movie/' + this.props.message.id}>{"Check out the movie " + this.props.message.content + "!"}</Link>;
        var author = this.props.message.fromUserName;
        var avatar = <img src={this.props.message.fromUserAvatar} alt={author} />;
        var date = this.props.message.date;

        var actions = <a aria-label="delete" onClick={this.deleteMessage}><Icon name="delete" /></a>;

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

export default Inbox;