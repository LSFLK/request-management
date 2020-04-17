/**
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import axios from "axios";
import { AUTHORIZATION_ENDPOINT, END_SESSION_ENDPOINT, ISSUER, JWKS_ENDPOINT, OP_CONFIG_INITIATED, REVOKE_TOKEN_ENDPOINT, TOKEN_ENDPOINT, USERNAME } from "../constants";
import { getSessionParameter, removeSessionParameter, setSessionParameter } from "./session";
/**
 * Checks whether openid configuration initiated.
 *
 * @returns {boolean}
 */
export const isOPConfigInitiated = () => {
    return getSessionParameter(OP_CONFIG_INITIATED) && getSessionParameter(OP_CONFIG_INITIATED) === "true";
};
/**
 * Set OAuth2 authorize endpoint.
 *
 * @param {string} authorizationEndpoint
 */
export const setAuthorizeEndpoint = (authorizationEndpoint) => {
    setSessionParameter(AUTHORIZATION_ENDPOINT, authorizationEndpoint);
};
/**
 * Set OAuth2 token endpoint.
 *
 * @param {string} tokenEndpoint
 */
export const setTokenEndpoint = (tokenEndpoint) => {
    setSessionParameter(TOKEN_ENDPOINT, tokenEndpoint);
};
/**
 * Set OIDC end session endpoint.
 *
 * @param {string} endSessionEndpoint
 */
export const setEndSessionEndpoint = (endSessionEndpoint) => {
    setSessionParameter(END_SESSION_ENDPOINT, endSessionEndpoint);
};
/**
 * Set JWKS URI.
 *
 * @param jwksEndpoint
 */
export const setJwksUri = (jwksEndpoint) => {
    setSessionParameter(JWKS_ENDPOINT, jwksEndpoint);
};
/**
 * Set OAuth2 revoke token endpoint.
 *
 * @param {string} revokeTokenEndpoint
 */
export const setRevokeTokenEndpoint = (revokeTokenEndpoint) => {
    setSessionParameter(REVOKE_TOKEN_ENDPOINT, revokeTokenEndpoint);
};
/**
 * Set openid configuration initiated.
 */
export const setOPConfigInitiated = () => {
    setSessionParameter(OP_CONFIG_INITIATED, "true");
};
/**
 * Set id_token issuer.
 *
 * @param issuer id_token issuer.
 */
export const setIssuer = (issuer) => {
    setSessionParameter(ISSUER, issuer);
};
/**
 * Initialize openid provider configuration.
 *
 * @param {string} wellKnownEndpoint openid provider configuration.
 * @param {boolean} forceInit whether to initialize the configuration again.
 * @returns {Promise<any>} promise.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const initOPConfiguration = (wellKnownEndpoint, forceInit) => {
    if (!forceInit && isOPConfigInitiated()) {
        Promise.resolve("success");
    }
    if (!wellKnownEndpoint || wellKnownEndpoint.trim().length === 0) {
        return Promise.reject(new Error("OpenID provider configuration endpoint is not defined."));
    }
    return axios.get(wellKnownEndpoint)
        .then((response) => {
        if (response.status !== 200) {
            return Promise.reject(new Error("Failed to load OpenID provider configuration from: "
                + wellKnownEndpoint));
        }
        setAuthorizeEndpoint(response.data.authorization_endpoint);
        setTokenEndpoint(response.data.token_endpoint);
        setEndSessionEndpoint(response.data.end_session_endpoint);
        setJwksUri(response.data.jwks_uri);
        setRevokeTokenEndpoint(response.data.token_endpoint
            .substring(0, response.data.token_endpoint.lastIndexOf("token")) + "revoke");
        setIssuer(response.data.issuer);
        setOPConfigInitiated();
        return Promise.resolve("success");
    }).catch((error) => {
        return Promise.reject(error);
    });
};
/**
 * Reset openid provider configuration.
 */
export const resetOPConfiguration = () => {
    removeSessionParameter(AUTHORIZATION_ENDPOINT);
    removeSessionParameter(TOKEN_ENDPOINT);
    removeSessionParameter(END_SESSION_ENDPOINT);
    removeSessionParameter(JWKS_ENDPOINT);
    removeSessionParameter(REVOKE_TOKEN_ENDPOINT);
    removeSessionParameter(OP_CONFIG_INITIATED);
    removeSessionParameter(ISSUER);
};
/**
 * Get OAuth2 authorize endpoint.
 *
 * @returns {string|null}
 */
export const getAuthorizeEndpoint = () => {
    return getSessionParameter(AUTHORIZATION_ENDPOINT);
};
/**
 * Get OAuth2 token endpoint.
 *
 * @returns {string|null}
 */
export const getTokenEndpoint = () => {
    return getSessionParameter(TOKEN_ENDPOINT);
};
/**
 * Get OAuth2 revoke token endpoint.
 *
 * @returns {string|null}
 */
export const getRevokeTokenEndpoint = () => {
    return getSessionParameter(REVOKE_TOKEN_ENDPOINT);
};
/**
 * Get OIDC end session endpoint.
 *
 * @returns {string|null}
 */
export const getEndSessionEndpoint = () => {
    return getSessionParameter(END_SESSION_ENDPOINT);
};
/**
 * Get JWKS URI.
 *
 * @returns {string|null}
 */
export const getJwksUri = () => {
    return getSessionParameter(JWKS_ENDPOINT);
};
/**
 * Get authenticated user's username
 *
 * @returns {string|null}
 */
export const getUsername = () => {
    return getSessionParameter(USERNAME);
};
/**
 * Get tenant name
 *
 * @returns {any}
 */
export const getTenant = () => {
    if (getUsername()) {
        const usernameSplit = getUsername().split("@");
        if (usernameSplit.length > 1) {
            return usernameSplit[usernameSplit.length - 1];
        }
    }
    return "";
};
/**
 * Get id_token issuer.
 *
 * @returns {any}
 */
export const getIssuer = () => {
    return getSessionParameter(ISSUER);
};
/**
 * Checks whether openid configuration initiated is valid.
 *
 * @returns {boolean}
 */
export const isValidOPConfig = (tenant) => {
    return isOPConfigInitiated() && ((getTenant() !== "") && (getTenant() !== tenant));
};
//# sourceMappingURL=op-config.js.map