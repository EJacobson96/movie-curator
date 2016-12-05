import React, { Component } from 'react';
import firebase from 'firebase';
import moment from 'moment';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, List, ListItem, ListItemAction, Icon, ListItemContent } from 'react-mdl';

import Controller from './DataController';

class Comments extends React.Component {
    constructor(props) {
        super(props);

        this.state = { loading: true };
        this.updateState = this.updateState.bind(this);
    }

    componentDidMount() {
        this.updateState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.movieId !== this.props.movieId) {
            this.updateState(nextProps);
        }
    }

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

    render() {
        console.log('rendering with state:', this.state);
        return (
            <CommentList currentUser={this.props.user} messages={this.state.messages} />
        );
    }
}

class CommentList extends React.Component {
    render() {
        var messages = <p>Loading comments...</p>;
        if (this.props.messages && this.props.currentUser) {
            console.log('making comments');
            messages = this.props.messages.map((message) => {
                return <Comment currentUser={this.props.currentUser} message={message} />
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

class Comment extends React.Component {
    constructor(props) {
        super(props);

        this.deleteMessage = this.deleteMessage.bind(this);
    }

    deleteMessage() {
        firebase.database().ref('users/' + this.props.currentUser.id + '/inbox/' + this.props.message.id).remove();
    }

    render() {
        var content = this.props.message.content;
        var author = this.props.message.fromUserName;
        var avatar = <img src={this.props.message.fromUserAvatar} alt={author} />;
        var date = this.props.message.date;

        var actions = [];
        if (this.props.currentUser.uid == this.props.message.fromUserID) {
            console.log('setting actions');
            actions = <a aria-label="delete" onClick={this.deleteMessage}><Icon name="delete" /></a>;
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