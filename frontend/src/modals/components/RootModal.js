import React from 'react';
import { useSelector, useDispatch } from 'react-redux'

import Dialog from '@material-ui/core/Dialog';
import { withStyles } from '@material-ui/core/styles';

import { hideModal } from '../state/modal.actions'

import ResponseTimeEditModal from './ResponseTimeEditModal';
import VerifyConfirmModal from './VerifyConfirmModal'
import EscalateModal from './EscalateModal';
import EscallateOutsideModal from './EscallateOutsideModal';
import ChangeAssigneeModal from './ChangeAssigneeModal';
import RequestAdviceModal from './RequestAdviceModal';
import ProvideAdviceModal from './ProvideAdviceModal';
import CloseModal from './CloseModal';
import CompleteOutsideActionModal from './CompleteOutsideActionModal'
import InvalidateModal from './InvalidateModal';
import ReopenModal from './ReopenModal';
import SendCannedResponseModal from './CannedResponseModal'
import LinkedIndividualsModal from './LinkedIndividualModal'
import DueDateTimeEditModal from './DueDateTimeEditModal'
import IdleTimeOutModal from './IdleTimeOutModal'

const MODAL_COMPONENTS = {
    'RESPONSE_TIME_EDIT': ResponseTimeEditModal,
    'VERIFY_CONFIRM_MODAL': VerifyConfirmModal,
    'ESCALATE_MODAL': EscalateModal,
    'ESCALLATE_OUTSIDE': EscallateOutsideModal,
    'CHANGE_ASSIGNEE_MODAL': ChangeAssigneeModal,
    'REQUEST_ADVICE_MODAL': RequestAdviceModal,
    'PROVIDE_ADVICE_MODAL': ProvideAdviceModal,
    'CLOSE_MODAL': CloseModal,
    'COMPLETE_OUTSIDE_ACTION_MODAL':CompleteOutsideActionModal,
    'INVALIDATE_MODAL': InvalidateModal,
    'REOPEN_MODAL': ReopenModal,
    'CANNED_RESPONSE': SendCannedResponseModal,
    'LINKED_INDIVIDUAL_MODAL': LinkedIndividualsModal,
    'DUE_DATE_TIME_EDIT_MODAL': DueDateTimeEditModal,
    'IDLE_TIME_OUT_MODAL': IdleTimeOutModal,
    /* other modals */
}

const styles = theme => ({
    root : {
        minWidth: 600,
        padding:30
    },

})

const RootModal = (props) => {

    const { classes } = props

    // this retrieves props from the reducer
    const {modalType, modalProps} = useSelector(state => state.modal)
    const dispatch = useDispatch()

    if (!modalType) {
        return null
    }

    const ModalContent = MODAL_COMPONENTS[modalType]

    return (
        <div>
            <Dialog
                classes={{
                    root:classes.root,
                    fullWidth:true
                }}
                open={modalType?true:false}
                onClose={()=>{dispatch(hideModal())}}
                aria-labelledby="form-dialog-title"
                fullWidth={true}
                maxWidth={"sm"}
            >
                <ModalContent className={classes.root} {...modalProps}  />
            </Dialog>
        </div>
    );
}

export default withStyles(styles) (RootModal);
