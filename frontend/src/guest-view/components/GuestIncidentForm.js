import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { Link, Redirect } from 'react-router-dom';
import { withRouter } from "react-router";
import { useIntl } from "react-intl";
import ReCAPTCHA from "react-google-recaptcha";

import { withStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from "@material-ui/core/Grid";
import { changeLanguage } from "../../shared/state/sharedActions";
import Logo from "../../app/Logo";
import CircularProgress from '@material-ui/core/CircularProgress';

import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';

import DescriptionSection from './GuestFormDescriptionSection';
import CategorySection from './GuestFormCatogorySection';
import FileUploadSection from './GuestFormFileUploadSection';
import DateTimeSection from './GuestFormDateTimeSection';
import LocationSection from './GuestFromLocationSection';
import ContactSection from './GuestFormContactSection';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import _ from 'lodash';


import {
    fetchElections,
    fetchCategories,
    fetchChannels,
    fetchDistricts,
    requestIncidentCatogories,
} from '../../shared/state/sharedActions';

import {
    createGuestIncident,
    updateGuestIncident,
    updateGuestIncidentReporter,
    uploadFileGuest,
    createGuestIncidentWithReporter,
    createGuestIncidentWithReporterSuccess
} from '../../incident/state/incidentActions'

import {
    moveStepper,
} from '../state/guestViewActions'
import FileUploader from '../../files/components/FilePicker';

import {useLoadingStatus} from '../../loading-spinners/loadingHook'

const styles = theme => ({
    root: {
        width: '90%',
        marginTop: theme.spacing.unit * 4,
        marginLeft: theme.spacing.unit * 2,
    },
    button: {
        marginTop: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
    actionsContainer: {
        marginTop: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
    resetContainer: {
        padding: theme.spacing.unit * 3,
    },
    buttonProgress: {
        color: green[500],
        position: 'absolute',
        marginTop: 15,
        marginLeft: -53,
    },
    wrapper: {
        margin: theme.spacing.unit,
        position: 'relative',
    },
    list: {
        marginLeft:-20
      },
});


const VerticalLinearStepper = (props) => {

    useEffect(() => {
        dispatch(fetchElections());
        dispatch(fetchCategories());
        dispatch(fetchChannels());
        dispatch(fetchDistricts());
    }, []);

    const { formatMessage: f } = useIntl();

    const dispatch = useDispatch();
    const { elections, categories, channels, districts } = useSelector((state) => (state.shared));

    function removeDuplicates(originalArray, prop) {
        var newArray = [];
        var lookupObject  = {};

        for(var i in originalArray) {
           lookupObject[originalArray[i][prop]] = originalArray[i];
        }

        for(i in lookupObject) {
            newArray.push(lookupObject[i]);
        }
         return newArray;
    }

   var mainCategories = removeDuplicates(categories, "top_category");




    let webInfoChannelId = "Web";
    // for(var channel of channels){
    //     if(channel.name === "Web"){
    //         webInfoChannelId = channel.id;
    //         break;
    //     }
    // }

    const { activeIncident, activeIncidentReporter } = useSelector((state) => (state.incident));
    const { activeStep, isLoadingIncident } = useSelector((state) => (state.guestView));

    const incidentId = activeIncident && activeIncident.data ? activeIncident.data.id : null
    let incidentData = incidentId ? JSON.parse(JSON.stringify(activeIncident.data)) : {};
    let incidentReporterData = incidentId ? JSON.parse(JSON.stringify(activeIncidentReporter.data)) : null;

    const [skippedSteps, setSkippedSets] = useState(new Set());
    const [incidentDescription, setIncidentDescription] = useState(incidentId ? incidentData.description : null);
    const [incidentElection, setIncidentElection] = useState(incidentId ? incidentData.election : "");

    const recaptchaRef = React.createRef();
    const [incidentRecaptcha, setIncidentRecaptcha] = useState(null);


    const [incidentCatogory, setIncidentCatogory] = useState(incidentId? incidentData.category:"");
    const [incidentMainCatogory, setIncidentMainCatogory] = useState(incidentId? incidentData.mainCategory:"");

    if(incidentMainCatogory){
        var subCategories = _.filter(categories, item => item.top_category === incidentMainCatogory);
       }

    const [incidentFiles, setIncidentFiles] = useState(null);
    const [incidentDateTime, setIncidentDateTime] = useState({
        date: incidentId && incidentData.occured_date ? moment(incidentData.occured_date).format('YYYY-MM-DD') : null,
        time: incidentId && incidentData.occured_date ? moment(incidentData.occured_date).format('HH:mm') : null,
    });

    // location section
    const [incidentLocation, setIncidentLocation] = useState(incidentId ? incidentData.location : '');
    const [incidentAddress, setIncidentAddress] = useState(incidentId ? incidentData.address : '');
    const [incidentCity, setIncidentCity] = useState(incidentId ? incidentData.city : '');
    const [incidentDistrict, setIncidentDistrict] = useState(incidentId ? incidentData.district : '');

    const [incidentContact, setIncidentContact] = useState({
        name: incidentReporterData ? incidentReporterData.name : '',
        phone: incidentReporterData ? incidentReporterData.telephone : '',
        mobile: incidentReporterData ? incidentReporterData.mobile : '',
        email: incidentReporterData ? incidentReporterData.email : ''
    });
    const [formErrors, setFormErrors] = useState({})
    const isLoadingMetaData = useLoadingStatus([
        requestIncidentCatogories(),
    ])

    const getFormattedDateTime = () => {
        let dateTime = null;
        if (incidentDateTime.date && incidentDateTime.time) {
            dateTime = moment(
                incidentDateTime.date + " " +
                incidentDateTime.time, 'YYYY-MM-DD h:mm a'
            ).format()
        }
        return dateTime
    }

    const validInputs = () => {
        setFormErrors({ ...formErrors, incidentDescriptionErrorMsg: null, incidentElectionErrorMsg: null, incidentDatetimeErrorMsg: null, incidentContactErrorMsg: null,incidentNameErrorMsg: null })
        let errorMsg = { ...formErrors };
        let valid = true;

        if (!incidentDescription) {
            errorMsg = { ...errorMsg, incidentDescriptionErrorMsg: f({ id: "request.management.report.incidents.description.error.message", defaultMessage: "Description is required" }) };
            valid = false;
        }
        if (!incidentElection) {
            errorMsg = { ...errorMsg, incidentElectionErrorMsg: f({ id: "request.management.report.incidents.election.error.message", defaultMessage: "Election is required" }) };
            valid = false;
        }
        // if (getFormattedDateTime() == null) {
        //     errorMsg = { ...errorMsg, incidentDatetimeErrorMsg: f({ id: "request.management.report.incidents.datetime.error.message", defaultMessage: "Date and time are required" }) };
        //     valid = false;
        // }


        setFormErrors({ ...errorMsg });
        return valid;
    }

    const validContactInputs = () => {
        setFormErrors({ ...formErrors, incidentDescriptionErrorMsg: null, incidentElectionErrorMsg: null, incidentDatetimeErrorMsg: null, incidentContactErrorMsg: null,incidentNameErrorMsg: null })
        let errorMsg = { ...formErrors };
        let valid = true;
        if(!incidentRecaptcha){
            errorMsg = { ...errorMsg, incidentRecaptchaErrorMsg: f({ id: "request.management.report.incidents.recaptcha.error.message", defaultMessage: "This verification is required" }) };
            valid = false;
        }

        if(!incidentContact.mobile){
            errorMsg = { ...errorMsg, incidentContactErrorMsg: f({ id: "request.management.report.incidents.phone.error.message", defaultMessage: "Contact number is required" }) };
            valid = false;
        }
        if(!incidentContact.name){
            errorMsg = { ...errorMsg, incidentNameErrorMsg: f({ id: "request.management.report.incidents.name.error.message", defaultMessage: "Name is required" }) };
            valid = false;
        }

        setFormErrors({ ...errorMsg });
        return valid;
    }

    const validLocationInputs = () => {
        setFormErrors({ ...formErrors, incidentAddressErrorMsg: null, incidentDistrictErrorMsg: null })
        let errorMsg = { ...formErrors };
        let valid = true;

        if(!incidentAddress){
            errorMsg = { ...errorMsg, incidentAddressErrorMsg: f({ id: "request.management.report.incidents.address.error.message", defaultMessage: "Address is required" }) };
            valid = false;
        }
        if(!incidentDistrict){
            errorMsg = { ...errorMsg, incidentDistrictErrorMsg: f({ id: "request.management.report.incidents.district.error.message", defaultMessage: "District is required" }) };
            valid = false;
        }

        setFormErrors({ ...errorMsg });
        return valid;
    }

    const validCategoryInputs = () => {
        setFormErrors({ ...formErrors, incidentMainCategoryErrorMsg: null, incidentSubCategoryErrorMsg: null })
        let errorMsg = { ...formErrors };
        let valid = true;

        if(!incidentCatogory){
            errorMsg = { ...errorMsg, incidentSubCategoryErrorMsg: f({ id: "request.management.report.incidents.subcategory.error.message", defaultMessage: "Sub category is required" }) };
            valid = false;
        }
        if(!incidentMainCatogory){
            errorMsg = { ...errorMsg, incidentMainCategoryErrorMsg: f({ id: "request.management.report.incidents.topcategory.error.message", defaultMessage: "Category is required" }) };
            valid = false;
        }

        setFormErrors({ ...errorMsg });
        return valid;
    }



    const createIncidentWithReporter = (reporterData) => {
        const initData = {
            description: "Incomplete submission",
            title: "Guest user submit",
            infoChannel: "Web",
            occured_date: "2020-01-01T01:00:00+05:30",
            receivedDate: "2020-01-01",
            letterDate: "2020-01-01",
            recaptcha: incidentRecaptcha
        }
        dispatch(createGuestIncidentWithReporter(initData, reporterData))
    }

    const stepDefinitions = {

        3: {
            title: f({ id: "request.management.report.incidents.section.describe", defaultMessage: "Enter details here" }),
            content: <>
                    <ul className={props.classes.list}>
                        <li>{f({ id: "request.management.report.incidents.section.listitem1", defaultMessage: "Explain your matter clearly" })}</li>
                        <li>{f({ id: "request.management.report.incidents.section.listitem2", defaultMessage: "Include facts and specific details" })}</li>
                        <li>{f({ id: "request.management.report.incidents.section.listitem3", defaultMessage: "State any urgent circumstances" })}</li>
                    </ul>
                <DescriptionSection
                    handledDescriptionChange={setIncidentDescription}
                    handleElectionChange={setIncidentElection}
                    description={incidentDescription}
                    selectedElection={incidentElection}
                    elections={elections}
                    disableDescription={incidentId ? true : false}
                    formErrors={formErrors}
                />
                <div style={{ height: 20 }}></div>
                {/* < DateTimeSection
                    dateTime={incidentDateTime}
                    setDateTime={setIncidentDateTime}
                    formErrors={formErrors}
                /> */}
                <p style={{ color:'red', marginTop:0}}>{formErrors.incidentRecaptchaErrorMsg}</p>
            </>,
            handler: () => {
                if (!incidentId) {
                    //creating new incident
                    if (validInputs()) {

                        let incidentData = {
                            description: incidentDescription,
                            title: 'Guest user submit',
                            infoChannel: webInfoChannelId, //info channel is web by default.
                            recaptcha: incidentRecaptcha,
                            location: incidentLocation,
                            address: incidentAddress,
                            city: incidentCity,
                            category: incidentCatogory,
                            mainCategory:incidentMainCatogory,
                            district:incidentDistrict
                        }
                        const dateTime = getFormattedDateTime()
                        if (dateTime) {
                            incidentData['occured_date'] = dateTime;
                        }
                        incidentData['receivedDate'] = '2020-01-01';
                        incidentData['letterDate'] = '2020-01-01';

                        let reporterData = {}
                        reporterData.name = incidentContact.name;
                        reporterData.telephone = incidentContact.phone;
                        reporterData.mobile = incidentContact.mobile;
                        reporterData.email = incidentContact.email;

                        dispatch(createGuestIncidentWithReporter( incidentData, reporterData))
                        // dispatch(moveStepper({ step: activeStep + 1 }));
                    }
                } else {
                    //updating an existing incident.
                    if (validInputs()) {
                        let incidentUpdate = incidentData
                        incidentUpdate["election"] = incidentElection;
                        incidentUpdate["description"] = incidentDescription;
                        incidentUpdate["location"] = incidentLocation;
                        incidentUpdate["address"] = incidentAddress;
                        incidentUpdate["city"] = incidentCity;
                        incidentData["category"] = incidentCatogory;
                        incidentData["mainCategory"] = incidentMainCatogory;
                        incidentData["district"] = incidentDistrict;

                        const dateTime = getFormattedDateTime()
                        if (dateTime) {
                            incidentUpdate['occured_date'] = dateTime
                        }
                        dispatch(updateGuestIncident(incidentId, incidentUpdate))
                        // dispatch(moveStepper({ step: activeStep + 1 }));
                    }
                }
            }
        },

        1: {
            title: f({ id: "request.management.report.incidents.section.location", defaultMessage: "Describe the location" }),
            content: < LocationSection
                location={incidentLocation}
                handledLocationChange={setIncidentLocation}
                address={incidentAddress}
                handleAddressChange={setIncidentAddress}
                city={incidentCity}
                district={incidentDistrict}
                handleDistrictChange={setIncidentDistrict}
                handleCityChange={setIncidentCity}
                districts={districts}
                formErrors={formErrors}
            />,
            handler: () => {
                if (validLocationInputs()) {
                // if (incidentLocation) {
                //     incidentData.location = incidentLocation;
                //     incidentData.address = incidentAddress;
                //     incidentData.city = incidentCity;
                //     dispatch(updateGuestIncident(incidentId, incidentData))
                // } else {
                //     dispatch(moveStepper({ step: activeStep + 1 }));
                // }
                dispatch(moveStepper({ step: activeStep + 1 }));
                }
            }
        },

        4: {
            title: f({ id: "request.management.report.incidents.section.attachment", defaultMessage: "Attach files related to incident" }),
            content: <FileUploader
                files={incidentFiles}
                setFiles={setIncidentFiles}
            />,
            handler: () => {
                if (incidentFiles) {
                    const fileData = new FormData();
                    for (var file of incidentFiles) {
                        fileData.append("files[]", file);
                    }
                    dispatch(uploadFileGuest(incidentId, fileData))
                    dispatch(moveStepper({ step: activeStep + 1 }));
                }else{
                    dispatch(moveStepper({ step: activeStep + 1 }));
                }
            }
        },

        0: {
            title: f({ id: "request.management.report.incidents.section.contact", defaultMessage: "Your contact details" }),
            content:
            <>
            < ContactSection
                contactDetials={incidentContact}
                handleContactDetailsChange={setIncidentContact} formErrors={formErrors} />
            <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.REACT_APP_RECAPTCHA_SITEKEY}
                onChange={ (e) => {
                    formErrors.incidentRecaptchaErrorMsg = null;
                    setIncidentRecaptcha(recaptchaRef.current.getValue());
                }}
            />
            </>,
            handler: () => {
                if (!incidentId) {
                    if (validContactInputs()) {
                        // const reporterData = {}
                        // reporterData.name = incidentContact.name;
                        // reporterData.telephone = incidentContact.phone;
                        // reporterData.mobile = incidentContact.mobile;
                        // reporterData.email = incidentContact.email;
                        // createIncidentWithReporter(reporterData)
                        dispatch(moveStepper({ step: activeStep + 1 }));
                    }
                }else{
                    if (validContactInputs()) {
                    incidentReporterData.name = incidentContact.name;
                    incidentReporterData.telephone = incidentContact.phone;
                    incidentReporterData.mobile = incidentContact.mobile;
                    incidentReporterData.email = incidentContact.email;
                    dispatch(updateGuestIncidentReporter(incidentReporterData.id, incidentReporterData))
                    }
                }
            }
        },

        2:{
            title:f({ id: "request.management.report.incidents.section.category", defaultMessage: "Select the most suitable category" }),
            content: <CategorySection
                        mainCategories={mainCategories}
                        subCategories={subCategories}
                        selectedCategory={incidentCatogory}
                        selectedMainCategory={incidentMainCatogory}
                        setSelectedCategory={setIncidentCatogory}
                        setSelectedMainCategory={setIncidentMainCatogory}
                        formErrors={formErrors} />,
            handler: () => {
                if(validCategoryInputs()){
                    dispatch(moveStepper({step:activeStep+1}))
                }

            }
        },

    }

    let steps = [];

    Object.keys(stepDefinitions).forEach(function (stepNumber) {
        steps[stepNumber] = stepDefinitions[stepNumber].title
    });

    const optionalSteps = new Set([])

    const isStepOptional = step => optionalSteps.has(step);

    const handleBack = () => {
        dispatch(moveStepper({ step: activeStep - 1 }))
    };

    const handleReset = () => {
        dispatch(moveStepper({ step: 0 }))

    };

    const handleSkip = () => {
        if (!isStepOptional(activeStep)) {
            throw new Error("You can't skip a step that isn't optional.");
        }
        const skipped = new Set(skippedSteps.values());
        skipped.add(activeStep);
        setSkippedSets(skipped);
        dispatch(moveStepper({ step: activeStep + 1 }))

    };

    const handleNext = () => {
        //each step handler will dispatch relevant incident update/create actions.
        //guest reducer will catch the each success action and increment the active step
        stepDefinitions[activeStep].handler()
    }

    const isStepSkipped = (step) => {
        return skippedSteps.has(step);
    }

    const getStepContent = (step) => {
        return stepDefinitions[step].content
    }

    const { classes } = props;
    const GoBackLink = props => <Link to="/" {...props} />
    if (activeStep === Object.keys(stepDefinitions).length) {
        return <Redirect to='/report/success' />
    }

    const isLoading = isLoadingIncident || isLoadingMetaData
    return (

        <div className={classes.root}>

            <Grid container spacing={24}>
                <Grid item xs={12} sm={6}>
                    <Grid item xs={12} sm={6}>
                        <Logo />
                    </Grid>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <div style={{ textAlign: "right" }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => dispatch(changeLanguage("si"))}
                            className={classes.button}
                        >
                            {" "}
                            Sinhala{" "}
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => dispatch(changeLanguage("ta"))}
                            className={classes.button}
                        >
                            {" "}
                            Tamil{" "}
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => dispatch(changeLanguage("en"))}
                            className={classes.button}
                        >
                            {" "}
                            English{" "}
                        </Button>
                    </div>
                </Grid>
            </Grid>

            {/* <Button variant="outlined" onClick={() => { window.history.back(); }}> Back </Button> */}
            <Typography style={{ width: '100%' }} align="center" variant="h5" marginTop="20">
                {f({ id: "request.management.report.incidents", defaultMessage: "Report Complaint" })}
            </Typography>
            <Typography style={{ width: '100%' }} align="left" variant="" marginTop="20">
                {f({ id: "request.management.report.incidents.helper.text", defaultMessage: "*fields are mandatory" })}
            </Typography>
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => {

                    const props = {};
                    const labelProps = {};
                    if (isStepOptional(index)) {
                        if (index === 3) {
                            // expected here to gives more information on 'contact info'
                            labelProps.optional = <Typography variant="caption">{f({ id: "request.management.report.incidents.forms.label.optional", defaultMessage: "Optional" })}</Typography>;
                        } else {
                            labelProps.optional = <Typography variant="caption">{f({ id: "request.management.report.incidents.forms.label.optional", defaultMessage: "Optional" })}</Typography>;
                        }
                    }
                    if (isStepSkipped(index)) {
                        props.completed = false;
                    }

                    return (
                        <Step key={label} {...props}>
                            <StepLabel {...labelProps}>{label}</StepLabel>
                            <StepContent>
                                <Typography>{getStepContent(index)}</Typography>
                                <div className={classes.actionsContainer}>
                                    <div>
                                        <Button
                                            disabled={activeStep === 0 || isLoading}
                                            onClick={handleBack}
                                            className={classes.button}
                                        >
                                            {f({ id: "request.management.report.incidents.forms.button.back", defaultMessage: "Back" })}
                                        </Button>
                                        {isStepOptional(activeStep) && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleSkip}
                                                className={classes.button}
                                                disabled={isLoading}
                                            >
                                                {f({ id: "request.management.report.incidents.forms.button.skip", defaultMessage: "Skip" })}
                                            </Button>
                                        )}
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleNext}
                                            className={classes.button}
                                            disabled={isLoading || !incidentRecaptcha}
                                        >
                                            {activeStep === steps.length - 1 ?
                                                f({ id: "request.management.report.incidents.forms.button.finish", defaultMessage: "Submit" }) :
                                                f({ id: "request.management.report.incidents.forms.button.next", defaultMessage: "Next" })}
                                        </Button>
                                        {isLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                                    </div>
                                </div>
                            </StepContent>
                        </Step>)
                })}
            </Stepper>

            {activeStep === steps.length && (
                <Paper square elevation={0} className={classes.resetContainer}>
                    <Typography>Your complaint has been submitted successfully</Typography>
                </Paper>
            )}
        </div>
    );
}

VerticalLinearStepper.propTypes = {
    classes: PropTypes.object,
};

export default withRouter(withStyles(styles)(VerticalLinearStepper));
