import React, { useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Logo from "../../app/Logo";
import Grid from "@material-ui/core/Grid";
import { useDispatch } from "react-redux";
import { FormattedMessage } from "react-intl";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FolderIcon from '@material-ui/icons/OpenInNewRounded';
import { Link } from "react-router-dom";
import { changeLanguage } from "../../shared/state/sharedActions";
import "../../app/Logo/BgImg.css";
import Home from "./Home";
import Think from "../../static/img/think.png";
import Check from "../../static/img/check.png";
import houseV2 from "../../static/img/houseV2.jpg";
import Pst from "../../static/img/pst.png";
import "../../app/Logo/Logo.css";

const styles = theme => ({
  root: {
    margin: 0
  },
  button: {
    margin: theme.spacing.unit
  },
  cardContent: {
    // minHeight: 80,
    height:'97px',
    width:'333px'
  },
  card: {
    // height:'129px',
    // width:'350px',
    minHeight: 100,
    zIndex:100,
    margin:5,
    // marginTop:0,
    background:'#6f0509',
    borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  borderTopRightRadius: 10,
  borderTopLeftRadius: 10,
  overflow: 'hidden',
  },
  card2: {
    // height:'129px',
    // width:'350px',
    minHeight: 100,
    zIndex:100,
    margin:5,
    // marginTop:0,
    background:'#e4a100',
    borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  borderTopRightRadius: 10,
  borderTopLeftRadius: 10,
  overflow: 'hidden',
  },
  icon: {
    marginTop: 30,
    fontSize: 40
  },
  cardText: {
    textAlign: "center",
    color:'#ffffff',
    fontSize: '25px',
    lineHeight: '25pt',
    fontFamily: '"oxygen", Noto Sans Sinhala, Noto Sans Tamil,Raleway,Verdana,Arial'
  },
  cardText2: {
    textAlign: "center",
    color:'#000000',
    fontSize: '25px',
    lineHeight: '25pt',
    fontFamily: '"oxygen", Noto Sans Sinhala, Noto Sans Tamil,Raleway,Verdana,Arial'
  },
  bottomText: {
    textAlign: "center"
  },
  hide: {
    display: "none",
  },
  media: {
    height: 140,
  },
  links: {
    lineHeight: '1.42857143',
    backgroundColor: 'transparent',
    fontFamily: '"oxygen", Noto Sans Sinhala, Noto Sans Tamil,Raleway,Verdana,Arial',
    color: '#7e8c92',
    fontSize: '12px',
    // marginLeft: '2px',
    textDecoration: 'none !important',
    margin: 0,
    padding: '0.1em'
  },
  copyright: {
    backgroundColor: 'transparent',
    fontFamily: '"oxygen", Noto Sans Sinhala, Noto Sans Tamil,Raleway,Verdana,Arial',
    color: '#7e8c92',
    fontSize: '18px',
    textDecoration: 'none !important',
    textAlign:'center'
  },
  contact: {
    lineHeight: '1.42857143',
    backgroundColor: 'transparent',
    fontFamily: '"oxygen", Noto Sans Sinhala, Noto Sans Tamil,Raleway,Verdana,Arial',
    color: '#7e8c92',
    fontSize: '12px',
    textAlign:'right',
    textDecoration: 'none !important',
    margin: 0,
    padding: '0.1em'
  },
  
});

function HomePage(props) {
  const { classes } = props;
  const dispatch = useDispatch();

  return (
      <div className={classes.root}>      
      <Grid container spacing={2}>
        <Grid item xs={6} sm={4}>
          <Grid item xs={12} sm={12}>
            <Logo />
          </Grid>
        </Grid>
        <Grid  item xs={6} sm={4}>
          {/* <Grid className="house-container" item xs={12} sm={12}>
              <img
              src={houseV2}
              alt="logo"
            />
          </Grid> */}
        </Grid>
        <Grid item xs={12} sm={4}>
          <div style={{ textAlign: "right" }}>
            <Button
              variant="outlined"
              style={{width:'88px'}}
              color="primary"
              onClick={() => dispatch(changeLanguage("si"))}
              className={classes.button}
            >
              {" "}
              සිංහල{" "}
            </Button>
            <Button
              variant="outlined"
              style={{width:'88px'}}
              color="primary"
              onClick={() => dispatch(changeLanguage("ta"))}
              className={classes.button}
            >
              {" "}
              தமிழ்{" "}
            </Button>
            <Button
              variant="outlined"
              style={{width:'88px'}}
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
      <Home/>

      <Grid
        container
        spacing={24}
        justify="center"
        // style={{ minHeight: "35vh" }}
      >
        <Grid style = {{minWidth: "29%"}} item xs={12} sm={6} md={3} >
          <Card className={classes.card}>
            <Link to="/report">
              <CardActionArea>
                <CardContent className={classes.cardContent}>
                <Grid direction="raw" container spacing={1}>
                  <Grid item xs={4}>
                  <img
                    src={Think}
                    alt="logo"
                    style={{
                      float: 'left',
                      marginLeft: '15px',
                      marginRight: '20px',
                      width: '72%'
                    }}
                  />
                </Grid>
                  <Grid item xs={8}>
                  <Typography
                    gutterBottom
                    variant="h4"
                    component="h2"
                    className={classes.cardText}
                    color="primary"
                  >
                    <FormattedMessage
                      id="request.management.report.incidents"
                      defaultMessage={"Submit a Request or Grievance"}
                    />
                  </Typography>
                </Grid>
               </Grid>
                
                  
                  
                </CardContent>
              </CardActionArea>
            </Link>
          </Card>
        </Grid>
        <Grid style = {{minWidth: "29%"}} item xs={12} sm={6} md={3}>
          <Card className={classes.card2}>
            <Link to="/report/status">
              <CardActionArea>
                <CardContent className={classes.cardContent}>
                <Grid direction="raw" container spacing={1}>
                  <Grid item xs={2} lg={2}>
                  <img
                    src={Check}
                    alt="logo"
                    style={{
                      // maxWidth: '52%',
                      float: 'left',
                      marginLeft: '15px',
                      marginRight: '20px',
                      width: '82%'
                    }}
                  />
                </Grid>
                  <Grid item xs={10} lg={10}>
                  <Typography
                    gutterBottom
                    variant="h4"
                    component="h2"
                    className={classes.cardText2}
                    color="primary"
                  >
                    <FormattedMessage
                      id="request.management.check.incident.status"
                      defaultMessage={"Check Current Status of a Request or Grievance"}
                    />
                  </Typography>
                </Grid>
               </Grid>
                </CardContent>
              </CardActionArea>
            </Link>
          </Card>
        </Grid>
      </Grid>
      <Grid
      container
      spacing={24}
      alignItems="flex-start"
      
      
      style={{ minHeight: "40vh",background:'#00000' }}
    >
      <Grid justify="flex-start" item xs={12}>
        <Typography
          variant="h5"
          component="h5"
          className={classes.bottomText}
          color="primary"
        >
           <FormattedMessage
            id="request.management.home.registered_user"
            defaultMessage={"Registered user"}
          />  -
          <Button color="primary" className={classes.button} href="/signin">
          <FormattedMessage
            id="request.management.home.signin"
            defaultMessage={"Sign In"}
          />
          </Button>
        </Typography>
      </Grid>
    </Grid>
    <Grid
      container
      spacing={24}
      // alignItems="center"
      justify="space-between"
      
      style={{ minHeight: "45vh",background:'#ebf2f0' }}
    >
        <Grid style={{ color: '#FF0000',paddingLeft: '100px' }} item xs={12} sm={12} md={6} >
            <List disablePadding={true} dense={true}>
                <ListItem  className={classes.links}>
                  <ListItemIcon>
                    <FolderIcon />
                  </ListItemIcon>
                  <span><a className={classes.links} href="http://www.presidentsoffice.gov.lk/" target="_blank">Presidential Secretariat</a></span>
                </ListItem>
            </List>
            <List disablePadding={true}>
                <ListItem  className={classes.links}>
                  <ListItemIcon>
                    <FolderIcon />
                  </ListItemIcon>
                  <span><a className={classes.links} href="http://www.cabinetoffice.gov.lk/" target="_blank">Cabinet of Minsters</a></span>
                </ListItem>
            </List>
            <List disablePadding={true}>
                <ListItem  className={classes.links}>
                  <ListItemIcon>
                    <FolderIcon />
                  </ListItemIcon>
                  <span><a className={classes.links} href="https://www.gov.lk/welcome.html" target="_blank">Government of Sri Lanka [GOV.LK]</a></span>
                </ListItem>
            </List>
            <List disablePadding={true}>
                <ListItem  className={classes.links}>
                  <ListItemIcon>
                    <FolderIcon />
                  </ListItemIcon>
                  <span><a className={classes.links} href="http://www.pmdnews.lk/" target="_blank">Policy Research &amp; Information Unit [PMDNEWS]</a></span>
                </ListItem>
            </List>
            <List disablePadding={true}>
                <ListItem  className={classes.links}>
                  <ListItemIcon>
                    <FolderIcon />
                  </ListItemIcon>
                  <span><a className={classes.links} href="http://www.defence.lk/english.asp" target="_blank">Ministry of Defence</a></span>
                </ListItem>
            </List>
            <List disablePadding={true}>
                <ListItem  className={classes.links}>
                  <ListItemIcon>
                    <FolderIcon />
                  </ListItemIcon>
                  <span><a className={classes.links} href="https://www.news.lk/" target="_blank">Government News Portal [NEWS.LK]</a></span>
                </ListItem>
            </List>
            <List disablePadding={true}>
                <ListItem  className={classes.links}>
                  <ListItemIcon>
                    <FolderIcon />
                  </ListItemIcon>
                  <span><a className={classes.links} href="http://www.presidentsfund.gov.lk/" target="_blank">President's Fund</a></span>
                </ListItem>
            </List>
        </Grid>
        <Grid  style={{ background:'#fffff' }}  item xs={12} sm={12} md={3}>
        <Grid className="house-container" item xs={12} sm={12}>
              <img
              src={Pst}
              alt="logo"
            />
            <List disablePadding={true}>
                <ListItem  className={classes.contact}>
                <ListItemText
                    // primary="Single-line item"
                    secondary='Presidential Secretariat'
                  />
                </ListItem>
            </List>
            <List disablePadding={true}>
                <ListItem  className={classes.contact}>
                <ListItemText
                    // primary="Single-line item"
                    secondary='Galle Face, Colombo 1, Sri Lanka'
                  />
                </ListItem>
            </List>
            <List disablePadding={true}>
                <ListItem  className={classes.contact}>
                <ListItemText
                    // primary="Single-line item"
                    secondary='Tel (+94) 11 2354354 | Fax (+94) 11 2340340'
                  />
                </ListItem>
            </List>
          </Grid>
        </Grid>
    </Grid>
    <Grid
      container
      spacing={24}
      alignItems="center"
      
      
      style={{ minHeight: "10vh",background:'#000' }}
    >
      <Grid justify="flex-start" item xs={12}>
        <Typography
          variant="h5"
          component="h5"
          className={classes.bottomText}
          className={classes.copyright}
        >
             Copyright tell.president.gov.lk © 2020
        </Typography>
      </Grid>
    </Grid>
     
      </div>
  );
}

HomePage.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HomePage);