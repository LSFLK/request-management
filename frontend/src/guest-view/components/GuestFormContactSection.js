import React from "react";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormLabel from "@material-ui/core/FormLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Typography from '@material-ui/core/Typography';
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";

const styles = (theme) => ({
  container: {
    display: "flex",
    flexGrow: 1,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  group: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    marginTop: theme.spacing.unit*3,
    width:"100%"
  },
});

const IncidentContact = (props) => {
  const { formatMessage: f } = useIntl();

  const {
    classes,
    handleContactDetailsChange,
    handledLocationChange,
    handleAddressChange,
    handleDistrictChange,
    handleCityChange,

    //recipient change fn
    handleRecipientLocationChange,
    handleRecipientDistrictChange,
    handleRecipientCityChange,
    handleRecipientAddressChange,
    handleShowRecipientChange,
    contactDetials,
    formErrors,
    location,
    address,
    district,
    districts,
    city,
    showRecipient,
    recipientAddress,
    recipientDistrict,
    recipientCity,
    recipientLocation
  } = props;

  const handlePhoneNumberInput = (update, newValue) => {
    if (!isNaN(newValue) && newValue.length < 11) {
      handleContactDetailsChange(update);
    }
  };

  return (
    <form className={classes.container} noValidate autoComplete="off">
        <Grid container>
      <Grid container>
        <Grid item xs={8}>
          <TextField
            id="contactName"
            label={f({
              id: "request.management.report.incidents.contact.name",
              defaultMessage: "Name",
            })}
            autoFocus
            multiline
            fullWidth
            rowsMax="4"
            value={contactDetials.name}
            // onChange={(e) => { handleContactDetailsChange({...contactDetials, name:e.target.value}) }}
            onChange={(e) => {
              handleContactDetailsChange({
                ...contactDetials,
                name: e.target.value,
              });
              formErrors.incidentNameErrorMsg = null;
            }}
            className={classes.textField}
            margin="normal"
            helperText={formErrors.incidentNameErrorMsg || ""}
            error={formErrors.incidentNameErrorMsg ? true : false}
          />
        </Grid>
        <Grid item xs={4} />
        <Grid item xs={8} >
        <FormControl className={classes.group}  error={formErrors.incidentReporterTypeErrorMsg && formErrors.incidentReporterTypeErrorMsg} >
                      <InputLabel htmlFor="reporterType">
                        Individual/Organization*
                      </InputLabel>
                      <Select
                        value={contactDetials.reporterType}
                        onChange={(e) => {
                          handleContactDetailsChange({
                            ...contactDetials,
                            reporterType: e.target.value,
                          });
                          formErrors.incidentReporterTypeErrorMsg = null;
                        }}
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
                            {formErrors.incidentReporterTypeErrorMsg && formErrors.incidentReporterTypeErrorMsg
                              ? formErrors.incidentReporterTypeErrorMsg
                              : ""}
                          </FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={4} />
        <Grid item xs={8}>
          <TextField
            id="contactMobile"
            label={f({
              id: "request.management.report.incidents.contact.mobile",
              defaultMessage: "Mobile",
            })}
            multiline
            fullWidth
            rowsMax="4"
            value={contactDetials.mobile}
            // onChange={(e) => { handleContactDetailsChange({ ...contactDetials, mobile:e.target.value}) }}
            onChange={(e) => {
              handlePhoneNumberInput(
                { ...contactDetials, mobile: e.target.value },
                e.target.value
              );
              formErrors.incidentContactErrorMsg = null;
            }}
            className={classes.textField}
            margin="normal"
            type="number"
            helperText={formErrors.incidentContactErrorMsg || ""}
            error={formErrors.incidentContactErrorMsg ? true : false}
          />
        </Grid>
        <Grid item xs={4} />

        <Grid item xs={8}>
          <TextField
            id="contactLandline"
            label={f({
              id: "request.management.report.incidents.contact.telephone",
              defaultMessage: "Landline",
            })}
            multiline
            fullWidth
            rowsMax="4"
            value={contactDetials.phone}
            onChange={(e) => {
              handlePhoneNumberInput(
                { ...contactDetials, phone: e.target.value },
                e.target.value
              );
            }}
            // onChange={(e) => { handlePhoneNumberInput({ ...contactDetials, phone:e.target.value}, e.target.value)}}
            className={classes.textField}
            margin="normal"
            type="number"
          />
        </Grid>
        <Grid item xs={4} />

        <Grid item xs={8}>
          <TextField
            id="contactEmail"
            label={f({
              id: "request.management.report.incidents.contact.email",
              defaultMessage: "Email",
            })}
            multiline
            fullWidth
            rowsMax="4"
            value={contactDetials.email}
            type="email"
            onChange={(e) => {
              handleContactDetailsChange({
                ...contactDetials,
                email: e.target.value,
              });
            }}
            className={classes.textField}
            margin="normal"
          />
        </Grid>
        <Grid item xs={4} />
        <Grid item xs={8}>
                    <TextField
                        autoFocus
                        id="incidentLocation"
                        label={f({ id: "request.management.incident.create.location.description", defaultMessage: "Location name or description" })}
                        multiline
                        fullWidth
                        rowsMax="5"
                        value={location}
                        onChange={(e) => { handledLocationChange(e.target.value) }}
                        className={classes.textField}
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={4} />
                <Grid item xs={8}>
                    <TextField
                        id="incidentAddress"
                        label={f({ id: "request.management.report.incidents.address", defaultMessage: "Address*" })}
                        multiline
                        fullWidth
                        rowsMax="5"
                        value={address}
                        // onChange={(e) => { handleAddressChange(e.target.value) }}
                        onChange={e => {
                            handleAddressChange(e.target.value);
                            formErrors.incidentAddressErrorMsg = null;
                          }}
                        className={classes.textField}
                        margin="normal"
                        helperText={formErrors.incidentAddressErrorMsg || ""}
                        error={formErrors.incidentAddressErrorMsg ? true : false}
                    />
                </Grid>
                <Grid item xs={4} />
                <Grid item xs={8}>
                    <TextField
                        id="incidentCity"
                        label={f({ id: "request.management.report.incidents.city", defaultMessage: "City" })}
                        fullWidth
                        value={city}
                        onChange={(e) => { handleCityChange(e.target.value);formErrors.incidentCityErrorMsg = null; }}
                        className={classes.textField}
                        margin="normal"
                        helperText={formErrors.incidentCityErrorMsg || ""}
                        error={formErrors.incidentCityErrorMsg ? true : false}
                    />
                </Grid>
                <Grid item xs={4} />
                <Grid item xs={8} >
                    <TextField
                        id="district"
                        select
                        label={f({
                            id: "request.management.report.incidents.district",
                            defaultMessage: f({ id: "request.management.incident.create.location.district", defaultMessage: "District" })
                        }) + "*"}
                        className={classes.textField}
                        value={district}
                        onChange={e => {
                            handleDistrictChange(e.target.value);
                            formErrors.incidentDistrictErrorMsg = null;
                        }}
                        margin="normal"
                        fullWidth
                        helperText={formErrors.incidentDistrictErrorMsg || ""}
                        error={formErrors.incidentDistrictErrorMsg ? true : false}
                    >
                        {districts.allCodes.map(code => (
                            <MenuItem key={code} value={code}>
                                {districts.byCode[code].name} | {districts.byCode[code].sn_name} | {districts.byCode[code].tm_name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={4} />
                <Grid item xs={12}>
                        <FormControl className={classes.group} error={formErrors.showRecipientErrorMsg ? true : false} component="fieldset">
                        <FormLabel component="legend">{f({ id: "request.management.incident.create.location.onbehalf", defaultMessage: "On behalf of someone else" })}</FormLabel>
                            <RadioGroup
                                aria-label="Gender"
                                name="showRecipient"
                                id="showRecipient"
                                // ref= {this.props.securityDepositeRpp}
                                // className={classes.group}
                                value={showRecipient}
                                onChange={(e) => { handleShowRecipientChange(e.target.value);formErrors.showRecipientErrorMsg = null; }}
                                // onClick={this.showAmountRpp.bind(this)}
                                row
                            >
                                <FormControlLabel
                                    control={
                                        <Radio />
                                    }
                                    value="YES"
                                    label={f({ id: "request.management.incident.create.location.onbehalf.yes", defaultMessage: "Yes" })}
                                />
                                <FormControlLabel
                                    control={
                                        <Radio />
                                    }
                                    label={f({ id: "request.management.incident.create.location.onbehalf.no", defaultMessage: "No" })}
                                    value="NO"
                                />
                            </RadioGroup>
                            <FormHelperText>{formErrors.showRecipientErrorMsg ? formErrors.showRecipientErrorMsg : null}</FormHelperText>
                        </FormControl>
                    </Grid>
                    {/* <Grid item xs={4} /> */}
      </Grid>
      {showRecipient==="YES" ? 
      <Grid container>
      
        <Grid item xs={8}>
        <Typography variant="h5" gutterBottom>
        {f({ id: "request.management.incident.create.recipient_information", defaultMessage: "Recipient Information" })}
        </Typography>
        <ul className={props.classes.list}>
        <li>{f({ id: "request.management.report.incidents.section.location.info", defaultMessage: "If the location where help is required differs from your address, please fill in this section w/ the location details." })}</li>
        </ul>
        </Grid>
        <Grid item xs={4} />
      <Grid item xs={8}>
          <TextField
            id="contactName"
            label={f({
              id: "request.management.incident.create.recipient.name",
              defaultMessage: "Name",
            })}
            autoFocus
            multiline
            fullWidth
            rowsMax="4"
            value={contactDetials.recipientName}
            // onChange={(e) => { handleContactDetailsChange({...contactDetials, name:e.target.value}) }}
            onChange={(e) => {
              handleContactDetailsChange({
                ...contactDetials,
                recipientName: e.target.value,
              });
              formErrors.recipientNameErrorMsg = null;
            }}
            className={classes.textField}
            margin="normal"
            helperText={formErrors.recipientNameErrorMsg || ""}
            error={formErrors.recipientNameErrorMsg ? true : false}
          />
        </Grid>
        <Grid item xs={4} />
        <Grid item xs={8} >
        <FormControl className={classes.group}  error={formErrors.incidentRecipientTypeErrorMsg && formErrors.incidentRecipientTypeErrorMsg} >
                      <InputLabel htmlFor="reporterType">
                        Individual/Organization*
                      </InputLabel>
                      <Select
                        value={contactDetials.recipientType}
                        onChange={(e) => {
                          handleContactDetailsChange({
                            ...contactDetials,
                            recipientType: e.target.value,
                          });
                          formErrors.incidentRecipientTypeErrorMsg = null;
                        }}
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
                            {formErrors.incidentRecipientTypeErrorMsg && formErrors.incidentRecipientTypeErrorMsg
                              ? formErrors.incidentRecipientTypeErrorMsg
                              : ""}
                          </FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={4} />
        <Grid item xs={8}>
          <TextField
            id="contactMobile"
            label={f({
              id: "request.management.report.incidents.contact.mobile",
              defaultMessage: "Mobile",
            })}
            multiline
            fullWidth
            rowsMax="4"
            value={contactDetials.recipientMobile}
            // onChange={(e) => { handleContactDetailsChange({ ...contactDetials, mobile:e.target.value}) }}
            onChange={(e) => {
              handlePhoneNumberInput(
                { ...contactDetials, recipientMobile: e.target.value },
                e.target.value
              );
              formErrors.recipientContactErrorMsg = null;
            }}
            className={classes.textField}
            margin="normal"
            type="number"
            helperText={formErrors.recipientContactErrorMsg || ""}
            error={formErrors.recipientContactErrorMsg ? true : false}
          />
        </Grid>
        <Grid item xs={4} />

        <Grid item xs={8}>
          <TextField
            id="contactLandline"
            label={f({
              id: "request.management.report.incidents.contact.telephone",
              defaultMessage: "Landline",
            })}
            multiline
            fullWidth
            rowsMax="4"
            value={contactDetials.recipientPhone}
            onChange={(e) => {
              handlePhoneNumberInput(
                { ...contactDetials, recipientPhone: e.target.value },
                e.target.value
              );
            }}
            // onChange={(e) => { handlePhoneNumberInput({ ...contactDetials, phone:e.target.value}, e.target.value)}}
            className={classes.textField}
            margin="normal"
            type="number"
          />
        </Grid>
        <Grid item xs={4} />

        <Grid item xs={8}>
          <TextField
            id="contactEmail"
            label={f({
              id: "request.management.report.incidents.contact.email",
              defaultMessage: "Email",
            })}
            multiline
            fullWidth
            rowsMax="4"
            value={contactDetials.recipientEmail}
            type="email"
            onChange={(e) => {
              handleContactDetailsChange({
                ...contactDetials,
                recipientEmail: e.target.value,
              });
            }}
            className={classes.textField}
            margin="normal"
          />
        </Grid>
        <Grid item xs={4} />
        <Grid item xs={8}>
                    <TextField
                        autoFocus
                        id="incidentLocation"
                        label={f({ id: "request.management.incident.create.location.description", defaultMessage: "Location name or description" })}
                        multiline
                        fullWidth
                        rowsMax="5"
                        value={recipientLocation}
                        onChange={(e) => { handleRecipientLocationChange(e.target.value) }}
                        className={classes.textField}
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={4} />
                <Grid item xs={8}>
                    <TextField
                        id="incidentAddress"
                        label={f({ id: "request.management.report.incidents.address", defaultMessage: "Address*" })}
                        multiline
                        fullWidth
                        rowsMax="5"
                        value={recipientAddress}
                        // onChange={(e) => { handleAddressChange(e.target.value) }}
                        onChange={e => {
                            handleRecipientAddressChange(e.target.value);
                            formErrors.recipientAddressErrorMsg = null;
                          }}
                        className={classes.textField}
                        margin="normal"
                        helperText={formErrors.recipientAddressErrorMsg || ""}
                        error={formErrors.recipientAddressErrorMsg ? true : false}
                    />
                </Grid>
                <Grid item xs={4} />
                <Grid item xs={8}>
                    <TextField
                        id="incidentCity"
                        label={f({ id: "request.management.report.incidents.city", defaultMessage: "City" })}
                        fullWidth
                        value={recipientCity}
                        onChange={(e) => { handleRecipientCityChange(e.target.value);formErrors.recipientCityErrorMsg = null; }}
                        className={classes.textField}
                        margin="normal"
                        helperText={formErrors.recipientCityErrorMsg || ""}
                        error={formErrors.recipientCityErrorMsg ? true : false}
                    />
                </Grid>
                <Grid item xs={4} />
                <Grid item xs={8} >
                    <TextField
                        id="district"
                        select
                        label={f({
                            id: "request.management.report.incidents.district",
                            defaultMessage: f({ id: "request.management.incident.create.location.district", defaultMessage: "District" })
                        }) + "*"}
                        className={classes.textField}
                        value={recipientDistrict}
                        onChange={e => {
                            handleRecipientDistrictChange(e.target.value);
                            formErrors.recipientDistrictErrorMsg = null;
                        }}
                        margin="normal"
                        fullWidth
                        helperText={formErrors.recipientDistrictErrorMsg || ""}
                        error={formErrors.recipientDistrictErrorMsg ? true : false}
                    >
                        {districts.allCodes.map(code => (
                            <MenuItem key={code} value={code}>
                                {districts.byCode[code].name} | {districts.byCode[code].sn_name} | {districts.byCode[code].tm_name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={4} />
      </Grid> : ''}
      </Grid>
    </form>
  );
};

IncidentContact.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(IncidentContact);
