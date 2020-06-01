import React, { Component, cloneElement, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Tabs, withStyles } from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Moment from 'react-moment';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { useIntl } from 'react-intl';

function TabContainer(props) {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

function LinkTab(props) {
    return <Tab component="a" onClick={event => event.preventDefault()} {...props} />;
}

const styles = theme => ({
    root: {
        backgroundColor: "transparent",
        boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)",
        border: "1px solid #ccc"
    },
    paper: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
        margingBottom: 50,
    }
});

// dictionary map for occurrence
const occurrence = {
    "OCCURRED": "Occurred",
    "OCCURRING": "Occurring",
    "WILL_OCCUR": "Will Occur"
}

/**
 * Basic Information TabView - (1)
 */
function BasicDetailTab(props) {
    const { classes, incident, elections, categories, channels, institutions } = props;
    const { formatMessage: f } = useIntl();

    return (
        <div>
            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <Paper elevation={1} className={classes.paper}>

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography className={classes.label}> {f({id: "request.management.home.incidents.list.refid"})} </Typography>
                                <Typography variant="h4" gutterBottom> {incident.refId} </Typography>
                            </Grid>
                        </Grid>

                        {/* <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.title"})} </Typography>
                                <Typography gutterBottom> {incident.title} </Typography>
                            </Grid>
                        </Grid> */}

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.description"})} </Typography>
                                <Typography gutterBottom> {incident.description} </Typography>
                            </Grid>
                        </Grid>

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({ id: "request.management.incident.create.severity", defaultMessage: "Priority*" })} </Typography>
                                <Chip label={incident.severity} color={incident.severity==="LOW" ? "default" : incident.severity==="HIGH" ? "secondary" : "primary"} />
                            </Grid>
                        </Grid>

                        {incident.incidentType === 'COMPLAINT' &&
                            <>
                                {/* <Grid container spacing={24}>
                                    <Grid item xs>
                                        <Typography variant="caption" className={classes.label}> Occurrence </Typography>
                                        <Typography gutterBottom> {occurrence[incident.occurrence]} </Typography>
                                    </Grid>
                                </Grid> */}

                                <Grid container spacing={24}>
                                    <Grid item xs>
                                        <Typography variant="caption" className={classes.label}>{f({id: "request.management.incident.create.date"})} </Typography>
                                        <Typography gutterBottom>
                                            {(incident.occured_date) ? <Moment format="YYYY/MM/DD">{incident.occured_date}</Moment> : "No date set"}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs>
                                        <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.time"})} </Typography>
                                        <Typography gutterBottom>
                                            {(incident.occured_date) ? <Moment format="HH:mm">{incident.occured_date}</Moment> : "No time set"}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </>
                        }

                        {incident.incidentType === 'INQUIRY' &&
                            <Grid container spacing={24}>
                                <Grid item xs>
                                    <Typography variant="caption" className={classes.label}>{f({id: "request.management.incident.create.date"})}</Typography>
                                    <Typography gutterBottom> {incident.receivedDate} </Typography>
                                </Grid>
                                <Grid item xs>
                                    <Typography variant="caption" className={classes.label}>{f({id: "request.management.incident.create.date"})}</Typography>
                                    <Typography gutterBottom> {incident.letterDate} </Typography>
                                </Grid>
                            </Grid>
                        }

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.review.logged_date"})} </Typography>
                                <Typography gutterBottom> <Moment format="YYYY/MM/DD">{incident.createdDate}</Moment> </Typography>
                            </Grid>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.review.logged_time"})} </Typography>
                                <Typography gutterBottom> <Moment format="HH:mm">{incident.createdDate}</Moment> </Typography>
                            </Grid>
                        </Grid>

                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <Paper elevation={1} className={classes.paper}>

                        {/* <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography className={classes.label}> Election </Typography>
                                <Typography variant="h6" gutterBottom>
                                    {elections.map((value, index) => (value.code === incident.election ? value.name : null))}
                                </Typography>
                            </Grid>
                        </Grid> */}

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.category"})} </Typography>
                                <Typography gutterBottom>
                                    {categories.map((value, index) => (value.id == incident.category ? value.sub_category : null))}
                                </Typography>
                            </Grid>
                            {/* <Grid item xs>
                                <Typography variant="caption" className={classes.label}> Sub Category </Typography>
                                <Typography gutterBottom> {this.state.category.sub_category} </Typography>
                            </Grid> */}
                        </Grid>

                        {incident.incidentType === 'INQUIRY' &&
                            <Grid container spacing={24}>
                                <Grid item xs>
                                    <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.review.institution"})} </Typography>
                                    <Typography gutterBottom>
                                        {
                                            incident.institution && institutions.byCode[incident.institution] ?
                                                institutions.byCode[incident.institution].name : ""
                                        }
                                    </Typography>
                                </Grid>
                            </Grid>
                        }

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.mode_of_receipt"})}</Typography>
                                <Typography gutterBottom>
                                    {channels.map((value, index) => (value.id == incident.infoChannel ? value.name : null))}
                                </Typography>
                            </Grid>
                        </Grid>

                    </Paper>
                </Grid>
            </Grid>


        </div>
    );
}

const resolveLocationName = (locationId, locatoinData) => {
    if (locationId && locatoinData.byCode[locationId]) {
        return locatoinData.byCode[locationId].name
    } else {
        return ""
    }
}

/**
 * Location Information TabView - (3)
 */
function LocationTab(props) {

    const { classes, incident, provinces, districts, pollingDivisions, policeStations } = props;
    const { formatMessage: f } = useIntl();

    return (
        <div>
            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <Paper elevation={1} className={classes.paper}>

                        {/* <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.location.description"})} </Typography>
                                <Typography gutterBottom> {incident.location} </Typography>
                            </Grid>
                        </Grid>

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.location.address"})} </Typography>
                                <Typography gutterBottom> {incident.address}</Typography>
                            </Grid>
                        </Grid> */}

                        {/* <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> Coordinates </Typography>
                                <Typography gutterBottom> {incident.coordinates} </Typography>
                            </Grid>
                        </Grid> */}

                    </Paper>
                </Grid>
            </Grid>

            
        </div>
    );
}

/**
 * Contact Information TabView - (2)
 */
function ContactTab(props) {

    const { classes, reporter, incident,districts,gramaNiladharis } = props;
    const { formatMessage: f } = useIntl();
    return (
        <div>
            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <Paper elevation={1} className={classes.paper}>

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.reporter.name"})} </Typography>
                                <Typography gutterBottom> {(reporter.title=="MR" ? "Mr. " : reporter.title=="MS" ? "Ms. " : reporter.title=="MRS" ? "Mrs. " : "Rev. ") + reporter.name} </Typography>
                            </Grid>
                        </Grid>

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.report.incidents.contact.nic"})} </Typography>
                                <Typography gutterBottom> {reporter.nic} </Typography>
                            </Grid>
                        </Grid>

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}>{f({id: "request.management.incident.create.reporter.telephone"})} </Typography>
                                <Typography gutterBottom> {reporter.telephone} </Typography>
                            </Grid>
                        </Grid>

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.reporter.mobile"})} </Typography>
                                <Typography gutterBottom> {reporter.mobile} </Typography>
                            </Grid>
                        </Grid>

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.reporter.email"})} </Typography>
                                <Typography gutterBottom> {reporter.email} </Typography>
                            </Grid>
                        </Grid>

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.reporter.address"})} </Typography>
                                <Typography gutterBottom> {reporter.address} </Typography>
                            </Grid>
                        </Grid>
                        {/* <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.location.description"})} </Typography>
                                <Typography gutterBottom> {incident.location} </Typography>
                            </Grid>
                        </Grid> */}

                    </Paper>
                </Grid>
            </Grid>
            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <Paper elevation={1} className={classes.paper}>

                        {/* <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> Province </Typography>
                                <Typography variant="" gutterBottom>
                                    {
                                        incident.province && provinces.byCode[incident.province] ?
                                            provinces.byCode[incident.province].name : ""
                                    }
                                </Typography>
                            </Grid>
                        </Grid> */}

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.location.district"})} </Typography>
                                <Typography variant="" gutterBottom>
                                    {
                                        reporter.district && districts.byCode[reporter.district] ?
                                            districts.byCode[reporter.district].name : ""
                                    }
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.location.gn_division"})} </Typography>
                                <Typography variant="" gutterBottom>
                                    {
                                        reporter.gramaNiladhari && gramaNiladharis.byCode[reporter.gramaNiladhari] ?
                                        gramaNiladharis.byCode[reporter.gramaNiladhari].name : ""
                                    }
                                </Typography>
                            </Grid>
                        </Grid>

                        {/* <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> Polling Division </Typography>
                                <Typography gutterBottom>
                                {resolveLocationName(incident.pollingDivision, pollingDivisions)}
                                </Typography>
                            </Grid>
                        </Grid> */}
                        {/*
                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> Ward </Typography>
                                <Typography gutterBottom> {incident.ward} </Typography>
                            </Grid>
                        </Grid> */}

                        {/* <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> Police Station </Typography>
                                <Typography gutterBottom>
                                {   resolveLocationName(incident.policeStation, policeStations)}
                                </Typography>
                            </Grid>
                        </Grid> */}

                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}

/**
 * Contact Information TabView - (2)
 */
function RecipientTab(props) {

    const { classes, recipient,districts,incident,gramaNiladharis } = props;
    const { formatMessage: f } = useIntl();
    return (
        <div>
            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <Paper elevation={1} className={classes.paper}>

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.recipient.name"})} </Typography>
                                <Typography gutterBottom>{(recipient.title=="MR" ? "Mr. " : recipient.title=="MS" ? "Ms. " : recipient.title=="MRS" ? "Mrs. " : "Rev. ") + recipient.name} </Typography>
                            </Grid>
                        </Grid>

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.report.incidents.contact.nic"})} </Typography>
                                <Typography gutterBottom> {recipient.nic} </Typography>
                            </Grid>
                        </Grid>

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}>{f({id: "request.management.incident.create.reporter.telephone"})} </Typography>
                                <Typography gutterBottom> {recipient.telephone} </Typography>
                            </Grid>
                        </Grid>

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.reporter.mobile"})} </Typography>
                                <Typography gutterBottom> {recipient.mobile} </Typography>
                            </Grid>
                        </Grid>

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.reporter.email"})} </Typography>
                                <Typography gutterBottom> {recipient.email} </Typography>
                            </Grid>
                        </Grid>

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.reporter.address"})} </Typography>
                                <Typography gutterBottom> {recipient.address} </Typography>
                            </Grid>
                        </Grid>
                        {/* <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.location.description"})} </Typography>
                                <Typography gutterBottom> {recipient.location} </Typography>
                            </Grid>
                        </Grid> */}

                        

                    </Paper>
                </Grid>
            </Grid>
            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <Paper elevation={1} className={classes.paper}>

                        {/* <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> Province </Typography>
                                <Typography variant="" gutterBottom>
                                    {
                                        incident.province && provinces.byCode[incident.province] ?
                                            provinces.byCode[incident.province].name : ""
                                    }
                                </Typography>
                            </Grid>
                        </Grid> */}

                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.location.district"})} </Typography>
                                <Typography variant="" gutterBottom>
                                    {
                                        recipient.district && districts.byCode[recipient.district] ?
                                            districts.byCode[recipient.district].name : ""
                                    }
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> {f({id: "request.management.incident.create.location.gn_division"})} </Typography>
                                <Typography variant="" gutterBottom>
                                    {
                                        recipient.gnDivision && gramaNiladharis.byCode[recipient.gnDivision] ?
                                        gramaNiladharis.byCode[recipient.gnDivision].name : ""
                                    }
                                </Typography>
                            </Grid>
                        </Grid>
                        {/* <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> Polling Division </Typography>
                                <Typography gutterBottom>
                                {resolveLocationName(incident.pollingDivision, pollingDivisions)}
                                </Typography>
                            </Grid>
                        </Grid> */}
                        {/*
                        <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> Ward </Typography>
                                <Typography gutterBottom> {incident.ward} </Typography>
                            </Grid>
                        </Grid> */}

                        {/* <Grid container spacing={24}>
                            <Grid item xs>
                                <Typography variant="caption" className={classes.label}> Police Station </Typography>
                                <Typography gutterBottom>
                                {   resolveLocationName(incident.policeStation, policeStations)}
                                </Typography>
                            </Grid>
                        </Grid> */}

                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}


/**
 * Review Summary TabView - (4)
 */
function PoliceTab(props) {
    const { classes, incident } = props;

    return (
        <div>
            <Grid container spacing={24} >
                <Grid item xs={12}>
                    <Paper elevation={1} className={classes.paper}>

                        <Grid container spacing={24}>
                            <Grid item xs={12}>
                                <Typography className={classes.label}><b>Injured Parties</b></Typography>
                            </Grid>
                            {incident.injuredParties &&
                                <Grid item xs={12}>
                                    <Table className={classes.table} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Address</TableCell>
                                                <TableCell>Political Affliation</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {incident.injuredParties.map((p) => (
                                                <TableRow key={p.id}>
                                                    <TableCell>{p.name}</TableCell>
                                                    <TableCell>{p.address}</TableCell>
                                                    <TableCell>{p.political_affliation}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Grid>
                            }
                        </Grid>

                        <Grid container spacing={24} style={{ marginTop: "20px" }}>
                            <Grid item xs={12}>
                                <Typography className={classes.label}><b>Respondents</b></Typography>
                            </Grid>
                            {incident.respondents &&
                                <Grid item xs={12}>
                                    <Table className={classes.table} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Address</TableCell>
                                                <TableCell>Political Affliation</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {incident.respondents.map((p) => (
                                                <TableRow key={p.id}>
                                                    <TableCell>{p.name}</TableCell>
                                                    <TableCell>{p.address}</TableCell>
                                                    <TableCell>{p.political_affliation}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Grid>
                            }
                        </Grid>


                        <Grid container spacing={24} style={{ marginTop: "20px" }}>
                            <Grid item xs={12}>
                                <Typography className={classes.label}><b>Detaine Vehicles</b></Typography>
                            </Grid>
                            {incident.detainedVehicles &&
                                <Grid item xs={12}>
                                    <Table className={classes.table} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Vehicle Number</TableCell>
                                                <TableCell>Government / Private</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {incident.detainedVehicles.map((p) => (
                                                <TableRow key={p.id}>
                                                    <TableCell>{p.vehicle_no}</TableCell>
                                                    <TableCell>{p.ownership === "government" ? "Government" : "Private"}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Grid>
                            }
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}

function SummaryTabView(props) {

    const {
        classes, incident, reporter, recipient, elections, category,
        institutions,
        provinces, districts,
        divisionalSecretariats,
        gramaNiladharis,
        pollingDivisions,
        pollingStations,
        policeStations,
        policeDivisions,
        categories,
        channels
    } = props

    const [currentTab, setCurrentTab] = useState(0);
    return (
        <div className={classes.root}>
            <Tabs variant="fullWidth" value={currentTab} onChange={(e, val) => setCurrentTab(val)} indicatorColor="primary" >
                <LinkTab label="Basic Information" href="page1" />
                <LinkTab label="Contact Information" href="page2" />
                {recipient ? <LinkTab label="Recipient Information" href="page3" /> : ''}
                {/* <LinkTab label="Location Information" href="page4" style={{ display: incident.incidentType === 'INQUIRY' ? 'none' : ''}}/> */}
                {/* <LinkTab label="Police Information" href="page4" style={{ display: incident.incidentType === 'INQUIRY' ? 'none' : ''}}/> */}
            </Tabs>

            {currentTab === 0 && <TabContainer>
                <BasicDetailTab classes={classes} incident={incident} elections={elections} category={category}
                    categories={categories}
                    channels={channels}
                    institutions={institutions}

                /> </TabContainer>}
            {currentTab === 1 && <TabContainer> <ContactTab classes={classes} reporter={reporter} incident={incident} districts={districts} gramaNiladharis={gramaNiladharis} /> </TabContainer>}
            {currentTab === 2 && <TabContainer> <RecipientTab classes={classes} recipient={recipient} incident={incident} districts={districts} gramaNiladharis={gramaNiladharis} /> </TabContainer>}
            {currentTab === 3 && <TabContainer>
                <LocationTab classes={classes} incident={incident}
                    provinces={provinces}
                    districts={districts}
                    divisionalSecretariats={divisionalSecretariats}
                    gramaNiladharis={gramaNiladharis}
                    pollingDivisions={pollingDivisions}
                    pollingStations={pollingStations}
                    policeStations={policeStations}
                    policeDivisions={policeDivisions}
                /> </TabContainer>}
            {currentTab === 4 && <TabContainer> <PoliceTab classes={classes} incident={incident} /> </TabContainer>}
        </div>
    )
}

export default withStyles(styles)(SummaryTabView);