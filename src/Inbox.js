import React, { Component } from 'react';
import firebase from 'firebase';
import moment from 'moment';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, List, ListItem, ListItemAction, Icon, ListItemContent } from 'react-mdl';

import Controller from './DataController';

class Inbox extends React.Component {
    constructor(props) {
        super(props);

        this.state = { loading: true };
    }

    componentWillReceiveProps(nextProps) {
        var inboxRef = firebase.database().ref('users/' + nextProps.userId + '/inbox');
        inboxRef.on('value', (snapshot) => {
            this.setState({
                messages: snapshot.val(),
                loading: false
            });
            document.querySelector('#inboxBadge').setAttribute('data-badge', snapshot.val().length - 1);
        });
    }

    render() {
        return (
            <MessageList userId={this.props.userId} messages={this.state.messages} />
        );
    }
}

class MessageList extends React.Component {
    render() {
        console.log(this.props.messages);
        var messages = <p>Loading messages...</p>;
        if (this.props.messages) {
            messages = this.props.messages.map((message) => {
                return <Message userId={this.props.userId} message={message} />
            });
        }

        return (
            <List>
                {messages}
            </List>
        );
    }
}

class Message extends React.Component {
    constructor(props) {
        super(props);

        this.deleteMessage = this.deleteMessage.bind(this);
    }

    deleteMessage() {
        console.log(this.props.message);
        firebase.database().ref('users/' + this.props.userId + '/inbox/' + this.props.message.id).remove();
    }

    render() {
        var content = this.props.message.content;
        var author = this.props.message.fromUserName;
        var avatar = <img src={this.props.message.fromUserAvatar} alt={author} />;
        var date = this.props.message.date;

        var actions = [
            <a aria-label="delete" onClick={this.deleteMessage}><Icon name="delete" /></a>,
        ];

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