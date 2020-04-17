import { authenticateActionTypes } from "./types";
import {
    AuthenticateSessionUtil,
    AuthenticateTokenKeys,
    OPConfigurationUtil,
    SignInUtil,
    SignOutUtil
} from "../auth-module/";
import _ from "lodash";
import store from "../../store/store";
import { createBrowserHistory } from "history";
import {IDENTITY_SERVER_URL, CLIENT_ID } from "../../config";
import { signOut } from "../../shared/state/sharedActions";

const history = createBrowserHistory();

/**
 * Dispatches an action of type `SET_SIGN_IN`.
 */
export const setSignIn = () => ({
    type: authenticateActionTypes.SET_SIGN_IN
});

/**
 * Dispatches an action of type `SET_SIGN_OUT`.
 */
export const setSignOut = () => ({
    type: authenticateActionTypes.SET_SIGN_OUT
});

/**
 * Dispatches an action of type `RESET_AUTHENTICATION`.
 */
export const resetAuthentication = () => ({
    type: authenticateActionTypes.RESET_AUTHENTICATION
});

/**
 * Handle user sign-out
 */
export const handleSignOut = () => (dispatch) => {
    if (sessionStorage.length === 0) {
        history.push(store.getState().config.deployment.appLoginPath);
    } else {
        SignOutUtil.sendSignOutRequest(store.getState().config.deployment.loginCallbackUrl, () => {
            dispatch(setSignOut());
            dispatch(signOut());
            AuthenticateSessionUtil.endAuthenticatedSession();
            OPConfigurationUtil.resetOPConfiguration();
        }).catch(() => {
            history.push(store.getState().config.deployment.appLoginPath);
        });
    }
};

/**
 * Handle user sign-in
 */
export const handleSignIn = (consentDenied = false) => (dispatch) => {
    const requestParams = {
        clientHost: window.location.origin,
        clientId: CLIENT_ID,
        clientSecret: null,
        enablePKCE: true,
        redirectUri: `${window.location.origin}/sign-in`,
        scope: ["admin"],
        serverOrigin: IDENTITY_SERVER_URL,
        tenant: "carbon.super"
    };

    const sendSignInRequest = () => {
        if (consentDenied) {
            requestParams.prompt = "login";
        }

        if (SignInUtil.hasAuthorizationCode()) {
            SignInUtil.sendTokenRequest(requestParams)
                .then((response) => {
                    AuthenticateSessionUtil.initUserSession(
                        response,
                        SignInUtil.getAuthenticatedUser(response.idToken)
                    );
                    dispatch(setSignIn());
                })
                .catch((error) => {
                    if (error.response.status === 400) {
                        SignInUtil.sendAuthorizationRequest(requestParams);
                    }

                    throw error;
                });
        } else {
            SignInUtil.sendAuthorizationRequest(requestParams);
        }
    };

    if (AuthenticateSessionUtil.getSessionParameter(AuthenticateTokenKeys.ACCESS_TOKEN)) {
        if (OPConfigurationUtil.isValidOPConfig(requestParams.tenant)) {
            AuthenticateSessionUtil.endAuthenticatedSession();
            OPConfigurationUtil.resetOPConfiguration();
            handleSignOut();
        }

        dispatch(setSignIn());
    } else {
        OPConfigurationUtil.initOPConfiguration(
            `${IDENTITY_SERVER_URL}/oauth2/oidcdiscovery/.well-known/openid-configuration`,
            false
        )
            .then(() => {
                sendSignInRequest();
            })
            .catch(() => {
                OPConfigurationUtil.setAuthorizeEndpoint(`${IDENTITY_SERVER_URL}oauth2/authorize`);
                OPConfigurationUtil.setTokenEndpoint(`${IDENTITY_SERVER_URL}oauth2/token`);
                OPConfigurationUtil.setRevokeTokenEndpoint(`${IDENTITY_SERVER_URL}oauth2/revoke`);
                OPConfigurationUtil.setEndSessionEndpoint(`${IDENTITY_SERVER_URL}/oidc/logout`);
                OPConfigurationUtil.setJwksUri(`${IDENTITY_SERVER_URL}oauth2/jwks`);
                OPConfigurationUtil.setIssuer(`${IDENTITY_SERVER_URL}oauth2/token`);
                OPConfigurationUtil.setOPConfigInitiated();

                sendSignInRequest();
            });
    }
};

/**
 * Update sessionStorage with location history path
 *
 * @param {string} location - history path.
 */
export const updateAuthenticationCallbackUrl = (location) => {
    window.sessionStorage.setItem("auth_callback_url", location);
};
