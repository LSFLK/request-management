import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import ECLogo from "../../static/img/ps-logo.jpg";
import "./Logo.css";
// import {API_BASE_URL} from '../../config';

function Logo(props) {
  return (
    <div className="logo-container">
      <Link to="/">
        <img
          // src={props.image? API_BASE_URL+"/media/"+props.image:ECLogo}
          src={ECLogo}
          alt="logo"
          style={{
            maxWidth: props.maxWidth,
          }}
        />
      </Link>
    </div>
  );
}

Logo.propTypes = {
  maxWidth: PropTypes.string,
};

export default Logo;
