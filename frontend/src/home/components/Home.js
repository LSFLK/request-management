import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from "react-router";

import { withStyles } from '@material-ui/core/styles';
import { Card, Grid, CardContent, CardHeader } from '@material-ui/core';
import ManagedIncidentList from './ManagedIncidentList';
import { useSelector } from 'react-redux';
import { userCan, USER_ACTIONS } from '../../user/userUtils';

const drawerWidth = 240;
const styles = theme => ({
    root: {
        display: 'flex',
    }
});
const Home = ({classes, ...props}) =>{
    const user = useSelector(state => state.shared.signedInUser.data);

    return (
        <Grid direction="column" container>
            {userCan(user, null, USER_ACTIONS.CAN_REVIEW_ALL_INCIDENTS) && (
                <>
                <Grid xs={12} item>
                    <Card xs={6}>
                        <CardHeader 
                            title="Complaints Assigned to You"
                        />
                        <CardContent>
                            <ManagedIncidentList 
                                filters={ { assignee: "me" } }
                            />
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid xs={12} item style={{paddingTop:"10px"}}>
                    <Card xs={6}>
                        <CardHeader 
                            title="Complaints Linked to You"
                        />
                        <CardContent>
                            <ManagedIncidentList 
                                filters={ { user_linked: "me" } }
                            />
                        </CardContent>
                    </Card>
                </Grid>
                </>
            )}

            {!userCan(user, null, USER_ACTIONS.CAN_REVIEW_ALL_INCIDENTS) && (
                <>
                <Grid xs={12} item style={{paddingTop:"10px"}}>
                    <Card xs={6}>
                        <CardHeader 
                            title="Your Incidents"
                        />
                        <CardContent>
                            <ManagedIncidentList 
                                filters={ { user_linked: "me" } }
                            />
                        </CardContent>
                    </Card>
                </Grid>
                </>
            )}
        </Grid>
        
    )
}

export default withRouter(withStyles(styles, { withTheme: true })(Home));