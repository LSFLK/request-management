import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Websocket from "react-websocket";
import IdleTimer from "react-idle-timer";

import { compose } from "redux";
import { connect } from "react-redux";
import { Button } from "@material-ui/core";
import { Link, withRouter } from "react-router-dom";
import * as localStorage from "../utils/localStorage";

import AccountCircle from "@material-ui/icons/AccountCircle";
import ActiveNotificationIcon from "@material-ui/icons/NotificationsActive";
// import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import IconButton from "@material-ui/core/IconButton";
import NotificationsIcon from "@material-ui/icons/Notifications";
import Badge from "@material-ui/core/Badge";


import {
  fetchSignInRefreshToken,
  initiateSignOut,
  fetchChannels,
  fetchElections,
  fetchCategories,
  fetchInstitutions,
  fetchProvinces,
  fetchDistricts,
  fetchDivisionalSecretariats,
  fetchGramaNiladharis,
  fetchPollingDivisions,
  fetchPollingStations,
  fetchPoliceStations,
  fetchPoliceDivisions,
  fetchWards,
  getCannedResponses,
  changeLanguage
} from "../shared/state/sharedActions";
import { loadUsers } from "../user/state/userActions";
import { showModal, hideModal } from "../modals/state/modal.actions";

import RootModal from "../modals/components/RootModal";

import Breadcrumbs from "./Breadcrumbs";
import { API_BASE_URL } from "../config";

import { userCan, USER_ACTIONS } from "../user/userUtils";

import * as notificationsAPI from "../api/notifications";
import { WEB_SOCKET_BASE_URL } from "../config";

const HomeLink = (props) => <Link to="/app/home" {...props} />;
const ReportLink = (props) => <Link to="/app/create" {...props} />;
const ReviewComplaintsLink = (props) => <Link to="/app/review" {...props} />;
const StaticReportLink = (props) => <Link to="/app/reports" {...props} />;
const ArchiveLink = (props) => <Link to="/app/archive" {...props} />;

const drawerWidth = 240;

const styles = (theme) => ({
  root: {
    // display: 'flex',
    flexGrow: 1,
  },
  homeButton: {
    marginLeft: theme.spacing.unit * 4,
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
  reviewMenu: {
    li: {
      paddingTop: 8,
      paddingBottom: 8,
    },
    boxShadow: "none",
  },
  content: {
    flexGrow: 1,
    paddingTop: theme.spacing.unit * 3,
    paddingLeft: theme.spacing.unit * 8,
    paddingRight: theme.spacing.unit * 8,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginTop: theme.spacing.unit * 1,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  grow: {
    flexGrow: 1,
  },
  breadCrumbWrapper: {
    marginBottom: theme.spacing.unit * 4,
  },
});

class DomainContainer extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      open: true,
      anchorEl: null,
      anchorLang: null,
      menuAnchorEl: null,
      authToken: null,
      anchorNotification: null,
      notifications: [],
      unreadNotificationCount: 0,

      timeout: 1000 * 60 * 15,
      isTimedOut: false,
    };

    this.idleTimer = null
    this.onAction = this._onAction.bind(this)
    this.onActive = this._onActive.bind(this)
    this.onIdle = this._onIdle.bind(this)
  }


  /**
   * user idle actions
   */

  _onAction(e) {
    // console.log("user did something", e);
    this.setState({ isTimedOut: false });
  }

  _onActive(e) {
    // console.log("user is active", e);
    this.setState({ isTimedOut: false });
  }

  _onIdle(e) {
    // console.log("user is idle", e);
    const isTimedOut = this.state.isTimedOut;
    if (isTimedOut) {
      this.props.hideIdleTimeOutModal();
      this.handleSignOut();
    } else {
      this.props.showIdleTimeOutModal()
      this.idleTimer.reset();
      this.setState({ isTimedOut: true });
    }
  }

  refreshTokenScheduler = (signInData) => {
    if(!this.state.isTimedOut && signInData){
      this.props.refreshToken()
    }
  }


  componentDidMount() {
    this.props.getChannels();
    this.props.getElections();
    this.props.getCategories();
    this.props.getInstitutions();
    this.props.getProvinces();
    this.props.getDistricts();
    this.props.getDivisionalSecretariats();
    this.props.getGramaNiladharis();
    this.props.getPollingDivisions();
    this.props.getPollingStations();
    this.props.getPoliceStations();
    this.props.getPoliceDivisions();
    this.props.getWards();
    this.props.loadAllUsers();
    this.props.loadCannedResponses();
    const signInData = localStorage.read("RequestManagementUser");
    signInData && this.setState({ authToken: signInData.token });
    this.loadNotifications();

    // following is only neccessary when you have to periodically get new tokens
    this.interval = setInterval(() => this.refreshTokenScheduler(signInData), 1000 * 60 * 15);
  }

  loadNotifications = async () => {
    const notificationResponse = await notificationsAPI.getNotifications();
    let unread = 0;
    let notifs = notificationResponse.data;
    for (let i = 0; i < notifs.length; i++) {
      if (!notifs[i].is_read) {
        unread++;
      }
    }
    this.setState({ notifications: notifs, unreadNotificationCount: unread });
  };

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  handleLangMenu = (event) => {
    this.setState({ anchorLang: event.currentTarget });
  };

  handleLangMenuClose = () => {
    this.setState({ anchorLang: null });
  };

  handleMenu = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuClose = () => {
    this.setState({ anchorEl: null });
  };

  handleNotificationList = (event) => {
    this.setState({ anchorNotification: event.currentTarget });
  };

  handleNotificationListClose = () => {
    this.setState({ anchorNotification: null });
  };

  handleSignOut = () => {
    const { signOut } = this.props;
    signOut();
  };

  handleLanguageChange = (lang) => {
    const { changeLanguage } = this.props;
    changeLanguage(lang);
  };

  handlePasswordChange = () => {
    window.open(API_BASE_URL + "/admin/password_change/", "_blank");
  };

  handleOnClickReviewMenuOpenButton = (e) => {
    this.setState({ menuAnchorEl: e.currentTarget });
  };

  handleReviewMenuClose = () => {
    this.setState({ menuAnchorEl: null });
  };

  handleOnClickReviewMenuItem = (e) => {
    this.setState({ menuAnchorEl: null });
  };

  handleSokcetData(data) {
    let result = JSON.parse(data);
    let notificationUpdate = this.state.notifications.slice();
    notificationUpdate.unshift(result.payload);
    this.setState({
      notifications: notificationUpdate,
      unreadNotificationCount: this.state.unreadNotificationCount + 1,
    });
  }

  getNotifiactionText(notification) {
    if (notification.custom_messsage) {
      return notification.custom_messsage;
    } else {
      switch (notification.notification_type) {
        case "INCIDENT_ASSIGNED":
          return "Issue Assigned";
        case "INCIDENT_CLOSED":
          return "Issue Closed";
        default:
          return "notification";
      }
    }
  }

  handleNotificationClick(notification) {
    if (!notification.is_read) {
      this.setState({
        unreadNotificationCount: this.state.unreadNotificationCount - 1,
      });
      this.handleNotificationListClose();
      try {
        notificationsAPI.markAsRead(notification.id);
      } catch (e) {
        console.log(e);
      }
    }
    window.location = `/app/review/${notification.incident}`;
  }

  render() {
    const { classes, selectedLanguage, signedInUser, location } = this.props;
    const {
      open,
      anchorEl,
      anchorLang,
      anchorNotification,
      authToken,
      notifications,
    } = this.state;
    const menuOpen = Boolean(anchorEl);
    const langMenuOpen = Boolean(anchorLang);
    const notificationsOpen = Boolean(anchorNotification);

    const selectedMainSection = location.pathname.split("/")[2];

    return (
      <div className={classes.root}>
        <IdleTimer
            ref={ref => { this.idleTimer = ref }}
            element={document}
            onActive={this.onActive}
            onIdle={this.onIdle}
            onAction={this.onAction}
            debounce={250}
            timeout={this.state.timeout} />
        {authToken && (
          <Websocket
            url={`${WEB_SOCKET_BASE_URL}/ws/notifications?token=${authToken}`}
            onMessage={this.handleSokcetData.bind(this)}
          />
        )}
        <CssBaseline />
        <AppBar position="static">
          <Toolbar disableGutters={!open}>
            <Typography variant="h6" color="inherit" className={classes.grow}>
              Tell The President
              <Button
                variant={selectedMainSection === "home" ? "outlined" : "text"}
                color="inherit"
                component={HomeLink}
                className={classes.homeButton}
              >
                Home
              </Button>
              <Button
                variant={selectedMainSection === "create" ? "outlined" : "text"}
                color="inherit"
                component={ReportLink}
              >
                Create
              </Button>
              {userCan(
                signedInUser,
                null,
                USER_ACTIONS.CAN_REVIEW_INCIDENTS
              ) && (
                // <spanner>
                <Button
                  variant={
                    selectedMainSection === "review" ? "outlined" : "text"
                  }
                  component={ReviewComplaintsLink}
                  color="inherit"
                  aria-owns="review-menu"
                >
                  Review
                </Button>
                // </spanner>
              )}
              {userCan(signedInUser, null, USER_ACTIONS.CAN_VIEW_REPORTS) && (
                <Button
                  variant={
                    selectedMainSection === "reports" ? "outlined" : "text"
                  }
                  color="inherit"
                  component={StaticReportLink}
                >
                  Reports
                </Button>
              )}
              {userCan(
                signedInUser,
                null,
                USER_ACTIONS.CAN_REVIEW_INCIDENTS
              ) && (
                <Button
                  variant={
                    selectedMainSection === "archive" ? "outlined" : "text"
                  }
                  color="inherit"
                  component={ArchiveLink}
                >
                  Archive
                </Button>
              )}
            </Typography>

            <IconButton color="inherit" onClick={this.handleNotificationList}>
              <Badge
                badgeContent={this.state.unreadNotificationCount}
                color="secondary"
              >
                <NotificationsIcon style={{ color: "white" }} />
              </Badge>
            </IconButton>

            {/* <Button
              aria-owns={open ? "menu-appbar" : undefined}
              aria-haspopup="true"
              onClick={this.handleLangMenu}
              color="inherit"
            >
              {selectedLanguage}
            </Button> */}

            <Menu
              id="notifications-appbar"
              anchorEl={anchorNotification}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={notificationsOpen}
              onClose={this.handleNotificationListClose}
            >
              {notifications.map((notification, index) => {
                return (
                  <MenuItem
                    key={notification.id}
                    onClick={() => this.handleNotificationClick(notification)}
                  >
                    {this.getNotifiactionText(notification)}
                    {!notification.is_read && (
                      <ActiveNotificationIcon style={{ color: "red" }} />
                    )}
                  </MenuItem>
                );
              })}
            </Menu>

            <div style={{ textAlign: "right",marginLeft:5,marginRight:5 }}>
            <Button
              variant={selectedLanguage === "si" ? "outlined" : "text"}
              color="inherit"
              onClick={() => this.handleLanguageChange("si")}
              className={classes.button}
            >
              {" "}
              සිංහල{" "}
            </Button>
            <Button
              variant={selectedLanguage === "ta" ? "outlined" : "text"}              
              color="inherit"
              onClick={() => this.handleLanguageChange("ta")}
              className={classes.button}
            >
              {" "}
              தமிழ்{" "}
            </Button>
            <Button
              variant={selectedLanguage === "en" ? "outlined" : "text"}
              color="inherit"
              onClick={() => this.handleLanguageChange("en")}
              className={classes.button}
            >
              {" "}
              English{" "}
            </Button>
          </div>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={menuOpen}
              onClose={this.handleMenuClose}
            >
              <MenuItem>Profile</MenuItem>
              <MenuItem onClick={this.handlePasswordChange}>
                Change Password
              </MenuItem>
              <MenuItem onClick={this.handleSignOut}>Sign Out</MenuItem>
            </Menu>

            <Button
              aria-owns={open ? "menu-appbar" : undefined}
              aria-haspopup="true"
              color="inherit"
              onClick={this.handleMenu}
            >
              {signedInUser.displayname}
              <AccountCircle style={{ margin: 5 }} />
            </Button>
          </Toolbar>
        </AppBar>
        <main
          className={classNames(classes.content, {
            [classes.contentShift]: open,
          })}
        >
          <RootModal />

          <div className={classes.breadCrumbWrapper}>
            <Breadcrumbs pathname={location.pathname} />
          </div>

          {this.props.children}
        </main>
      </div>
    );
  }
}

DomainContainer.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    isSignedIn: state.shared.signedInUser.isSignedIn,
    selectedLanguage: state.shared.selectedLanguage,
    signedInUser: state.shared.signedInUser.data,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    signOut: () => {
      dispatch(initiateSignOut());
    },
    changeLanguage: (lang) => {
      dispatch(changeLanguage(lang));
    },
    showError: (error) => {
      dispatch({
        type: "SHOW_NOTIFICATION",
        error: {
          message: "Major error in data! Fallback",
        },
      });
    },

    getChannels: () => {
      dispatch(fetchChannels());
    },
    getElections: () => {
      dispatch(fetchElections());
    },
    getCategories: () => {
      dispatch(fetchCategories());
    },
    getInstitutions: () => {
      dispatch(fetchInstitutions());
    },
    getProvinces: () => {
      dispatch(fetchProvinces());
    },
    getDistricts: () => {
      dispatch(fetchDistricts());
    },
    getDivisionalSecretariats: () => {
      dispatch(fetchDivisionalSecretariats());
    },
    getGramaNiladharis: () => {
      dispatch(fetchGramaNiladharis());
    },
    getPollingDivisions: () => {
      dispatch(fetchPollingDivisions());
    },
    getPollingStations: () => {
      dispatch(fetchPollingStations());
    },
    getPoliceStations: () => {
      dispatch(fetchPoliceStations());
    },
    getPoliceDivisions: () => {
      dispatch(fetchPoliceDivisions());
    },
    getWards: () => {
      dispatch(fetchWards());
    },
    loadAllUsers: () => {
      dispatch(loadUsers());
    },
    loadCannedResponses: () => {
      dispatch(getCannedResponses());
    },
    showIdleTimeOutModal: () => {
      dispatch(showModal('IDLE_TIME_OUT_MODAL'))
    },
    hideIdleTimeOutModal: () => {
      dispatch(hideModal())
    },
    refreshToken: () => {
      dispatch(fetchSignInRefreshToken())
    }
  };
};

export default withRouter(
  compose(
    withStyles(styles, { withTheme: true }),
    connect(
      mapStateToProps,
      mapDispatchToProps
    )
  )(DomainContainer)
);
