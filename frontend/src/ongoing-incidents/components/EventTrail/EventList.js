import React from 'react';
import Card from '@material-ui/core/Card';
import List from '@material-ui/core/List';
import { withStyles } from '@material-ui/core/styles';

import EventItem from './EventItemWrapper';

const styles = {
    root: {
        width: "100%",
        boxShadow: "none",
        backgroundColor: "transparent",
        paddingTop: "15px"
    },
};

const EventListView = ({ events = [], classes, resolveEvent }) => {

    const colorList=["#FF9AA2","#FFB7B2","#FFDAC1","#E2F0CB","#B5EAD7","#C7CEEA"];
    let createdUserId=null;

    return (
        <Card className={classes.root}>
            <List>
                {events.allIds.map(eventId => {
                    let event=events.byIds[eventId];
                    let color=colorList[(event.initiator.displayname%6)];
                    if (event.action===`CREATED` || event.initiator.uid===createdUserId){
                        color=colorList[4];
                        createdUserId=event.initiator.uid;
                    }
                    return <EventItem event={event} color={color} eventAction={resolveEvent}
                                      key={eventId}/>
                })}
            </List>
        </Card>
    )
}


const EventList = withStyles(styles)(EventListView);

export default EventList;
