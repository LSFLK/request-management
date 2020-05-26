import React from 'react';
import {useDispatch} from 'react-redux';

import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import UserList from '../../user/components/UserList'

import { hideModal } from '../state/modal.actions'


const LinkedIndividualsModal = (props) => {

    const {activeIncident,events} = props
    const dispatch = useDispatch()
    return (
        <div>
            <DialogTitle id="form-dialog-title">Assigned Individuals</DialogTitle>
            <DialogContent style={{ marginTop: 10 }}>
                <UserList userIds={activeIncident.linked_individuals} events={events}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => { dispatch(hideModal()) }} color="secondary">
                    Close
                </Button>
            </DialogActions>
        </div>
    );
}

export default LinkedIndividualsModal;
