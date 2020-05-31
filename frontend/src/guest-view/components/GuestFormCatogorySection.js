import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormHelperText from '@material-ui/core/FormHelperText';
import { useIntl } from "react-intl";
import { useSelector, useDispatch } from 'react-redux';


const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing.unit * 2
  },
  paper: {
    height: 140,
    width: 100,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    flexWrap:'wrap'
  },
  paperSelected: {
    height: 140,
    width: 100,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    border:'thick double #32a1ce'
  },
  control: {
    padding: theme.spacing.unit * 2,
  },
  categoryText: {
    textAlign:'center'
  },
  formControl: {
    width: "100%",
  },
  langCats: {
    display: "flex",
    "& div": {
      padding: "0 3px",
    },
  },
});

const CatogorySection = (props) => {

  const { formatMessage: f } = useIntl();
  const { selectedLanguage } = useSelector((state) => (state.shared));

    const { 
        classes, 
        mainCategories, 
        subCategories,
        selectedCategory, 
        selectedMainCategory,
        setSelectedCategory,
        setSelectedMainCategory,
        formErrors } = props;

    let MainCategories = mainCategories || [];
    let SubCategories = subCategories || [];


    return (
      // <Grid container className={classes.root} spacing={16}>

      //   <Grid item xs={12}>
      //     <Grid container className={classes.demo} justify="left" spacing={16}>
      //       {fullCategories.map(value => (
      //         <Grid key={value} item>
      //           <Paper 
      //               className={ parseInt(selectedCategory)===value.id? classes.paperSelected : classes.paper} 
      //               onClick={()=>{setSelectedCategory(value.id)}}>
      //               <h5 className={classes.categoryText}>{value.sub_category}</h5>
      //               {/* <h5 className={classes.categoryText}>{value.sn_sub_category}</h5> */}
      //               {/* <h5 className={classes.categoryText}>{value.tm_sub_category}</h5> */}
                    
      //           </Paper>
      //         </Grid>
      //       ))}
            <Grid container className={classes.demo} justify="left" spacing={3}>
              <Grid item xs={12} >
            <FormControl
                      className={classes.formControl}
                      error={formErrors.incidentMainCategoryErrorMsg ? true : false}
                    >
                      <InputLabel htmlFor="category">{f({ id: "request.management.home.incidents.list.category", defaultMessage: "Category*" })}*</InputLabel>
                      <Select
                        value={selectedMainCategory}
                        onChange={e => {
                          setSelectedMainCategory(e.target.value);
                          formErrors.incidentMainCategoryErrorMsg = null;
                        }}
                        inputProps={{
                          name: "mainCategory",
                          id: "mainCategory",
                        }}
                      >
                        {
                        selectedLanguage == "en" ?
                        MainCategories.map((value,k) => (
                            <MenuItem value={value.top_category} key={k}>
                              <div className={classes.langCats}>
                                <div>{value.top_category}</div>
                              </div>
                            </MenuItem>
                          )) : selectedLanguage == "si" ?
                          MainCategories.map((value,k) => (
                            <MenuItem value={value.top_category} key={k}>
                              <div className={classes.langCats}>
                                <div>{value.sn_top_category}</div>
                              </div>
                            </MenuItem>
                          )) : 
                          MainCategories.map((value,k) => (
                            <MenuItem value={value.top_category} key={k}>
                              <div className={classes.langCats}>
                                <div>{value.tm_top_category}</div>
                              </div>
                            </MenuItem>
                          ))
                        }
                        
                      </Select>
                      <FormHelperText>{formErrors.incidentMainCategoryErrorMsg || ""}</FormHelperText>
                    </FormControl>
                    </Grid>
                    <Grid item xs={12}>
            <FormControl
                      className={classes.formControl}
                      error={formErrors.incidentSubCategoryErrorMsg ? true : false}
                    >
                      <InputLabel htmlFor="category">{f({ id: "request.management.home.incidents.list.subcategory", defaultMessage: "Sub Category*" })}*</InputLabel>
                      <Select
                        value={selectedCategory}
                        onChange={e => {
                          setSelectedCategory(e.target.value);
                          formErrors.incidentSubCategoryErrorMsg = null;
                        }}
                        inputProps={{
                          name: "subCategory",
                          id: "subCategory",
                        }}
                      >
                        {
                          selectedLanguage=="en" ? 
                          SubCategories.map((value,k) => (
                            <MenuItem value={value.id} key={k}>
                              <div className={classes.langCats}>
                                <div>{value.sub_category}</div>
                              </div>
                            </MenuItem>
                          )) : selectedLanguage=="si" ?
                          SubCategories.map((value,k) => (
                            <MenuItem value={value.id} key={k}>
                              <div className={classes.langCats}>
                                <div> {value.sn_sub_category}</div>
                              </div>
                            </MenuItem>
                          )) : selectedLanguage=="ta" ?
                          SubCategories.map((value,k) => (
                            <MenuItem value={value.id} key={k}>
                              <div className={classes.langCats}>
                                <div> {value.tm_sub_category}</div>
                              </div>
                            </MenuItem>
                          )) : ''
                        }
                        
                      </Select>
                      <FormHelperText>{formErrors.incidentSubCategoryErrorMsg || ""}</FormHelperText>
                    </FormControl>
                    </Grid>
          </Grid>
    );

}

CatogorySection.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CatogorySection);
