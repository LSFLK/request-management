import { Formik, withFormik } from "formik";
import React, { useEffect, useState } from "react";

import Button from "@material-ui/core/Button";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Search from './search'
import SearchIcon from "@material-ui/icons/Search";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import CustomAutocompleteCategory from './AutocompleteCategory';
import CustomAutocompleteDistrict from './AutocompleteDistrict';
import CustomAutocompleteOrganization from './AutocompleteOrganization';

import moment from "moment";
import { useSelector } from 'react-redux'
import { withStyles } from "@material-ui/core/styles";
import { useIntl } from "react-intl";

const styles = theme => ({
  root: {
    width: "100%",
    overflowX: "auto"
  },
  table: {
    minWidth: 700
  },
  row: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.background.default
    },
    cursor: "pointer"
  },
  root: {
    width: "100%",
    marginTop: theme.spacing.unit * 3,
    overflowX: "auto"
  },
  table: {
    minWidth: 700
  },
  row: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.background.default
    },
    cursor: "pointer"
  },
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  formControl: {
    margin: theme.spacing.unit * 2,
    minWidth: 300
  },
  formControl2: {
    margin: theme.spacing.unit * 2,
    marginTop: 27,
    minWidth: 300
  },
  formControlSearch: {
    margin: theme.spacing.unit * 2,
    minWidth: 1200 + theme.spacing.unit * 12,

  },
  buttonContainer: {
    margin: theme.spacing.unit * 2,
    minWidth: 300,
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 1
  },
  datePicker: {},
  separator: {
    height: "10px"
  },
  searchButton: {
    margin: "14px 0px 17px 10px"
  }
});

function SearchForm(props) {
  const filterIncidents = values => {
    props.handleSearchClick(values);
  };

  useEffect(() => {
    filterIncidents(props.filters);
  }, []);
  const { classes, categories, listType } = props;
  // const severityValues = Array(10).fill(0).map((e, i) => i + 1);
  const severityValues = ['High','Medium','Low'];
  const institutions = useSelector(state => state.shared.institutions);
  const organizations = useSelector(state => state.user.organizations);
  const districts = useSelector(state => state.shared.districts);
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const {channels} = useSelector((state) => state.shared);
  const { formatMessage: f } = useIntl();
  
  let orgSearch = props.incidentType === 'INQUIRY' ?
      (<Search
          institutions={institutions}
          onChange={setSelectedInstitution}
      ></Search>) :
      (<Search
            districts={districts}
            onChange={setSelectedDistrict}
      ></Search>);
      const suggestionOrganizations = organizations.allIds.map((c, k) => {
        let currOrg = organizations.byIds[c];
        return (
          currOrg.name !== "NONE" && (
            {label: currOrg.name, value: currOrg.code }
          )
        );
      })
      const suggestionDistricts = districts.allCodes.map((c, k) => {
        let currDistrict = districts.byCode[c];
        return (
          currDistrict.name !== "NONE" && (
            {label: currDistrict.name, value: currDistrict.code }
          )
        );
      })
    const suggestions = categories.map((o) => ( {label: o.sub_category, value: o.id }) ); 

  return (
    <Formik
      initialValues={props.incidentSearchFilter}
      onSubmit={(values, { setSubmitting }) => {
        let preparedValues = {
          ...values,
          startTime: values.startTime ? moment(values.startTime).format("YYYY-MM-DD HH:mm") : null,
          endTime: values.endTime ? moment(values.endTime).format("YYYY-MM-DD HH:mm") : null
        };
        if (selectedInstitution) { preparedValues.institution = selectedInstitution }
        if (selectedDistrict) { preparedValues.district = selectedDistrict }
        // alert(JSON.stringify(preparedValues));
        filterIncidents(preparedValues);
      }}
      onReset={() => {
        this.filterIncidents();
      }}
    >
      {props => {
        const {
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          handleReset
        } = props;

        return (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={8}>
              <TextField
                id="outlined-full-width"
                label={f({id: "request.management.incident.review.text_search"})}
                style={{
                  margin: "15px 4px",
                  width: "calc(100% - 88px)"
                }}
                placeholder={f({id: "request.management.incident.review.search_placeholder"})}
                margin="normal"
                variant="outlined"
                name="textSearch"
                value={values.textSearch}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true
                }}
              />
              <Button
                variant="contained"
                type="submit"
                className={classes.searchButton}
              >
                <SearchIcon />
              </Button>
            </Grid>
            <ExpansionPanel>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>{f({id: "request.management.incident.review.advanced_search", defaultMessage: "Advanced Search"})}</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Grid container spacing={8}>
                  <Grid item xs={12}>
                  <FormControl className={classes.formControl}>
                      <InputLabel shrink htmlFor="status-label-placeholder">
                      {f({ id: "request.management.incident.create.location.language.search", defaultMessage: "Language" })}
                      </InputLabel>
                      <Select
                        input={
                          <Input name="status" id="status-label-placeholder" />
                        }
                        displayEmpty
                        name="language"
                        value={values.status}
                        onChange={handleChange}
                        className={classes.selectEmpty}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        <MenuItem value={"SINHALA"}>{f({ id: "request.management.incident.create.location.language.sinhala", defaultMessage: "Language" })}</MenuItem>
                        <MenuItem value={"TAMIL"}>{f({ id: "request.management.incident.create.location.language.tamil", defaultMessage: "Language" })}</MenuItem>
                        <MenuItem value={"ENGLISH"}>{f({ id: "request.management.incident.create.location.language.english", defaultMessage: "Language" })}</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl className={classes.formControl}>
                      <InputLabel shrink htmlFor="status-label-placeholder">
                      {f({ id: "request.management.home.incidents.list.status", defaultMessage: "Status" })}
                      </InputLabel>
                      <Select
                        input={
                          <Input name="status" id="status-label-placeholder" />
                        }
                        displayEmpty
                        name="status"
                        value={values.status}
                        onChange={handleChange}
                        className={classes.selectEmpty}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {listType == "review" && (<MenuItem value={"NEW"}>New/Unverified</MenuItem>)}
                        {listType == "review" && (<MenuItem value={"VERIFIED"}>Verified</MenuItem>)}
                        {listType == "review" && (<MenuItem value={"ACTION_PENDING"}>Action Pending</MenuItem>)}
                        {listType == "archive" && (<MenuItem value={"CLOSED"}>Closed</MenuItem>)}
                        {listType == "archive" && (<MenuItem value={"INVALIDATED"}>Invalidated</MenuItem>)}
                      </Select>
                    </FormControl>
                    <FormControl className={classes.formControl}>
                      <InputLabel shrink htmlFor="status-label-placeholder">
                      {f({id: "request.management.incident.review.priority", defaultMessage: "Priority"})}
                      </InputLabel>
                      <Select
                        input={
                          <Input
                            name="severity"
                            id="severity-label-placeholder"
                          />
                        }
                        displayEmpty
                        name="severity"
                        value={values.severity}
                        onChange={handleChange}
                        className={classes.selectEmpty}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {severityValues.map((val) => (
                          <MenuItem value={val} key={val}>{val}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl className={classes.formControl}>
                      <InputLabel shrink htmlFor="status-label-placeholder">
                      {f({id: "request.management.home.incidents.list.channel", defaultMessage: "Mode of Recipet"})}
                      </InputLabel>
                      <Select
                        input={
                          <Input
                            name="channel"
                            id="severity-label-placeholder"
                          />
                        }
                        displayEmpty
                        name="channel"
                        value={values.channel}
                        onChange={handleChange}
                        className={classes.selectEmpty}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {channels.map((val) => (
                          <MenuItem value={val.id} key={val.id}>{val.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl className={classes.formControl2}>
                    <CustomAutocompleteCategory suggestions={suggestions} value={values.category} handleChange={handleChange} categories={categories} />
                      {/* <InputLabel shrink htmlFor="status-label-placeholder">
                      {f({id: "request.management.incident.create.category", defaultMessage: "Category"})}
                      </InputLabel>
                      <Select
                        input={
                          <Input
                            name="category"
                            id="severity-label-placeholder"
                          />
                        }
                        displayEmpty
                        name="category"
                        value={values.category}
                        onChange={handleChange}
                        className={classes.selectEmpty}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {categories.map(({ sub_category,id }) => (
                          <MenuItem value={id}>
                            {sub_category}
                          </MenuItem>
                        ))}
                      </Select> */}
                    </FormControl>
                    <FormControl className={classes.formControl2}>
                     <CustomAutocompleteOrganization suggestions={suggestionOrganizations} value={values.organization} handleChange={handleChange} organizations={organizations} />
                      {/* <InputLabel shrink htmlFor="status-label-placeholder">
                      {f({id: "request.management.incident.create.organization", defaultMessage: "Organization"})}
                      </InputLabel>
                      <Select
                        input={
                          <Input
                            name="organization"
                            id="severity-label-placeholder"
                          />
                        }
                        displayEmpty
                        name="organization"
                        value={values.organization}
                        onChange={handleChange}
                        className={classes.selectEmpty}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {organizations.allIds.map((c, k) => {
                              let currentOrg = organizations.byIds[c];
                              return (
                                currentOrg.name !== "NONE" && (
                                  <MenuItem value={currentOrg.code} key={k}>
                                    {currentOrg.name}
                                  </MenuItem>
                                )
                              );
                            })}
                      </Select> */}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl className={classes.formControl}>
                      <TextField
                        id="start-time"
                        label={f({id: "request.management.incident.review.start_date", defaultMessage: "Start Date/Time"})}
                        name="startTime"
                        type="datetime-local"
                        value={values.startTime}
                        className={classes.textField}
                        InputLabelProps={{
                          shrink: true
                        }}
                        onChange={handleChange}
                      />
                    </FormControl>
                    <FormControl className={classes.formControl}>
                      <TextField
                        id="end-time"
                        label={f({id: "request.management.incident.review.end_date", defaultMessage: "End Date/Time"})}
                        name="endTime"
                        type="datetime-local"
                        value={values.endTime}
                        className={classes.textField}
                        InputLabelProps={{
                          shrink: true
                        }}
                        onChange={handleChange}
                      />
                    </FormControl>
                    <FormControl className={classes.formControl2}>
                    <CustomAutocompleteDistrict suggestions={suggestionDistricts} value={values.district} handleChange={handleChange} districts={districts} />
                      {/* <InputLabel shrink htmlFor="status-label-placeholder">
                      {f({id: "request.management.incident.create.location.district", defaultMessage: "District"})}
                      </InputLabel>
                      <Select
                        input={
                          <Input
                            name="district"
                            id="severity-label-placeholder"
                          />
                        }
                        displayEmpty
                        name="district"
                        value={values.district}
                        onChange={handleChange}
                        className={classes.selectEmpty}
                      >
                        <MenuItem value="">
                          <em>None</em>
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
                    </FormControl>
                    <FormControl className={classes.buttonContainer}>
                      {/* Reset workflow is pending
                       <Button
                        onClick={handleReset}
                        variant="contained"
                        size="large"
                        color="primary"
                      >
                        Reset
                      </Button> */}
                      <Button type="submit" variant="contained">
                        Search
                        <SearchIcon />
                      </Button>
                    </FormControl>
                  </Grid>
                </Grid>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </form>
        );
      }}
    </Formik>
  );
}

export default withStyles(styles)(SearchForm);
