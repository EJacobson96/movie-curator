import React, { Component } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Grid, Cell } from 'react-mdl';
import { Link, hashHistory } from 'react-router';

class DialogBox extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    handleOpenDialog() {
        this.setState({
            openDialog: true,
        });
    }

    handleCloseDialog() {
        this.setState({
            openDialog: false
        });
    }

    render() {
        return (
            <div>
                <Dialog open={this.props.openDialog} onCancel={this.props.closeDialog}>
                    <DialogTitle>Share A Movie</DialogTitle>
                    <DialogContent>
                        <form role="form">
                            <textarea placeholder="Friend's Username" name="text" className="form-control" onChange={(e) => this.updateUsername(e)}></textarea>
                            <p id="recommendMessage">You should watch <Link id="recommendLink" to=""></Link>!</p>
                            <div className="form-group">
                            </div>
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button type='button' onClick={this.handleCloseDialog}>Close</Button>
                        <Button type='button' onClick={(e) => this.submitMessage(e)}>Send</Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

export default DialogBox;