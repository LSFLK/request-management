import React, { useState } from 'react';
// import {Link} from 'react-router-dom';
// import {withRouter} from "react-router";
import { useIntl } from "react-intl";
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import {withStyles} from '@material-ui/core/styles';
import { Paper, Grid, Typography, List, ListItemText, ListItem } from '@material-ui/core';
import { API_BASE_URL } from '../../config';
import TextField from "@material-ui/core/TextField";
import { Formik } from "formik";
import moment from "moment";
import * as Yup from "yup";
import { showNotification } from "../../notifications/state/notifications.actions";
import { Button } from '@material-ui/core';
import { useSelector, useDispatch } from "react-redux";

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing.unit * 2,
        color: theme.palette.text.secondary,
        marginBottom: 20,
    }
})

const ExpansionPanel = withStyles({
    root: {
      border: '1px solid rgba(0, 0, 0, .125)',
      boxShadow: 'none',
      '&:not(:last-child)': {
        borderBottom: 0,
      },
      '&:before': {
        display: 'none',
      },
      '&$expanded': {
        margin: 'auto',
      },
    },
    expanded: {},
  })(MuiExpansionPanel);

  const ExpansionPanelSummary = withStyles({
    root: {
      backgroundColor: 'rgba(0, 0, 0, .03)',
      borderBottom: '1px solid rgba(0, 0, 0, .125)',
      marginBottom: -1,
      minHeight: 56,
      '&$expanded': {
        minHeight: 56,
      },
    },
    content: {
      '&$expanded': {
        margin: '12px 0',
      },
    },
    expanded: {},
  })(MuiExpansionPanelSummary);

  const ExpansionPanelDetails = withStyles((theme) => ({
    root: {
      padding: theme.spacing.unit * 2,
    },
  }))(MuiExpansionPanelDetails);

function ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
}

export default function TempReportList(){
    const dispatch = useDispatch();
    const { formatMessage: f } = useIntl();
    const selectedLanguage = useSelector((state) => state.shared.selectedLanguage);
    const [state, setState] = useState({
        startTime: null,
        endTime: null,
    });

    const handleSubmit = (values, actions) => {
      var startTime = new Date(values.startTime);
          startTime = moment(startTime).format("YYYY-MM-DD HH:mm");
      var endTime = new Date(values.endTime);
          endTime = moment(endTime).format("YYYY-MM-DD HH:mm");

      if(expanded==="panel2"){
        window.open(`${API_BASE_URL}/pdfgen/?template_type=daily_category_with_timefilter&startTime="${startTime}"&endTime="${endTime}"&language="${selectedLanguage}"`,"_blank");
      }
      if(expanded==="panel3"){
        window.open(`${API_BASE_URL}/pdfgen/?template_type=organizationwise_total_request_with_timefilter&startTime="${startTime}"&endTime="${endTime}"&language="${selectedLanguage}"`,"_blank");
      }
    };

    const confirmDateAndSubmit = (values, actions) => {
            setState(
                handleSubmit(values, actions)
            );
    };

    const getInitialValues = () => {
        var initData = { ...state};

        //TODO: Need to split the date values to date and time
        if (initData.startTime) {
            initData.startTime = moment(initData.from_date).format("YYYY-MM-DDTHH:mm");
        }
        if (initData.endTime) {
            initData.endTime = moment(initData.to_date).format("YYYY-MM-DDTHH:mm");
        }
        return initData;
    };

    const [expanded, setExpanded] = React.useState('panel1');

    const handleChange2 = (panel) => (event, newExpanded) => {
      setExpanded(newExpanded ? panel : false);
    };

    const reportSchema = Yup.object().shape({
        startTime: Yup.mixed().required("Required"),
        endTime: Yup.mixed().required("Required"),
    });

    return (
    <Formik
                onSubmit={(values, actions) => {
                    confirmDateAndSubmit(values, actions)
                }}
                validationSchema={reportSchema}
                initialValues={getInitialValues()}
                // validate={customValidations}
                // above customValidation commented due to removing of occurrence
                render={({
                    handleSubmit,
                    handleChange,
                    handleBlur,
                    values,
                    errors,
                    touched,
                    setFieldValue,
                    isValid,
                }) => {
    return (
        <Paper style={{padding: 20}}>
            <Grid container spacing={24}>
                <Grid item xs>
                    <Typography variant="h5"> {f({id: "request.management.report.view_reports", defaultMessage: "View Reports"})} </Typography>
                    <ul>
                      <li><Typography variant="h6"> {f({id: "request.management.report.cat_reports", defaultMessage: "View Reports"})} </Typography></li>
                    </ul>
                    <List>
                        <ListItemLink href={`${API_BASE_URL}/pdfgen/?template_type=daily_category&language="${selectedLanguage}"`} target="_blank">
                            <ListItemText primary={f({id: "request.management.report.daily_summary_by_category", defaultMessage: "Daily Summary Report - Total number of requests received by category"})} />
                        </ListItemLink>
                        <ListItemLink href={`${API_BASE_URL}/pdfgen/?template_type=daily_category_closed&language="${selectedLanguage}"`} target="_blank">
                            <ListItemText primary={f({id: "request.management.report.daily_closed_request_category", defaultMessage: "Daily Summary Report - No. of requests closed by category"})} />
                        </ListItemLink>
                        <ListItemLink href={`${API_BASE_URL}/pdfgen/?template_type=weekly_closed_request_category&language="${selectedLanguage}"`} target="_blank">
                            <ListItemText primary={f({id: "request.management.report.weekly_closed_request_category", defaultMessage: "Weekly Summary Report - No. of requests closed by Category"})} />
                        </ListItemLink>
                    </List>
                    <form
                            // className={classes.container}
                            noValidate
                            autoComplete="off"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!isValid) {
                                    dispatch(showNotification({ message: "Missing required values" }, null));
                                    window.scroll(0, 0);
                                }
                                handleSubmit(e);
                            }}>
                    <ExpansionPanel square expanded={expanded === 'panel2'} onChange={handleChange2('panel2')}>
                        <ExpansionPanelSummary aria-controls="panel1d-content" id="panel1d-header">
                        <Typography>{f({id: "request.management.report.summary_by_category_filter", defaultMessage: "Summary Report by Category ( Filter by time )"})}</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                        <Grid container spacing={24}>
                        <Grid item xs={6}>
                        <TextField
                        id="start-time"
                        label={f({id: "request.management.incident.review.start_date", defaultMessage: "Start Date/Time"})}
                        name="startTime"
                        type="datetime-local"
                        value={values.startTime}
                        InputLabelProps={{
                          shrink: true
                        }}
                        onChange={handleChange}
                        error={touched.startTime && errors.startTime}
                        helperText={touched.startTime ? errors.startTime : null}
                      />
                    </Grid>
                    <Grid item xs={6}>
                    <TextField
                        id="end-time"
                        label={f({id: "request.management.incident.review.end_date", defaultMessage: "Endate/Time"})}
                        name="endTime"
                        type="datetime-local"
                        value={values.endTime}
                        InputLabelProps={{
                          shrink: true
                        }}
                        onChange={handleChange}
                        error={touched.endTime && errors.endTime}
                        helperText={touched.endTime ? errors.endTime : null}
                      />
                    </Grid>
                    <Grid item xs={4}>
                    <Button variant={'outlined'}
                        color="inherit" type="submit" >Create</Button>
                    </Grid>
                        </Grid>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                    </form>
                    <ul>
                      <li><Typography variant="h6"> {f({id: "request.management.report.org_reports", defaultMessage: "View Reports"})} </Typography></li>
                    </ul>
                    <List>
                    <ListItemLink href={`${API_BASE_URL}/pdfgen/?template_type=weekly_closed_request_organization&language="${selectedLanguage}"`} target="_blank">
                            <ListItemText primary={f({id: "request.management.report.weekly_closed_request_organization", defaultMessage: "Weekly Summary Report - No. of requests closed by organization"})} />
                        </ListItemLink>
                        <ListItemLink href={`${API_BASE_URL}/pdfgen/?template_type=daily_closed_request_organization&language="${selectedLanguage}"`} target="_blank">
                            <ListItemText primary={f({id: "request.management.report.daily_closed_request_organization", defaultMessage: "Daily Summary Report - No. of requests closed by organization"})} />
                        </ListItemLink>
                    </List>
                    {/* <form
                            // className={classes.container}
                            noValidate
                            autoComplete="off"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!isValid) {
                                    dispatch(showNotification({ message: "Missing required values" }, null));
                                    window.scroll(0, 0);
                                }
                                handleSubmit(e);
                            }}>
                    <ExpansionPanel square expanded={expanded === 'panel3'} onChange={handleChange2('panel3')}>
                        <ExpansionPanelSummary aria-controls="panel1d-content" id="panel1d-header">
                        <Typography>Organizationwise delegated requests ( Filter by time )</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                        <Grid container spacing={24}>
                        <Grid item xs={6}>
                        <TextField
                        id="start-time"
                        label="Start Date/Time"
                        name="startTime"
                        type="datetime-local"
                        value={values.startTime}
                        InputLabelProps={{
                          shrink: true
                        }}
                        onChange={handleChange}
                        error={touched.startTime && errors.startTime}
                        helperText={touched.startTime ? errors.startTime : null}
                      />
                    </Grid>
                    <Grid item xs={6}>
                    <TextField
                        id="end-time"
                        label="End Date/Time"
                        name="endTime"
                        type="datetime-local"
                        value={values.endTime}
                        InputLabelProps={{
                          shrink: true
                        }}
                        onChange={handleChange}
                        error={touched.endTime && errors.endTime}
                        helperText={touched.endTime ? errors.endTime : null}
                      />
                    </Grid>
                    <Grid item xs={4}>
                    <Button variant={'outlined'}
                        color="inherit" type="submit" >Create</Button>
                    </Grid>
                        </Grid>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                    </form> */}
                </Grid>
            </Grid>
        </Paper>
    )
}}
/>
    );
}