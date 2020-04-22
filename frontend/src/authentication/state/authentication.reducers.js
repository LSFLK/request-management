import { AuthenticateSessionUtil, AuthenticateTokenKeys, AuthenticateUserKeys } from "../auth-module";
import { authenticateActionTypes } from "./types";

/**
 * Create an empty profile
 */
const createEmptyProfile = () => ({
    associations: [],
    email: "",
    emails: [],
    groups: [],
    id: "",
    isSecurity: false,
    name: { givenName: "", familyName: "" },
    organisation: "",
    phoneNumbers: [],
    profileUrl: "",
    responseStatus: null,
    roles: [],
    userName: "",
    userimage: ""
});

/**
 * Initial authenticate state.
 */
const authenticateInitialState = {
    displayName: "",
    emails: "",
    isAuth: false,
    location: "/app/home",
    loginInit: false,
    logoutInit: false,
    profileInfo: createEmptyProfile(),
    profileSchemas: [],
    username: ""
};

/**
 * Reducer to handle the state of authentication related actions.
 *
 * @param state - Previous state
 * @param action - Action type
 * @returns The new state
 */
const authenticateReducer = (state = authenticateInitialState, action) => {
    switch (action.type) {
        case authenticateActionTypes.SET_SIGN_IN:
            if (AuthenticateSessionUtil.getSessionParameter(AuthenticateTokenKeys.ACCESS_TOKEN)) {
                return {
                    ...state,
                    displayName: AuthenticateSessionUtil.getSessionParameter(AuthenticateUserKeys.DISPLAY_NAME),
                    emails: AuthenticateSessionUtil.getSessionParameter(AuthenticateUserKeys.EMAIL),
                    isAuth: true,
                    loginInit: true,
                    logoutInit: false,
                    username: AuthenticateSessionUtil.getSessionParameter(AuthenticateUserKeys.USERNAME)
                };
            }
            break;
        case authenticateActionTypes.SET_SIGN_OUT:
            return {
                ...state,
                loginInit: false,
                logoutInit: true
            };
        case authenticateActionTypes.RESET_AUTHENTICATION:
            return {
                ...authenticateInitialState
            };
        case authenticateActionTypes.SET_PROFILE_INFO:
            return {
                ...state,
                profileInfo: action.payload
            };
        case authenticateActionTypes.SET_SCHEMAS:
            return {
                ...state,
                profileSchemas: action.payload
            };
        default:
            return state;
    }
};

export { authenticateInitialState, authenticateReducer };
