import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import UserIcon from '@material-ui/icons/AccountCircle';

import {useDispatch, useSelector} from 'react-redux';
import Button from "@material-ui/core/Button/Button";
import * as Scroll from 'react-scroll';
import {hideModal} from "../../modals/state/modal.actions";

const styles = theme => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
});

function hasPendingAction(event){
    return event.action === "WORKFLOW_ACTIONED" &&
        event.data.workflow.type === "Escalate External" &&
        !event.data.workflow.data.isCompleted;
}

function UserList(props) {

    const { classes, userIds, events } = props;
    const userData = useSelector(state=>state.user.users.byIds);
    let pendingEvents={};
    let i=0;
    for (i=0;i<events.allIds.length;i++){
        let event=events.byIds[events.allIds[i]];
        if (hasPendingAction(event)){
                    pendingEvents[event.initiator.uid]=event.id
                }
    }

    var Element = Scroll.Element;
    var scroller = Scroll.scroller;

    const dispatch = useDispatch()

    return (
        <List className={classes.root}>
            {userData &&
            userIds.map((userId, i)=>(
                <ListItem>
                <Avatar>
                    <UserIcon />
                </Avatar>
                <ListItemText 
                    primary={userData[userId].displayname} 
                    secondary={userData[userId].entity.name}  />
                    {pendingEvents[userId]!==undefined?
                        <Button color={"primary"} onClick={()=>{
                            dispatch(hideModal());
                            scroller.scrollTo(pendingEvents[userId], {
                                duration: 500,
                                delay: 0,
                                smooth: true,
                                offset: -100,
                            })
                        }}>View Pending</Button>:null}
                </ListItem>
            ))}
            {userData && userIds.length===0 && <div> No users </div>}
        </List>
    );
}

UserList.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(UserList);
