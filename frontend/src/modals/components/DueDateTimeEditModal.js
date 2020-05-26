import React, { useState } from "react";
import { useDispatch } from "react-redux";
import moment from 'moment';

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import { hideModal  } from '../state/modal.actions'
import { updateInternalIncident } from '../../incident/state/incidentActions';

const DueDateTimeEditModal = (props) => {
  const dispatch = useDispatch();
  const { activeIncident } = props;
  const dateValue = moment(activeIncident.dueDate).format().substr(0, 16)
  const [dueDate, setDueDate] = useState(dateValue);

  return (
    <div>
      <DialogTitle id="form-dialog-title">Change Due Date and Time</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {/* This should be addressed and closed by: */}
        </DialogContentText>
        <TextField
          id="dueDate"
          name="dueDate"
        //   label="Select Date and Time"
          type="datetime-local"
          value={dueDate}
        //   className={classes.textField}
        //   InputLabelProps={{
        //     shrink: true,
        //   }}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            dispatch(hideModal());
          }}
          color="secondary"
        >
          Close
        </Button>
        <Button
          onClick={() => {
            var activeIncidentUpdate = { ...activeIncident };
            activeIncidentUpdate.dueDate = dueDate;
            dispatch(
              updateInternalIncident(activeIncident.id, activeIncidentUpdate)
            );
            dispatch(hideModal());
          }}
          color="primary"
        >
          Change Date and Time
        </Button>
      </DialogActions>
    </div>
  );
};

export default DueDateTimeEditModal;
