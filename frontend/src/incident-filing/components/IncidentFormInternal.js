import * as Yup from "yup";
import * as incidentUtils from "../../incident/incidentUtils";

import { Card, CardContent } from "@material-ui/core";
import React, { Component, useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  createInternalIncident,
  loadIncident,
  updateInternalIncident,
} from "../../incident/state/incidentActions";
import {
  fetchCategories,
  fetchChannels,
  fetchDistricts,
  // fetchDivisionalSecretariats,
  // fetchElections,
  fetchGramaNiladharis,
  // fetchInstitutions,
  // fetchPoliceDivisions,
  // fetchPoliceStations,
  // fetchPoliticalParties,
  // fetchPollingDivisions,
  // fetchPollingStations,
  // fetchProvinces,
  // fetchWards,
  resetActiveIncident,
  changeLanguage
} from "../../shared/state/sharedActions";
import CustomAutocompleteCategory from "../../ongoing-incidents/components/AutocompleteCategory"
import CustomAutocompleteDistrict from "../../ongoing-incidents/components/AutocompleteDistrict"
import CustomAutocompleteRecipientDistrict from "../../ongoing-incidents/components/AutocompleteRecipientDistrict"
import CustomAutocompleteGn from "../../ongoing-incidents/components/AutocompleteGn"
import CustomAutocompleteRecipientGn from "../../ongoing-incidents/components/AutocompleteRecipientGn"
import Button from "@material-ui/core/Button";
// import Checkbox from "@material-ui/core/Checkbox";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
// import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
// import ExpansionPanel from "@material-ui/core/ExpansionPanel";
// import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
// import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import FileUploader from "../../files/components/FilePicker";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormLabel from "@material-ui/core/FormLabel";
import { Formik } from "formik";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import IntlSelect from "./IntlSelect";
// import MaterialTable from "material-table";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Search from "../../ongoing-incidents/components/search";
import Select from "@material-ui/core/Select";
import Snackbar from "@material-ui/core/Snackbar";
import TelephoneInput from "./TelephoneInput";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { getIncidents } from "../../api/incident";
import moment from "moment";
import orange from "@material-ui/core/colors/orange";
import red from "@material-ui/core/colors/red";
import { showNotification } from "../../notifications/state/notifications.actions";
import { useLoadingStatus } from "../../loading-spinners/loadingHook";
import { withRouter } from "react-router";
import { withStyles } from "@material-ui/core/styles";
import yellow from "@material-ui/core/colors/yellow";
// import TitleAutoComplete from "./TitleAutoComplete";
import { useIntl } from "react-intl";

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary,
    marginBottom: 20,
  },
  paper2: {
    padding: theme.spacing.unit * 2,
    background: "#ebf5fa",
    marginBottom: 10,
  },
  textField: {
    width: "100%",
  },
  textField2: {
    width: "100%",
    marginBottom: "-23px",
    marginTop: "26px",
  },
  textField3: {
    width: "100%",
    marginTop: "8px"
  },
  formControl: {
    width: "100%",
  },
  formControl2: {
    width: "100%",
    marginTop: 12
  },
  datetime: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  button: {
    margin: theme.spacing.unit,
  },
  radioItem: {
    margin: 0,
  },
  severityHigh: {
    color: red[600],
    "&$checked": {
      color: red[500],
    },
  },
  severityMedium: {
    color: orange[600],
    "&$checked": {
      color: orange[500],
    },
  },
  severityLow: {
    color: yellow[600],
    "&$checked": {
      color: yellow[500],
    },
  },
  checked: {},
  hide: {
    display: "none",
  },
  langCats: {
    display: "flex",
    "& div": {
      padding: "0 3px",
    },
  },
  cardRoot: {
    cursor: "grab",
    background: "#e0e0e0",
    marginBottom: "10px",
    marginTop: "10px",
    "&:hover": {
      background: "#3f51b5",
    },
  },
  cardText: {
    fontSize: 18,
    fontWeight: "400",
    color: "black",
  },
  cardContent: {
    padding: "10px !important",
  },
  title: {
    marginBottom: "-23px",
    marginTop: "20px",
  },
});

function IncidentFormInternal(props) {
  const dispatch = useDispatch();
  const [similarIncidents, setSimilarIncidents] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const { selectedLanguage } = useSelector((state) => (state.shared));

  const {
    incident,
    reporter,
    channels,
    categories,
    districts,
    institutions,
    provinces,
    divisionalSecretariats,
    gramaNiladharis,
    pollingDivisions,
    pollingStations,
    policeStations,
    policeDivisions,
    wards,
    // elections,
    // politicalParties
  } = useSelector((state) => state.shared);

  const [state, setState] = useState({
    incidentType: "COMPLAINT",
    infoChannel: "",
    title: "Internal Creation",
    description: "",
    occurrence: null,
    occured_date: null,
    occured_date_date: null,
    occured_date_time: null,
    time: "",
    otherCat: "",
    category: "",
    election: "",
    severity: "",
    reporterConsent: false,

    // inquiry
    receivedDate: null,
    letterDate: null,
    institution: "",

    // location
    // location: "",
    address: "",
    city: "",
    province: "",
    district: "",
    language: selectedLanguage==="si" ? "SINHALA" : selectedLanguage==="ta" ? "TAMIL" : "ENGLISH",
    divisionalSecretariat: "",
    gramaNiladhari: "",
    pollingDivision: "",
    pollingStation: "",
    policeStation: "",
    policeDivision: "",

    // reporter
    reporterName: "",
    reporterNic: "",
    reporterTitle: "",
    // reporterType: "",
    reporterAddress: "",
    reporterMobile: "",
    reporterTelephone: "",
    reporterEmail: "",
    reporterAffiliation: "",
    accusedName: "",
    accusedAffiliation: "",

    // recipient
    recipientName: "",
    recipientNic: "",
    recipientTitle: "",
    // recipientType: "",
    recipientAddress: "",
    recipientId: "",
    recipientMobile: "",
    recipientTelephone: "",
    recipientEmail: "",
    recipientCity: "",
    recipientDistrict: "",
    recipientGramaNiladhari: "",
    // recipientLocation: "",


    files: [],
    politicalParty: "",
    injuredParties: [],
    respondents: [],
    detainedVehicles: [],
    similarInquiry: [],

    // police info
    nature_of_incident: "",
    complainers_name: "",
    complainers_address: "",
    victims_name: "",
    victims_address: "",
    respondents_name: "",
    respondents_address: "",
    no_of_vehicles_arrested: null,
    steps_taken: "",
    court_case_no: "",

    showConfirmationModal: false,
    handleConfirmSubmit: false,
    showRecipient: ""
  });

  const [complaintCategories, setComplaintCategories] = useState();
  const [inquiryCategories, setInquiryCategories] = useState();

  useEffect(() => {
    const complaint = [];
    const inquiry = [];
    if (categories) {
      categories.map((category) => {
        if (category.top_category === "Inquiry") {
          inquiry.push(category);
        } else {
          complaint.push(category);
        }
      });
      categories.map((category) =>
        category.top_category === "Other" ? inquiry.push(category) : null
      );
      setComplaintCategories(complaint);
      setInquiryCategories(inquiry);
    }
  }, [categories]);

  useEffect(() => {
    dispatch(fetchChannels());
    // dispatch(fetchElections());
    dispatch(fetchCategories());
    // dispatch(fetchInstitutions());
    // dispatch(fetchProvinces());
    dispatch(fetchDistricts());
    // dispatch(fetchDivisionalSecretariats());
    dispatch(fetchGramaNiladharis());
    // dispatch(fetchPollingDivisions());
    // dispatch(fetchPollingStations());
    // dispatch(fetchPoliceStations());
    // dispatch(fetchPoliceDivisions());
    // dispatch(fetchWards());
    // dispatch(fetchPoliticalParties());

    // depreciated
    // dispatch(resetIncidentForm())

    const { paramIncidentId } = props.match.params;

    if (paramIncidentId) {
      dispatch(loadIncident(paramIncidentId));
    } else {
      dispatch(resetActiveIncident());
    }
  }, []);

  const { formatMessage: f } = useIntl();

  const getSimilarInquiries = async (title) => {
    if (title.length > 2) {
      setSimilarIncidents([]);
    } else {
      setSimilarIncidents([]);
    }
  };

  const handleSubmit = (values, actions) => {
    const { paramIncidentId } = props.match.params;
    // for(var v in values["detainedVehicles"]){
    //     if(values["detainedVehicles"][v]["is_private"] === "null"){
    //         values["detainedVehicles"][v]["is_private"] = false;
    //     }
    // }
    if (values.occured_date_date) {
      const time = values.occured_date_time || "12:00";
      const date = values.occured_date_date;
      values.occured_date = moment(`${date}T${time}`).format();
    } else {
      // to avoid sending an empty string to backend.
      values.occured_date = null;
    }
    delete values.occured_date_time;
    delete values.occured_date_date;
    if (paramIncidentId) {
      dispatch(updateInternalIncident(paramIncidentId, values));
      props.history.push(`/app/review/${paramIncidentId}`);
    } else {
      const fileData = new FormData();
      for (var file of state.files) {
        fileData.append("files[]", file);
      }
      dispatch(createInternalIncident(values, fileData));
      // props.history.push('/app/review');
    }
  };

  const confirmDateAndSubmit = (values, actions) => {
    if (values.incidentType === "INQUIRY" || values.occured_date_date) {
      handleSubmit(values, actions);
    } else {
      setState({
        showConfirmationModal: true,
        handleConfirmSubmit: () => {
          handleSubmit(values, actions);
        },
      });
    }
  };

  const getInitialValues = () => {
    const { paramIncidentId } = props.match.params;

    // TODO: move hooks out of this function.
    const incident = incidentUtils.getIncident(paramIncidentId);
    const reporters = useSelector(state => state.incident.reporters)
    const recipients = useSelector(state => state.incident.recipients)

    if (!paramIncidentId) {
      // new incident form
      return state;
    }
    var initData = { ...state, ...incident };

    const reporter = incident
      ? reporters.byIds[incident.reporter]
      : "";
    
    const recipient = incident
    ? recipients.byIds[incident.recipient]
    : "";
    if (reporter) {
      Object.assign(initData, {
        reporterName: reporter.name,
        reporterNic: reporter.nic,
        reporterTitle: reporter.title,
        reporterEmail: reporter.email,
        reporterMobile: reporter.mobile,
        reporterTelephone: reporter.telephone,
        reporterAddress: reporter.address,
        reporterAffiliation: reporter.politicalAffiliation,
        accusedName: reporter.accusedName,
        accusedAffiliation: reporter.accusedPoliticalAffiliation,
      });
    }
    if (recipient) {
        Object.assign(initData, {
          recipientName: recipient.name,
          recipientNic: recipient.nic,
          recipientTitle: recipient.title,
          recipientEmail: recipient.email,
          recipientMobile: recipient.mobile,
          recipientTelephone: recipient.telephone,
          recipientAddress: recipient.address,
          recipientCity: recipient.city,
          recipientDistrict: recipient.district,
          recipientGramaNiladhari: recipient.gnDivision,
          // recipientLocation: recipient.location,
          showRecipient: "YES",
        });
      }else{
        Object.assign(initData, {
          showRecipient: "NO",
        });
      }

    //TODO: Need to split the date values to date and time
    if (initData.occured_date) {
      initData.occured_date = moment(initData.occured_date).format(
        "YYYY-MM-DDTHH:mm"
      );
      initData.occured_date_date = moment(initData.occured_date).format(
        "YYYY-MM-DD"
      );
      initData.occured_date_time = moment(initData.occured_date).format(
        "HH:mm"
      );
    }
    return initData;
  };

  const handleFileSelect = (selectedFiles) => {
    setState({
      files: selectedFiles,
    });
  };
  const [fileError, setFileError] = useState(false);

  const tableRowAdd = (setFieldValue, fieldName, tableData, record) => {
    return new Promise((resolve, reject) => {
      tableData.push(record);
      setFieldValue(fieldName, tableData);
      resolve();
    });
  };

  const tableRowDelete = (setFieldValue, fieldName, tableData, record) => {
    return new Promise((resolve, reject) => {
      const idx = record.tableData.id;
      tableData.splice(idx, 1);
      setFieldValue(fieldName, tableData);
      resolve();
    });
  };

  const tableRowUpdate = (
    setFieldValue,
    fieldName,
    tableData,
    oldRecord,
    newRecord
  ) => {
    return new Promise((resolve, reject) => {
      tableData[oldRecord.tableData.id] = newRecord;
      setFieldValue(fieldName, tableData);
      resolve();
    });
  };

  const customValidations = (values) => {
    //date time is validated here since it has to be compared with the occurrence.
    //cannot do this with yup.
    let errors = {};
    const { occured_date_date, occurrence } = values;
    if (occured_date_date && occurrence) {
      switch (occurrence) {
        case "OCCURRED":
          if (moment(occured_date_date).isBefore()) {
            //selected date time is before curernt date. no error
            break;
          } else {
            errors["occured_date_date"] =
              "Not a valid date/time for an occured incident";
          }
        case "WILL_OCCUR":
          if (moment(occured_date_date).isAfter()) {
            //selected date time is after curernt date. no error
            break;
          } else {
            errors["occured_date_date"] =
              "Invalid date/time for an incident that will occur in future.";
          }
        default:
          break;
      }
    }
    return errors;
  };

  const hideConfirmModal = (confirmed) => {
    if (confirmed) {
      state.handleConfirmSubmit();
    }
    setState({ showConfirmationModal: false });
  };

  // function used to get filtered inquiries for title text field
  const handleSimilarInquiries = async (title, type) => {
    const filters = {
      incidentType: type,
      title: title,
    };
    const response = await getIncidents(filters);
    if (response.status === "success") {
      setSimilarIncidents(response.data.incidents);
    }
  };

  const { classes, isIncidentSubmitting, isIncidentUpdating } = props;
  const { paramIncidentId } = props.match.params;

  //TODO: convert this component to a fuctional component and get isProcessing status from useLoadingStauts hook.

  const isProcessing = useLoadingStatus([]);
  const reinit = paramIncidentId ? true : false;

  // const politicalPartyLookup = Object.assign(
  //     {},
  //     ...politicalParties.allCodes.map((c, k) => {
  //         const curParty = politicalParties.byCode[c];
  //         return { [curParty.code]: politicalParties.byCode[c].name };
  //     })
  // );
  //validation schema
  const IncidentSchema = Yup.object().shape({
    description: Yup.string().required(f({ id: "request.management.incident.error.description", defaultMessage: "Description is Required" })),
    category: Yup.mixed().required(f({ id: "request.management.incident.error.category", defaultMessage: "Category is Required" })),
    severity: Yup.mixed().when("incidentType", (incidentType, IncidentSchema) =>
      incidentType == "COMPLAINT"
        ? IncidentSchema.required(f({ id: "request.management.incident.error.severity", defaultMessage: "Priority is Required" }))
        : IncidentSchema
    ),
    incidentType: Yup.mixed().required("Required"),
    infoChannel: Yup.mixed().required(f({ id: "request.management.incident.error.channel", defaultMessage: "Mode of receipt is Required" })),
    // language: Yup.string().required(f({ id: "request.management.incident.error.language", defaultMessage: "Language is Required" })),
    reporterName: Yup.string().required(f({ id: "request.management.incident.error.name", defaultMessage: "Name is Required" })),

    reporterNic: Yup
                .string()
                .trim()
                .matches(/^([0-9]{9}[x|X|v|V]|[0-9]{12})$/ , f({ id: "request.management.report.incidents.invalidNic.error.message", defaultMessage: "NIC Number is Required" })),
                // .required(f({ id: "request.management.report.incidents.nic.error.message", defaultMessage: "NIC Number is Required" })),

    reporterTitle: Yup.string().required(f({ id: "request.management.incident.error.title", defaultMessage: "Title is Required" })),
    reporterAddress: Yup.string().required(f({ id: "request.management.incident.error.address", defaultMessage: "Address is Required" })),
    // reporterType: Yup.string().required(f({ id: "request.management.incident.error.type", defaultMessage: "Reporter Type is Required" })),
    city: Yup.string().required(f({ id: "request.management.incident.error.city", defaultMessage: "City is Required" })),
    // address: Yup.string().required("Required"),
    // occurrence: Yup.mixed().when('incidentType', (incidentType, IncidentSchema) => (incidentType == 'COMPLAINT' ? IncidentSchema.required("Required") : IncidentSchema)),
    // election: Yup.mixed().required("Required"),
    district: Yup.mixed().when("incidentType", (incidentType, IncidentSchema) =>
      incidentType == "COMPLAINT"
        ? IncidentSchema.required(f({ id: "request.management.incident.error.district", defaultMessage: "District is Required" }))
        : IncidentSchema
    ),
    // reporterMobile: Yup.number().required(f({ id: "request.management.incident.error.mobile", defaultMessage: "Mobile is Required" })),
    reporterMobile: Yup
                    .string()
                    .trim()
                    .matches(/^(?:0|94|\+94)?(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|912)(0|2|3|4|5|7|9)|7(0|1|2|5|6|7|8)\d)\d{6}$/ , f({ id: "request.management.incident.error.invalidMobile", defaultMessage: "This is not a valid phone number" })),
                    // .required(f({ id: "request.management.incident.error.mobile", defaultMessage: "Mobile is Required" })),

    reporterTelephone: Yup
                      .string()
                      .trim()
                      .matches(/^(?:0|94|\+94)?(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|912)(0|2|3|4|5|7|9)|7(0|1|2|5|6|7|8)\d)\d{6}$/ , f({ id: "request.management.incident.error.invalidMobile", defaultMessage: "This is not a valid phone number" })),
    reporterEmail: Yup.string().email(f({ id: "request.management.incident.error.email", defaultMessage: "Invalid email" })),
    institution: Yup.mixed().when(
      "incidentType",
      (incidentType, IncidentSchema) =>
        incidentType == "INQUIRY" && selectedInstitution == ""
          ? IncidentSchema.required("Required")
          : IncidentSchema
    ),
    receivedDate: Yup.mixed().when(
      "incidentType",
      (incidentType, IncidentSchema) =>
        incidentType == "INQUIRY"
          ? IncidentSchema.required("Required")
          : IncidentSchema
    ),
    letterDate: Yup.mixed().when(
      "incidentType",
      (incidentType, IncidentSchema) =>
        incidentType == "INQUIRY"
          ? IncidentSchema.required("Required")
          : IncidentSchema
    ),
    showRecipient: Yup.mixed().required(f({ id: "request.management.incident.error.recipient", defaultMessage: "Recipient is Required" })),

    recipientName: Yup.mixed().when("showRecipient", (showRecipient, IncidentSchema) =>
    showRecipient == "YES"
        ? IncidentSchema.required(f({ id: "request.management.incident.error.recipient", defaultMessage: "Recipient is Required" }))
        : IncidentSchema
    ),
    recipientNic: Yup
    .string()
    .trim()
    .when("showRecipient", (showRecipient, IncidentSchema) =>
    showRecipient == "YES"
        ? IncidentSchema
        // required(f({ id: "request.management.report.incidents.nic.error.message", defaultMessage: "NIC Number is Required" }))
        .matches(/^([0-9]{9}[x|X|v|V]|[0-9]{12})$/ , f({ id: "request.management.report.incidents.invalidNic.error.message", defaultMessage: "NIC Number is Required" }))
        : IncidentSchema
    ),
    recipientTitle: Yup.mixed().when("showRecipient", (showRecipient, IncidentSchema) =>
    showRecipient == "YES"
        ? IncidentSchema.required(f({ id: "request.management.incident.error.title", defaultMessage: "Title is Required" }))
        : IncidentSchema
    ),
    // recipientType: Yup.mixed().when("showRecipient", (showRecipient, IncidentSchema) =>
    // showRecipient == "YES"
    //     ? IncidentSchema.required(f({ id: "request.management.incident.error.type", defaultMessage: "Recipient Type is Required" }))
    //     : IncidentSchema
    // ),
    recipientAddress: Yup.mixed().when("showRecipient", (showRecipient, IncidentSchema) =>
    showRecipient == "YES"
        ? IncidentSchema.required(f({ id: "request.management.incident.error.address", defaultMessage: "Address is Required" }))
        : IncidentSchema
    ),
    recipientCity: Yup.mixed().when("showRecipient", (showRecipient, IncidentSchema) =>
    showRecipient == "YES"
        ? IncidentSchema.required(f({ id: "request.management.incident.error.city", defaultMessage: "City is Required" }))
        : IncidentSchema
    ),

    recipientMobile: Yup
    .string()
    .trim()
    .when("showRecipient", (showRecipient, IncidentSchema) =>
    showRecipient == "YES"
        ? IncidentSchema
        // .required(f({ id: "request.management.incident.error.mobile", defaultMessage: "Mobile is Required" }))
        .matches(/^(?:0|94|\+94)?(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|912)(0|2|3|4|5|7|9)|7(0|1|2|5|6|7|8)\d)\d{6}$/ , f({ id: "request.management.incident.error.invalidMobile", defaultMessage: "This is not a valid phone number" }))
        : IncidentSchema
    ),

    recipientTelephone: Yup
    .string()
    .trim()
    .when("showRecipient", (showRecipient, IncidentSchema) =>
    showRecipient == "YES"
        ? IncidentSchema.matches(/^(?:0|94|\+94)?(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|912)(0|2|3|4|5|7|9)|7(0|1|2|5|6|7|8)\d)\d{6}$/ , f({ id: "request.management.incident.error.invalidMobile", defaultMessage: "This is not a valid phone number" }))
        : IncidentSchema
    ),

    
    recipientDistrict: Yup.mixed().when("showRecipient", (showRecipient, IncidentSchema) =>
    showRecipient == "YES"
        ? IncidentSchema.required(f({ id: "request.management.incident.error.district", defaultMessage: "District is Required" }))
        : IncidentSchema
    ),
  });

  const getGramaNilidariDivisions = (district) => {
    if(district && districts){
      const districtId = districts.byCode[district].id
      let transformedData = {
        byCode: {},
        allCodes: []
      };
      gramaNiladharis.byDistrict[districtId].reduce((accumulator, currValue) => {
        transformedData.byCode[currValue.code] = currValue;
        transformedData.allCodes.push(currValue.code);
      }, 0)
      return transformedData;
    }else{
      return { byCode: {}, allCodes: [] }
    }
  }

  const suggestions = complaintCategories ? complaintCategories.map((o) => ( {label: o.sub_category, value: o.id }) ) : []; 
  const suggestionDistricts = districts.allCodes.map((c, k) => {
    let currDistrict = districts.byCode[c];
    return (
      currDistrict.name !== "NONE" && (
        {label: currDistrict.name, value: currDistrict.code }
      )
    );
  })
  return (
    <div className={classes.root}>
      <Formik
        enableReinitialize={reinit}
        initialValues={getInitialValues()}
        onSubmit={(values, actions) => {
          handleSubmit(values, actions);
        }}
        validationSchema={IncidentSchema}
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
            <form
              className={classes.container}
              noValidate
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault();
                // if (!isValid) {
                //   dispatch(
                //     showNotification(
                //       { message: "Missing required values" },
                //       null
                //     )
                //   );
                //   window.scroll(0, 0);
                // }
                window.scroll(0, 0);
                handleSubmit(e);
              }}
            >
              {/* <div style={{ display: "none" }}>{incident?incident.id:null}</div> */}
              {/* basic incident detail information */}
              <Paper className={classes.paper}>
              <div className={classes.paper2}>
              <ul className={props.classes.list}>
              <li><Typography style={{ width: '100%' }} align="left" variant="subtitle1" marginTop="20">
                {f({ id: "request.management.report.incidents.helper.text", defaultMessage: "Fields denoted with an * are mandatory." })}
            </Typography></li>
            <li><Typography style={{ width: '100%' }} align="left" variant="subtitle1" marginTop="20">
                {f({ id: "request.management.report.incidents.helper.text2", defaultMessage: "Select your language of preference and then fill in the form below." })}
            </Typography></li>
            <li><Typography style={{ width: '100%' }} align="left" variant="subtitle1" marginTop="20">
                {f({ id: "request.management.report.incidents.helper.text3", defaultMessage: "Include the Request Date/Time. If the request is made by call, the request date is the date of the call. If the request is made by email, letter, and fax, it is the date provided in those modes." })}
            </Typography></li>
            <li><Typography style={{ width: '100%' }} align="left" variant="subtitle1" marginTop="20">
                {f({ id: "request.management.report.incidents.helper.text4", defaultMessage: 'Request on behalf of someone - If a request is made on behalf of someone, click "Yes" and fill in the Recipient Information. If not, click "No"' })}
            </Typography></li>
                    </ul>
            </div>
            <br/>
            {/* <Grid item xs={12}>
                        <FormControl className={classes.group} error={touched.language && errors.language} component="fieldset">
                        <FormLabel component="legend">{f({ id: "request.management.incident.create.location.language", defaultMessage: "Select Language*" })}</FormLabel>
                            <RadioGroup
                                aria-label="Gender"
                                name="language"
                                id="language"
                                value={values.language}
                                onChange={handleChange}
                                onClick={(e) => {dispatch(changeLanguage(e.target.value=="SINHALA" ? "si" : e.target.value=="TAMIL" ? "ta" : "en"))}}
                                row
                            >
                                <FormControlLabel
                                    control={
                                        <Radio />
                                    }
                                    value="SINHALA"
                                    label={f({ id: "request.management.incident.create.location.language.sinhala", defaultMessage: "Sinhala" })}
                                />
                                <FormControlLabel
                                    control={
                                        <Radio />
                                    }
                                    label={f({ id: "request.management.incident.create.location.language.tamil", defaultMessage: "Tamil" })}
                                    value="TAMIL"
                                />
                                <FormControlLabel
                                    control={
                                        <Radio />
                                    }
                                    label={f({ id: "request.management.incident.create.location.language.english", defaultMessage: "English" })}
                                    value="ENGLISH"
                                />
                            </RadioGroup>
                            <FormHelperText>{touched.language && errors.language ? errors.language : ""}</FormHelperText>
                        </FormControl>
                    </Grid> */}
                <Typography variant="h5" gutterBottom>
                  {f({ id: "request.management.incident.create.basic_information" })}
                </Typography>
                <Grid container spacing={24}>
                  {/* <Grid item xs={12}>
                    <FormControl component="fieldset" className={classes.formControl}>
                                            <FormLabel component="legend">Type*</FormLabel>
                                            <RadioGroup
                                                id="incidentType"
                                                name="incidentType"
                                                className={classes.group}
                                                value={values.incidentType}
                                                onChange={handleChange}
                                                row>
                                                <FormControlLabel
                                                    value="COMPLAINT"
                                                    control={<Radio color="primary" />}
                                                    label="Complaint"
                                                />
                                                <FormControlLabel
                                                    value="INQUIRY"
                                                    control={<Radio color="primary" />}
                                                    label="Inquiry"
                                                />
                                            </RadioGroup>
                                            {errors.incidentType ? (
                                                <FormHelperText>{errors.incidentType}</FormHelperText>
                                            ) : null}
                                        </FormControl>
                  </Grid> */}
                  <Grid item xs={12}>
                    <FormLabel component="legend">
                      <div
                        style={{
                          color:
                            errors.infoChannel && touched.infoChannel
                              ? "red"
                              : null,
                        }}
                      >
                        {f({ id: "request.management.incident.create.mode_of_receipt", defaultMessage: "Mode of receipt*" })}
                      </div>
                    </FormLabel>

                    {paramIncidentId ? channels.map((c, k) => (
                      <Button
                        key={k}
                        variant="contained"
                        color={values.infoChannel == c.id ? "primary" : ""}
                        className={classes.button}
                        onClick={() => {
                          setFieldValue("infoChannel", c.id, true);
                        }}
                        disabled={(paramIncidentId && values.infoChannel == c.id) ? "" : "disabled" }
                      >
                        {c.name}
                      </Button>
                    )) : channels.map((c, k) => (
                      <Button
                        key={k}
                        variant="contained"
                        color={values.infoChannel == c.id ? "primary" : ""}
                        className={classes.button}
                        onClick={() => {
                          setFieldValue("infoChannel", c.id, true);
                        }}
                        disabled={c.name == "Web" ? "disabled" : "" }
                      >
                        {c.name}
                      </Button>))}

                    <FormHelperText>
                      {errors.infoChannel && touched.infoChannel ? (
                        <div style={{ color: "red" }}>{f({ id: "request.management.incident.error.channel", defaultMessage: "Mode of receipt is Required" })}</div>
                      ) : (
                          ""
                        )}
                    </FormHelperText>

                    {/* testbox to keep value of channel selected */}
                    <TextField
                      id="infoChannel"
                      name="infoChannel"
                      className={classes.hide}
                      value={values.infoChannel}
                      onChange={handleChange}
                    />
                  </Grid>
                  {/* <Grid item xs={12}>
                                        <TitleAutoComplete
                                            value={values.title}
                                            incidentType={values.incidentType}
                                            paramIncidentId={props.match.params.paramIncidentId}
                                            data={similarIncidents}
                                            onChange={(event) => handleChange(event)}
                                            onFetchSimilarInquiries={(title, type) => handleSimilarInquiries(title, type)}
                                            className={classes.textField}
                                            onBlur={handleBlur}
                                            error={(touched.title && errors.title) == 'Required' ? true : false}
                                            helperText={touched.title ? errors.title : null}
                                        />
                                    </Grid> */}
                  <Grid item xs={12}>
                    <TextField
                      type="text"
                      name="description"
                      label={
                        values.incidentType === "INQUIRY"
                          ? "Letter reference number*"
                          : f({ id: "request.management.incident.create.description", defaultMessage: "Issue / Request details*" })
                      }
                      placeholder="Press enter for new lines."
                      className={classes.textField}
                      disabled={
                        props.match.params.paramIncidentId ? true : false
                      }
                      multiline
                      rows={4}
                      inputProps={{ maxLength: 3000 }}
                      value={values.description}
                      variant="outlined"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.description && errors.description}
                      helperText={
                        touched.description ? errors.description : null
                      }
                    />
                  </Grid>
                  {/* <Grid item xs={12} sm={6}>
                                        <FormControl
                                            error={touched.election && errors.election}
                                            className={classes.formControl}>
                                            <InputLabel htmlFor="election">Election*</InputLabel>
                                            <Select
                                                value={values.election}
                                                onChange={handleChange}
                                                inputProps={{
                                                    name: "election",
                                                    id: "election"
                                                }}>
                                                <MenuItem value="">
                                                    {" "}
                                                    <em>None</em>{" "}
                                                </MenuItem>
                                                {elections
                                                    ? elections.map((c, k) => (
                                                        <MenuItem value={c.code} key={k}>
                                                            {c.name}
                                                        </MenuItem>
                                                    ))
                                                    : null}
                                            </Select>
                                            <FormHelperText>
                                                {touched.election && errors.election ? errors.election : ""}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid> */}
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      className={classes.formControl2}
                      error={touched.category && errors.category}
                    >
                      {/* <InputLabel htmlFor="category">{f({ id: "request.management.incident.create.category", defaultMessage: "Category" })}*</InputLabel> */}
                      <CustomAutocompleteCategory  
                          suggestions={suggestions} 
                          value={values.category} 
                          handleChange={(event) => handleChange(event)}
                          error={(errors.category) == 'Category is Required' ? true : false}
                          categories={complaintCategories} />
                      
                      {/* <Select
                        value={values.category}
                        onChange={handleChange}
                        inputProps={{
                          name: "category",
                          id: "category",
                        }}
                      >
                        {values.incidentType === "COMPLAINT" &&
                          complaintCategories &&
                          complaintCategories.map((c, k) => (
                            <MenuItem value={c.id} key={k}>
                              <div className={classes.langCats}>
                                <div>{c.code}</div>
                                <div>|</div>
                                <div>{c.sub_category}</div>
                                <div>|</div>
                                <div> {c.sn_sub_category}</div>
                                <div>|</div>
                                <div> {c.tm_sub_category}</div>
                              </div>
                            </MenuItem>
                          ))}
                        {values.incidentType === "INQUIRY" &&
                          inquiryCategories &&
                          inquiryCategories.map((c, k) => (
                            <MenuItem value={c.id} key={k}>
                              <div className={classes.langCats}>
                                <div>{c.code}</div>
                                <div>|</div>
                                <div>{c.sub_category}</div>
                                <div>|</div>
                                <div> {c.sn_sub_category}</div>
                                <div>|</div>
                                <div> {c.tm_sub_category}</div>
                              </div>
                            </MenuItem>
                          ))}
                      </Select> */}
                      <FormHelperText>
                        {touched.category && errors.category ? errors.category : ""}
                        {/* {(errors.category) == 'Category is Required' ? true : false} */}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                  {values.incidentType === "COMPLAINT" ? (
                    <>
                      {/* <Grid item xs={12} sm={6}>
                                                <FormControl
                                                    error={touched.occurrence && errors.occurrence}
                                                    component="fieldset"
                                                    className={classes.formControl}>
                                                    <FormLabel component="legend">Occurrence*</FormLabel>
                                                    <RadioGroup
                                                        name="occurrence"
                                                        id="occurrence"
                                                        className={classes.group}
                                                        value={values.occurrence}
                                                        onChange={handleChange}
                                                        row={true}>
                                                        <FormControlLabel
                                                            value="OCCURRED"
                                                            control={<Radio color="primary" />}
                                                            label="Occurred"
                                                        />
                                                        <FormControlLabel
                                                            value="OCCURRING"
                                                            control={<Radio color="primary" />}
                                                            label="Occurring"
                                                        />
                                                        <FormControlLabel
                                                            value="WILL_OCCUR"
                                                            control={<Radio color="primary" />}
                                                            label="Will Occur"
                                                        />
                                                    </RadioGroup>
                                                    {errors.occurrence ? (
                                                        <FormHelperText>{errors.occurrence}</FormHelperText>
                                                    ) : null}
                                                </FormControl>
                                            </Grid> */}
                      {/* <Grid item xs={12} sm={3}>
                        <TextField
                          id="occured_date_date"
                          label={f({ id: "request.management.incident.create.date", defaultMessage: "Request Date" })}
                          type="date"
                          value={values.occured_date_date}
                          InputLabelProps={{ shrink: true }}
                          onChange={handleChange}
                          error={errors.occured_date_date}
                          helperText={errors.occured_date_date}
                        />
                        <TextField
                          id="occured_date_time"
                          label={f({ id: "request.management.incident.create.time", defaultMessage: "Request Time" })}
                          type="time"
                          value={values.occured_date_time}
                          InputLabelProps={{ shrink: true }}
                          onChange={handleChange}
                          error={errors.occured_date_time}
                          helperText={errors.occured_date_time}
                        />
                      </Grid> */}
                    </>
                  ) : null}
                  {values.incidentType === "COMPLAINT" ? (
                    <Grid item xs={12} sm={3}>
                      <FormControl
                        error={touched.severity && errors.severity}
                        component="fieldset"
                        className={classes.formControl}
                      >
                        <FormLabel component="legend">{f({ id: "request.management.incident.create.severity", defaultMessage: "Priority*" })}</FormLabel>
                        <RadioGroup
                          name="severity"
                          id="severity"
                          value={values.severity}
                          onChange={handleChange}
                          row
                        >
                          <FormControlLabel
                            value="HIGH"
                            control={
                              <Radio
                                classes={{
                                  root: classes.severityHigh,
                                  checked: classes.checked,
                                }}
                                checked={
                                  values.severity == "HIGH" ? true : false
                                }
                              />
                            }
                            label="High"
                            labelPlacement="bottom"
                            className={classes.radioItem}
                            classes={{
                              label: classes.severityHigh,
                            }}
                          />
                          <FormControlLabel
                            value="MEDIUM"
                            control={
                              <Radio
                                classes={{
                                  root: classes.severityMedium,
                                  checked: classes.checked,
                                }}
                                checked={
                                  values.severity == "MEDIUM" ? true : false
                                }
                              />
                            }
                            label="Medium"
                            labelPlacement="bottom"
                            className={classes.radioItem}
                            classes={{
                              label: classes.severityMedium,
                            }}
                          />
                          <FormControlLabel
                            value="LOW"
                            control={
                              <Radio
                                classes={{
                                  root: classes.severityLow,
                                  checked: classes.checked,
                                }}
                                checked={
                                  values.severity == "LOW" ? true : false
                                }
                              />
                            }
                            label="Low"
                            labelPlacement="bottom"
                            className={classes.radioItem}
                            classes={{
                              label: classes.severityLow,
                            }}
                          />
                          {/* <FormControlLabel
                                                        value="4"
                                                        control={
                                                            <Radio
                                                                classes={{
                                                                    root: classes.severityMedium,
                                                                    checked: classes.checked
                                                                }}
                                                                checked={values.severity == "4" ? true : false}
                                                            />
                                                        }
                                                        label="4"
                                                        labelPlacement="bottom"
                                                        className={classes.radioItem}
                                                        classes={{
                                                            label: classes.severityMedium
                                                        }}
                                                    />
                                                    <FormControlLabel
                                                        value="5"
                                                        control={
                                                            <Radio
                                                                classes={{
                                                                    root: classes.severityMedium,
                                                                    checked: classes.checked
                                                                }}
                                                                checked={values.severity == "5" ? true : false}
                                                            />
                                                        }
                                                        label="5"
                                                        labelPlacement="bottom"
                                                        className={classes.radioItem}
                                                        classes={{
                                                            label: classes.severityMedium
                                                        }}
                                                    />
                                                    <FormControlLabel
                                                        value="6"
                                                        control={
                                                            <Radio
                                                                classes={{
                                                                    root: classes.severityMedium,
                                                                    checked: classes.checked
                                                                }}
                                                                checked={values.severity == "6" ? true : false}
                                                            />
                                                        }
                                                        label="6"
                                                        labelPlacement="bottom"
                                                        className={classes.radioItem}
                                                        classes={{
                                                            label: classes.severityMedium
                                                        }}
                                                    />
                                                    <FormControlLabel
                                                        value="7"
                                                        control={
                                                            <Radio
                                                                classes={{
                                                                    root: classes.severityMedium,
                                                                    checked: classes.checked
                                                                }}
                                                                checked={values.severity == "7" ? true : false}
                                                            />
                                                        }
                                                        label="7"
                                                        labelPlacement="bottom"
                                                        className={classes.radioItem}
                                                        classes={{
                                                            label: classes.severityMedium
                                                        }}
                                                    />
                                                    <FormControlLabel
                                                        value="8"
                                                        control={
                                                            <Radio
                                                                classes={{
                                                                    root: classes.severityHigh,
                                                                    checked: classes.checked
                                                                }}
                                                                checked={values.severity == "8" ? true : false}
                                                            />
                                                        }
                                                        label="8"
                                                        labelPlacement="bottom"
                                                        className={classes.radioItem}
                                                        classes={{
                                                            label: classes.severityHigh
                                                        }}
                                                    />
                                                    <FormControlLabel
                                                        value="9"
                                                        control={
                                                            <Radio
                                                                classes={{
                                                                    root: classes.severityHigh,
                                                                    checked: classes.checked
                                                                }}
                                                                checked={values.severity == "9" ? true : false}
                                                            />
                                                        }
                                                        label="9"
                                                        labelPlacement="bottom"
                                                        className={classes.radioItem}
                                                        classes={{
                                                            label: classes.severityHigh
                                                        }}
                                                    />
                                                    <FormControlLabel
                                                        value="10"
                                                        control={
                                                            <Radio
                                                                classes={{
                                                                    root: classes.severityHigh,
                                                                    checked: classes.checked
                                                                }}
                                                                checked={values.severity == "10" ? true : false}
                                                            />
                                                        }
                                                        label="10"
                                                        labelPlacement="bottom"
                                                        className={classes.radioItem}
                                                        classes={{
                                                            label: classes.severityHigh
                                                        }}
                                                    /> */}
                        </RadioGroup>
                        <FormHelperText>
                          {touched.severity && errors.severity
                            ? errors.severity
                            : ""}
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                  ) : null}
                  {/* <Grid item xs={12} sm={6}>
                                            <TextField
                                                id="referenceNumber"
                                                name="referenceNumber"
                                                label="Reference Name"
                                                className={classes.textField}
                                                value={values.referenceNumber}
                                                onChange={handleChange}
                                            />
                                        </Grid> */}
                  {values.incidentType === "INQUIRY" ? (
                    <Grid item xs={12} sm={3}>
                      <TextField
                        id="receivedDate"
                        label={f({ id: "request.management.incident.create.date", defaultMessage: "Request Date" })}
                        type="date"
                        value={values.receivedDate}
                        InputLabelProps={{ shrink: true }}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.receivedDate && errors.receivedDate}
                        helperText={
                          touched.receivedDate ? errors.receivedDate : null
                        }
                      />
                    </Grid>
                  ) : null}
                  {values.incidentType === "INQUIRY" ? (
                    <Grid item xs={12} sm={3}>
                      <TextField
                        id="letterDate"
                        label={f({ id: "request.management.incident.create.date" })}
                        type="date"
                        value={values.letterDate}
                        InputLabelProps={{ shrink: true }}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.letterDate && errors.letterDate}
                        helperText={
                          touched.letterDate ? errors.letterDate : null
                        }
                      />
                    </Grid>
                  ) : null}
                  {/* <Grid item xs={12} sm={6}>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel htmlFor="inquiryCategory">Category</InputLabel>
                                                <Select
                                                    value={values.inquiryCategory}
                                                    onChange={handleChange}
                                                    inputProps={{
                                                        name: "inquiryCategory",
                                                        id: "inquiryCategory"
                                                    }}>
                                                    <MenuItem value="">
                                                        {" "}
                                                        <em>None</em>{" "}
                                                    </MenuItem>
                                                    {inquiryCategories
                                                        ? inquiryCategories.map((c, k) => (
                                                              <MenuItem value={c.id} key={k}>
                                                                  <div className={classes.langCats}>
                                                                      <div>{c.code}</div>
                                                                      <div>|</div>
                                                                      <div>{c.sub_category}</div>
                                                                      <div>|</div>
                                                                      <div> {c.sn_sub_category}</div>
                                                                      <div>|</div>
                                                                      <div> {c.tm_sub_category}</div>
                                                                  </div>
                                                              </MenuItem>
                                                          ))
                                                        : null}
                                                </Select>
                                            </FormControl>
                                        </Grid> */}
                  {values.incidentType === "INQUIRY" ? (
                    <Grid item xs={12} sm={12}>
                      <FormControl
                        error={touched.institution && errors.institution}
                        className={classes.formControl}
                      >
                        Institution
                      </FormControl>
                      <Search
                        institutions={institutions}
                        onChange={setSelectedInstitution}
                      />
                      <FormHelperText style={{ color: "#f44336" }}>
                        {touched.institution && errors.institution
                          ? errors.institution
                          : ""}
                      </FormHelperText>
                    </Grid>
                  ) : null}
                  {!paramIncidentId && (
                    <Grid item xs={12} sm={12}>
                      <InputLabel htmlFor="election">
                        {f({ id: "request.management.incident.create.upload_file", defaultMessage: "Upload File (You can upload multiple files)" })}
                      </InputLabel>
                      <FileUploader
                        files={state.files}
                        setFiles={handleFileSelect}
                        setFileError={setFileError}
                      />
                    </Grid>
                  )}
                </Grid>
              </Paper>
              {/* contact information of the complianer */}
              <Paper className={classes.paper}>
                <Typography variant="h5" gutterBottom>
                {f({ id: "request.management.incident.create.contact_information", defaultMessage: "Contact Information" })}
                </Typography>
                <Grid container spacing={24}>
                <Grid item xs={12} sm={4}>
                        <FormControl className={classes.title} error={touched.reporterTitle ? errors.reporterTitle : false} component="fieldset">
                            <FormLabel component="legend">{f({ id: "request.management.incident.create.location.title", defaultMessage: "Title*" })}</FormLabel>
                            <RadioGroup
                                aria-label="Gender"
                                name="reporterTitle"
                                id="reporterTitle"
                                // ref= {this.props.securityDepositeRpp}
                                value={values.reporterTitle}
                                onChange={handleChange}
                                // onClick={this.showAmountRpp.bind(this)}
                                row
                            >
                                <FormControlLabel
                                    control={
                                        <Radio />
                                    }
                                    value="REV"
                                    label={f({ id: "request.management.incident.create.location.title.rev", defaultMessage: "Rev." })}
                                />
                                <FormControlLabel
                                    control={
                                        <Radio />
                                    }
                                    label={f({ id: "request.management.incident.create.location.title.mr", defaultMessage: "Mr." })}
                                    value="MR"
                                />
                                <FormControlLabel
                                    control={
                                        <Radio />
                                    }
                                    value="MRS"
                                    label={f({ id: "request.management.incident.create.location.title.mrs", defaultMessage: "Mrs." })}
                                />
                                <FormControlLabel
                                    control={
                                        <Radio />
                                    }
                                    label={f({ id: "request.management.incident.create.location.title.ms", defaultMessage: "Ms." })}
                                    value="MS"
                                />
                            </RadioGroup>
                            <FormHelperText>{touched.reporterTitle ? errors.reporterTitle : null}</FormHelperText>
                        </FormControl>
                    </Grid>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      id="reporterName"
                      name="reporterName"
                      label={f({ id: "request.management.incident.create.reporter.name", defaultMessage: "reporter Name*" })}
                      className={classes.textField2}
                      value={values.reporterName}
                      onChange={handleChange}
                      error={touched.reporterName && errors.reporterName}
                      helperText={
                        touched.reporterName ? errors.reporterName : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      id="reporterNic"
                      name="reporterNic"
                      label={f({ id: "request.management.report.incidents.contact.nic", defaultMessage: "NIC/SLIN Nubmer*" })}
                      className={classes.textField3}
                      value={values.reporterNic}
                      onChange={handleChange}
                      error={touched.reporterNic && errors.reporterNic}
                      helperText={
                        touched.reporterNic ? errors.reporterNic : null
                      }
                    />
                  </Grid>
                  {/* <Grid item xs={12} sm={3}>
                    <FormControl  error={touched.reporterType && errors.reporterType} className={classes.formControl}>
                      <InputLabel htmlFor="reporterType">
                      {f({ id: "request.management.incident.create.reporter.type", defaultMessage: "Individual/Organization*" })}
                      </InputLabel>
                      <Select
                        value={values.reporterType}
                        onChange={handleChange}
                        inputProps={{
                          name: "reporterType",
                          id: "reporterType",
                        }}
                      >
                        <MenuItem value="">
                          {" "}
                          <em>None</em>{" "}
                        </MenuItem>
                        <MenuItem value={"INDIVIDUAL"}>Individual</MenuItem>
                        <MenuItem value={"ORGANIZATION"}>Organization</MenuItem>
                      </Select>
                      <FormHelperText>
                            {touched.reporterType && errors.reporterType
                              ? errors.reporterType
                              : ""}
                          </FormHelperText>
                    </FormControl>
                  </Grid> */}
                  {/* {values.incidentType === "COMPLAINT" && (
                                        <Grid item xs={12} sm={3}>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel htmlFor="reporterAffiliation">Political Affiliation</InputLabel>
                                                <Select
                                                    value={values.reporterAffiliation}
                                                    onChange={handleChange}
                                                    inputProps={{
                                                        name: "reporterAffiliation",
                                                        id: "reporterAffiliation"
                                                    }}>
                                                    <MenuItem value="">
                                                        {" "}
                                                        <em>None</em>{" "}
                                                    </MenuItem>
                                                    {Object.entries(politicalPartyLookup).map(([key, value]) => {
                                                        return (
                                                            <MenuItem key={key} value={key}>
                                                                {value}
                                                            </MenuItem>
                                                        );
                                                    })}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    )} */}
                  <Grid item xs={12} sm={8}>
                    <TextField
                      id="reporterAddress"
                      name="reporterAddress"
                      label={f({ id: "request.management.incident.create.reporter.address", defaultMessage: "Address" })}
                      variant="outlined"
                      multiline
                      className={classes.textField}
                      value={values.reporterAddress}
                      onChange={handleChange}
                      error={touched.reporterAddress && errors.reporterAddress}
                      helperText={
                        touched.reporterAddress ? errors.reporterAddress : null
                      }
                    />
                  </Grid>
                  {/* <Grid item xs={12}>
                        <TextField
                          id="location"
                          label={f({ id: "request.management.incident.create.location.description", defaultMessage: "Description / Landmarks"  })}
                          className={classes.textField}
                          value={values.location}
                          onChange={handleChange}
                          multiline
                        />
                      </Grid> */}
                  <Grid item xs={12} md={4} sm={6}>
                    <TelephoneInput
                      className={classes.textField}
                      name="reporterMobile"
                      label={f({ id: "request.management.incident.create.reporter.mobile", defaultMessage: "Mobile*" })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4} sm={6}>
                    <TelephoneInput
                      className={classes.textField}
                      name="reporterTelephone"
                      label={f({ id: "request.management.incident.create.reporter.telephone", defaultMessage: "Landline" })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4} sm={6}>
                    <TextField
                      id="reporterEmail"
                      name="reporterEmail"
                      label={f({ id: "request.management.incident.create.reporter.email", defaultMessage: "Email" })}
                      className={classes.textField}
                      value={values.reporterEmail}
                      onChange={handleChange}
                      error={touched.reporterEmail && errors.reporterEmail}
                      helperText={
                        touched.reporterEmail ? errors.reporterEmail : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={4} sm={6}>
                        <TextField
                          error={touched.city && errors.city}
                          id="city"
                          label={f({ id: "request.management.incident.create.location.city", defaultMessage: "City*" })}
                          className={classes.textField}
                          value={values.city}
                          onChange={handleChange}
                          helperText={
                            touched.city ? errors.city : null
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={4} sm={6}>
                        <FormControl
                          error={touched.district && errors.district}
                          className={classes.formControl2}
                        >
                          <CustomAutocompleteDistrict suggestions={suggestionDistricts} value={values.district} handleChange={handleChange} districts={districts} />
                          {/* <InputLabel htmlFor="district">{f({ id: "request.management.incident.create.location.district", defaultMessage: "District" })}*</InputLabel>
                          <Select
                            value={values.district}
                            onChange={handleChange}
                            inputProps={{
                              name: "district",
                              id: "district",
                            }}
                          >
                            <MenuItem value="">
                              {" "}
                              <em>None</em>{" "}
                            </MenuItem>
                            {districts.allCodes.map((c, k) => {
                              let currDistrict = districts.byCode[c];
                              return (
                                currDistrict.name !== "NONE" && (
                                  <MenuItem value={currDistrict.code} key={k}>
                                    {currDistrict.name}
                                  </MenuItem>
                                )
                              );
                            })}
                          </Select> */}
                          <FormHelperText>
                            {touched.district && errors.district
                              ? errors.district
                              : ""}
                          </FormHelperText>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4} sm={6}>
                        <FormControl className={classes.formControl2}>
                        <CustomAutocompleteGn
                              dataObj={getGramaNilidariDivisions(values.district)}
                              value={values.gramaNiladhari} 
                              handleChange={handleChange} 
                              />

                          {/* <InputLabel htmlFor="gramaNiladhari">
                            {f({ id: "request.management.incident.create.location.gn_division", defaultMessage: "Grama Niladhari Division" })}
                          </InputLabel>
                          <IntlSelect
                            value={values.gramaNiladhari}
                            handleChange={handleChange}
                            name="gramaNiladhari"
                            dataObj={getGramaNilidariDivisions(values.district)}
                          /> */}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl error={touched.showRecipient ? errors.showRecipient : false} component="fieldset">
                            <FormLabel component="legend">{f({ id: "request.management.incident.create.reporter.onbehalf", defaultMessage: "On behalf of someone else" })}</FormLabel>
                            <RadioGroup
                                aria-label="Gender"
                                name="showRecipient"
                                id="showRecipient"
                                // ref= {this.props.securityDepositeRpp}
                                className={classes.group}
                                value={values.showRecipient}
                                onChange={handleChange}
                                // onClick={this.showAmountRpp.bind(this)}
                                row
                            >
                                <FormControlLabel
                                    control={
                                        <Radio />
                                    }
                                    value="YES"
                                    label="Yes"
                                />
                                <FormControlLabel
                                    control={
                                        <Radio />
                                    }
                                    label="No"
                                    value="NO"
                                />
                            </RadioGroup>
                            <FormHelperText>{touched.showRecipient ? errors.showRecipient : null}</FormHelperText>
                        </FormControl>
                    </Grid>
                    
                  {values.incidentType === "COMPLAINT" ? (
                    <>
                      {/* <Grid item xs={12} sm={6}>
                                                <TextField
                                                    id="accusedName"
                                                    name="accusedName"
                                                    label="Accused Name"
                                                    className={classes.textField}
                                                    value={values.accusedName}
                                                    onChange={handleChange}
                                                    error={touched.accusedName && errors.accusedName}
                                                    helperText={touched.accusedName ? errors.accusedName : null}
                                                />
                                            </Grid> */}
                      {/* <Grid item xs={12} sm={6}>
                                                <FormControl className={classes.formControl}>
                                                    <InputLabel htmlFor="accusedAffiliation">
                                                        Political Affiliation of the accused
                                            </InputLabel>
                                                    <Select
                                                        value={values.accusedAffiliation}
                                                        onChange={handleChange}
                                                        inputProps={{
                                                            name: "accusedAffiliation",
                                                            id: "accusedAffiliation"
                                                        }}>
                                                        <MenuItem value="">
                                                            {" "}
                                                            <em>None</em>{" "}
                                                        </MenuItem>
                                                        {Object.entries(politicalPartyLookup).map(([key, value]) => {
                                                            return (
                                                                <MenuItem key={key} value={key}>
                                                                    {value}
                                                                </MenuItem>
                                                            );
                                                        })}
                                                    </Select>
                                                </FormControl>
                                            </Grid> */}
                      {/* <Grid item xs={12}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            id="reporterConsent"
                                                            name="reporterConsent"
                                                            checked={values.reporterConsent}
                                                            onChange={handleChange}
                                                            color="primary"
                                                        />
                                                    }
                                                    label="Reporter details can be shared with external parties."
                                                />
                                            </Grid> */}
                    </>
                  ) : null}
                </Grid>
              </Paper>
              {
                        values.showRecipient==='YES' ?
                        <Paper className={classes.paper}>
                        <Typography variant="h5" gutterBottom>
                        {f({ id: "request.management.incident.create.recipient_information", defaultMessage: "Recipient Information" })}
                        </Typography>
                        {/* <div className={classes.paper2}>
                        <ul className={props.classes.list}>
                        <li><Typography style={{ width: '100%' }} align="left" variant="subtitle2" marginTop="20">
                            {f({ id: "request.management.report.incidents.section.location.info", defaultMessage: "If the location where help is required differs from your address, please fill in this section w/ the location details." })}
                        </Typography></li>
                    </ul></div> */}
                        <Grid container spacing={24}>
                        <Grid item xs={12} sm={4}>
                        <FormControl className={classes.title} error={touched.recipientTitle ? errors.recipientTitle : false} component="fieldset">
                            <FormLabel component="legend">{f({ id: "request.management.incident.create.location.title", defaultMessage: "Title*" })}</FormLabel>
                            <RadioGroup
                                aria-label="Gender"
                                name="recipientTitle"
                                id="recipientTitle"
                                // ref= {this.props.securityDepositeRpp}
                                value={values.recipientTitle}
                                onChange={handleChange}
                                // onClick={this.showAmountRpp.bind(this)}
                                row
                            >
                                <FormControlLabel
                                    control={
                                        <Radio />
                                    }
                                    value="REV"
                                    label={f({ id: "request.management.incident.create.location.title.rev", defaultMessage: "Rev." })}
                                />
                                <FormControlLabel
                                    control={
                                        <Radio />
                                    }
                                    label={f({ id: "request.management.incident.create.location.title.mr", defaultMessage: "Mr." })}
                                    value="MR"
                                />
                                <FormControlLabel
                                    control={
                                        <Radio />
                                    }
                                    value="MRS"
                                    label={f({ id: "request.management.incident.create.location.title.mrs", defaultMessage: "Mrs." })}
                                />
                                <FormControlLabel
                                    control={
                                        <Radio />
                                    }
                                    label={f({ id: "request.management.incident.create.location.title.ms", defaultMessage: "Ms." })}
                                    value="MS"
                                />
                            </RadioGroup>
                            <FormHelperText>{touched.recipientTitle ? errors.recipientTitle : null}</FormHelperText>
                        </FormControl>
                    </Grid>
                        <Grid item xs={12} sm={8}>
                          <TextField
                            id="recipientName"
                            name="recipientName"
                            label={f({ id: "request.management.incident.create.recipient.name", defaultMessage: "Recipient Name*" })}
                            className={classes.textField2}
                            value={values.recipientName}
                            onChange={handleChange}
                            error={touched.recipientName && errors.recipientName}
                            helperText={
                              touched.recipientName ? errors.recipientName : null
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            id="recipientNic"
                            name="recipientNic"
                            label={f({ id: "request.management.report.incidents.contact.nic", defaultMessage: "NIC/SLIN Nubmer*" })}
                            className={classes.textField3}
                            value={values.recipientNic}
                            onChange={handleChange}
                            error={touched.recipientNic && errors.recipientNic}
                            helperText={
                              touched.recipientNic ? errors.recipientNic : null
                            }
                          />
                        </Grid>
                        {/* <Grid item xs={12} sm={3}>
                          <FormControl  error={touched.recipientType && errors.recipientType} className={classes.formControl}>
                            <InputLabel htmlFor="reporterType">
                            {f({ id: "request.management.incident.create.reporter.type", defaultMessage: "Individual/Organization*" })}
                            </InputLabel>
                            <Select
                              value={values.recipientType}
                              onChange={handleChange}
                              inputProps={{
                                name: "recipientType",
                                id: "recipientType",
                              }}
                            >
                              <MenuItem value="">
                                {" "}
                                <em>None</em>{" "}
                              </MenuItem>
                              <MenuItem value={"INDIVIDUAL"}>Individual</MenuItem>
                              <MenuItem value={"ORGANIZATION"}>Organization</MenuItem>
                            </Select>
                            <FormHelperText>
                                  {touched.recipientType && errors.recipientType
                                    ? errors.recipientType
                                    : ""}
                                </FormHelperText>
                          </FormControl>
                        </Grid> */}
                        {/* {values.incidentType === "COMPLAINT" && (
                                              <Grid item xs={12} sm={3}>
                                                  <FormControl className={classes.formControl}>
                                                      <InputLabel htmlFor="reporterAffiliation">Political Affiliation</InputLabel>
                                                      <Select
                                                          value={values.reporterAffiliation}
                                                          onChange={handleChange}
                                                          inputProps={{
                                                              name: "reporterAffiliation",
                                                              id: "reporterAffiliation"
                                                          }}>
                                                          <MenuItem value="">
                                                              {" "}
                                                              <em>None</em>{" "}
                                                          </MenuItem>
                                                          {Object.entries(politicalPartyLookup).map(([key, value]) => {
                                                              return (
                                                                  <MenuItem key={key} value={key}>
                                                                      {value}
                                                                  </MenuItem>
                                                              );
                                                          })}
                                                      </Select>
                                                  </FormControl>
                                              </Grid>
                                          )} */}
                        <Grid item xs={12} sm={8}>
                          <TextField
                            id="recipientAddress"
                            name="recipientAddress"
                            label={f({ id: "request.management.incident.create.reporter.address" })}
                            variant="outlined"
                            multiline
                            className={classes.textField}
                            value={values.recipientAddress}
                            onChange={handleChange}
                            error={touched.recipientAddress && errors.recipientAddress}
                            helperText={
                              touched.recipientAddress ? errors.recipientAddress : null
                            }
                          />
                        </Grid>
                        {/* <Grid item xs={12}>
                        <TextField
                          id="recipientLocation"
                          label={f({ id: "request.management.incident.create.location.description" })}
                          className={classes.textField}
                          value={values.recipientLocation}
                          onChange={handleChange}
                          multiline
                        />
                      </Grid> */}
                        <Grid item xs={12} md={4} sm={6}>
                          <TelephoneInput
                            className={classes.textField}
                            name="recipientMobile"
                            label={f({ id: "request.management.incident.create.reporter.mobile" })}
                          />
                        </Grid>
                        <Grid item xs={12} md={4} sm={6}>
                          <TelephoneInput
                            className={classes.textField}
                            name="recipientTelephone"
                            label={f({ id: "request.management.incident.create.reporter.telephone", defaultMessage: "Landline" })}
                          />
                        </Grid>
                        <Grid item xs={12} md={4} sm={6}>
                          <TextField
                            id="recipientEmail"
                            name="recipientEmail"
                            label={f({ id: "request.management.incident.create.reporter.email" })}
                            className={classes.textField}
                            value={values.recipientEmail}
                            onChange={handleChange}
                            error={touched.recipientEmail && errors.recipientEmail}
                            helperText={
                              touched.recipientEmail ? errors.recipientEmail : null
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                              <TextField
                                error={touched.recipientCity && errors.recipientCity}
                                id="recipientCity"
                                label={f({ id: "request.management.incident.create.location.city" })}
                                className={classes.textField}
                                value={values.recipientCity}
                                onChange={handleChange}
                                helperText={
                                  touched.recipientCity ? errors.recipientCity : null
                                }
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <FormControl
                                error={touched.recipientDistrict && errors.recipientDistrict}
                                className={classes.formControl2}
                              >
                              <CustomAutocompleteRecipientDistrict suggestions={suggestionDistricts} value={values.recipientDistrict} handleChange={handleChange} districts={districts} />
                                {/* <InputLabel htmlFor="recipientDistrict">{f({ id: "request.management.incident.create.location.district" })}*</InputLabel>
                                <Select
                                  value={values.recipientDistrict}
                                  onChange={handleChange}
                                  inputProps={{
                                    name: "recipientDistrict",
                                    id: "recipientDistrict",
                                  }}
                                >
                                  <MenuItem value="">
                                    {" "}
                                    <em>None</em>{" "}
                                  </MenuItem>
                                  {districts.allCodes.map((c, k) => {
                                    let currDistrict = districts.byCode[c];
                                    return (
                                      currDistrict.name !== "NONE" && (
                                        <MenuItem value={currDistrict.code} key={k}>
                                          {currDistrict.name}
                                        </MenuItem>
                                      )
                                    );
                                  })}
                                </Select> */}
                                <FormHelperText>
                                  {touched.district && errors.recipientDistrict
                                    ? errors.recipientDistrict
                                    : ""}
                                </FormHelperText>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <FormControl className={classes.formControl2}>
                              <CustomAutocompleteRecipientGn
                              dataObj={getGramaNilidariDivisions(values.recipientDistrict)}
                              value={values.recipientGramaNiladhari} 
                              handleChange={handleChange} 
                              />
                                {/* <InputLabel htmlFor="recipientGramaNiladhari">
                                  {f({ id: "request.management.incident.create.location.gn_division" })}
                                </InputLabel>
                                <IntlSelect
                                  value={values.recipientGramaNiladhari}
                                  handleChange={handleChange}
                                  name="recipientGramaNiladhari"
                                  dataObj={getGramaNilidariDivisions(values.recipientDistrict)}
                                /> */}
                              </FormControl>
                            </Grid>
                            </Grid>
                            </Paper>
                         : ''
                    }

              {values.incidentType === "COMPLAINT" && (
                <>
                  {/* Incident location information */}
                  {/* <Paper className={classes.paper}>
                    <Typography variant="h5" gutterBottom>
                      {f({ id: "request.management.incident.create.location_information" })}
                    </Typography>
                    <ul className={props.classes.list}>
                        <li>{f({ id: "request.management.report.incidents.section.location.info", defaultMessage: "If the location where help is required differs from your address, please fill in this section w/ the location details." })}</li>
                    </ul>
                    <Grid container spacing={24}>
                      <Grid item xs={12} sm={12}>
                        <TextField
                          id="address"
                          label={f({ id: "request.management.incident.create.location.address" })}
                          variant="outlined"
                          multiline
                          className={classes.textField}
                          value={values.address}
                          onChange={handleChange}
                          error={touched.address && errors.address}
                      helperText={
                        touched.address ? errors.address : null
                      }
                        />
                      </Grid> */}
                      
                      {/* <Grid item xs={12} sm={4}>
                                        <FormControl className={classes.formControl}>
                                            <InputLabel htmlFor="province">Province</InputLabel>
                                            <Select
                                                value={values.province}
                                                onChange={handleChange}
                                                inputProps={{
                                                    name: "province",
                                                    id: "province"
                                                }}>
                                                <MenuItem value="">
                                                    {" "}
                                                    <em>None</em>{" "}
                                                </MenuItem>
                                                {provinces.allCodes.map((c, k) => {
                                                    let currProvince = provinces.byCode[c];
                                                    return (
                                                        <MenuItem value={currProvince.code} key={k}>
                                                            {currProvince.name}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </Select>
                                        </FormControl>
                                    </Grid> */}
                      
                      {/* <Grid item xs={12} sm={4}>
                                        <FormControl className={classes.formControl}>
                                            <InputLabel htmlFor="divisionalSecretariat">
                                                Divisional Secretariat
                                            </InputLabel>
                                            <IntlSelect
                                                value={values.divisionalSecretariat}
                                                handleChange={handleChange}
                                                name="divisionalSecretariat"
                                                dataObj={divisionalSecretariats}
                                            />
                                        </FormControl>
                                    </Grid> */}
                      {/* <Grid item xs={12} sm={4}>
                                        <FormControl className={classes.formControl}>
                                            <InputLabel htmlFor="pollingDivision">Polling Division</InputLabel>
                                            <IntlSelect
                                                value={values.pollingDivision}
                                                handleChange={handleChange}
                                                name="pollingDivision"
                                                dataObj={pollingDivisions}
                                            />
                                        </FormControl>
                                    </Grid> */}
                      {/* <Grid item xs={12} sm={4}>
                                        <FormControl className={classes.formControl}>
                                            <InputLabel htmlFor="pollingStation">Polling Station</InputLabel>
                                            <IntlSelect
                                                value={values.pollingStation}
                                                handleChange={handleChange}
                                                name="pollingStation"
                                                dataObj={pollingStations}
                                            />
                                        </FormControl>
                                    </Grid> */}
                      
                      {/* <Grid item xs={12} sm={4}>
                                        <FormControl className={classes.formControl}>
                                            <InputLabel htmlFor="policeDivision">Police Division</InputLabel> */}
                      {/* <IntlSelect
                                                        value={values.policeDivision}
                                                        handleChange={handleChange}
                                                        name='policeDivision'
                                                        dataObj={policeDivisions}
                                                    /> */}
                      {/* <Select
                                                value={values.policeDivision}
                                                onChange={handleChange}
                                                inputProps={{
                                                    name: "policeDivision",
                                                    id: "policeDivision"
                                                }}>
                                                <MenuItem value="">
                                                    {" "}
                                                    <em>None</em>{" "}
                                                </MenuItem>
                                                {policeDivisions.allCodes.map((c, k) => {
                                                    let currPoliceDivision = policeDivisions.byCode[c];
                                                    return (
                                                        currPoliceDivision.name !== "NONE" && (
                                                            <MenuItem value={currPoliceDivision.code} key={k}>
                                                                {currPoliceDivision.name}
                                                            </MenuItem>
                                                        )
                                                    );
                                                })}
                                            </Select> */}
                      {/* </FormControl>
                                    </Grid> */}
                      {/* <Grid item xs={12} sm={4}>
                                        <FormControl className={classes.formControl}>
                                            <InputLabel htmlFor="policeStation">Police Station</InputLabel> */}
                      {/* <IntlSelect
                                                        value={values.policeStation}
                                                        handleChange={handleChange}
                                                        name='policeStation'
                                                        dataObj={policeStations}
                                                    /> */}
                      {/* <Select
                                                value={values.policeStation}
                                                onChange={handleChange}
                                                inputProps={{
                                                    name: "policeStation",
                                                    id: "policeStation"
                                                }}>
                                                <MenuItem value="">
                                                    {" "}
                                                    <em>None</em>{" "}
                                                </MenuItem>
                                                {policeStations.allCodes.map((c, k) => {
                                                    let currPoliceStation = policeStations.byCode[c];
                                                    return (
                                                        currPoliceStation.name !== "NONE" && (
                                                            <MenuItem value={currPoliceStation.code} key={k}>
                                                                {currPoliceStation.name}
                                                            </MenuItem>
                                                        )
                                                    );
                                                })}
                                            </Select> */}
                      {/* </FormControl>
                                    </Grid> */}
                    {/* </Grid>
                  </Paper> */}
                  {/* police details */}
                  <div>
                    {/* <ExpansionPanel>
                                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="h5" gutterBottom>
                                            {" "}
                                            Police Related Information{" "}
                                        </Typography>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails>
                                        <Grid container spacing={24}>
                                            <Grid item xs={12}>
                                                <MaterialTable
                                                    columns={[
                                                        { title: "Name", field: "name" },
                                                        { title: "Address", field: "address" },
                                                        {
                                                            title: "Political Affiliation",
                                                            field: "political_affliation",
                                                            // lookup: politicalPartyLookup
                                                        }
                                                    ]}
                                                    data={values.injuredParties}
                                                    title="Injured Parties"
                                                    editable={{
                                                        onRowAdd: (newData) =>
                                                            tableRowAdd(
                                                                setFieldValue,
                                                                "injuredParties",
                                                                values.injuredParties,
                                                                newData
                                                            ),
                                                        onRowUpdate: (newData, oldData) =>
                                                            tableRowUpdate(
                                                                setFieldValue,
                                                                "injuredParties",
                                                                values.injuredParties,
                                                                oldData,
                                                                newData
                                                            ),
                                                        onRowDelete: (oldData) =>
                                                            tableRowDelete(
                                                                setFieldValue,
                                                                "injuredParties",
                                                                values.injuredParties,
                                                                oldData
                                                            )
                                                    }}
                                                    options={{
                                                        search: false,
                                                        paging: false
                                                    }}
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <MaterialTable
                                                    columns={[
                                                        { title: "Name", field: "name" },
                                                        { title: "Address", field: "address" },
                                                        {
                                                            title: "Political Affiliation",
                                                            field: "political_affliation",
                                                            // lookup: politicalPartyLookup
                                                        }
                                                    ]}
                                                    data={values.respondents}
                                                    title="Respondents"
                                                    editable={{
                                                        onRowAdd: (newData) =>
                                                            tableRowAdd(
                                                                setFieldValue,
                                                                "respondents",
                                                                values.respondents,
                                                                newData
                                                            ),
                                                        onRowUpdate: (newData, oldData) =>
                                                            tableRowUpdate(
                                                                setFieldValue,
                                                                "respondents",
                                                                values.respondents,
                                                                oldData,
                                                                newData
                                                            ),
                                                        onRowDelete: (oldData) =>
                                                            tableRowDelete(
                                                                setFieldValue,
                                                                "respondents",
                                                                values.respondents,
                                                                oldData
                                                            )
                                                    }}
                                                    options={{
                                                        search: false,
                                                        paging: false
                                                    }}
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <MaterialTable
                                                    columns={[
                                                        { title: "Vehicle License Plate", field: "vehicle_no" },
                                                        {
                                                            title: "Vehicle Ownership",
                                                            field: "ownership",
                                                            lookup: {
                                                                government: "Government Vehicle",
                                                                private: "Private Vehicle"
                                                            }
                                                        }
                                                    ]}
                                                    data={values.detainedVehicles}
                                                    title="Detained Vehicles"
                                                    editable={{
                                                        onRowAdd: (newData) =>
                                                            tableRowAdd(
                                                                setFieldValue,
                                                                "detainedVehicles",
                                                                values.detainedVehicles,
                                                                newData
                                                            ),
                                                        onRowUpdate: (newData, oldData) =>
                                                            tableRowUpdate(
                                                                setFieldValue,
                                                                "detainedVehicles",
                                                                values.detainedVehicles,
                                                                oldData,
                                                                newData
                                                            ),
                                                        onRowDelete: (oldData) =>
                                                            tableRowDelete(
                                                                setFieldValue,
                                                                "detainedVehicles",
                                                                values.detainedVehicles,
                                                                oldData
                                                            )
                                                    }}
                                                    options={{
                                                        search: false,
                                                        paging: false
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </ExpansionPanelDetails>
                                </ExpansionPanel> */}
                  </div>
                </>
              )}

              {/* action panel */}
              <Grid container spacing={24}>
                <Grid item xs={12} style={{ textAlign: "center" }}>
                  <Button variant="contained" className={classes.button}>
                    {" "}
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={fileError}
                    className={classes.button}
                  >
                    {" "}
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </form>
          );
        }}
      />

      {/* success notification */}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={state.submitSuccessMessage}
        ContentProps={{
          "aria-describedby": "message-id",
        }}
        message={<span id="message-id">{f({ id: "request.management.incident.create.success.message", defaultMessage: "Request submitted successfully!" })}</span>}
      />

      {/* confirmation dialog */}
      <Dialog
        open={state.showConfirmationModal}
        onClose={() => hideConfirmModal(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {f({ id: "request.management.incident.create.alert.title", defaultMessage: "Submit without Request date?" })}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          {f({ id: "request.management.incident.create.alert.text", defaultMessage: "You are trying to submit without a request date pls." })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => hideConfirmModal(false)} color="primary">
            Back
          </Button>
          <Button
            disabled={isProcessing}
            onClick={() => hideConfirmModal(true)}
            color="primary"
            autoFocus
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default withRouter(withStyles(styles)(IncidentFormInternal));
