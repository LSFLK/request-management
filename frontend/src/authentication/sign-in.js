import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleSignIn } from "./state/authentications.actions";
import { createBrowserHistory } from "history";
import { IDENTITY_SERVER_URL } from "../config";
import { AuthenticateSessionUtil } from "./auth-module";
import { requestSignInSuccess } from "../shared/state/sharedActions";

/**
 * Error description when the user denies consent to the app
 * @constant
 * @type {string}
 * @default
 */
export const USER_DENIED_CONSENT = "User denied the consent";

/**
 * This component handles the sign-in function
 */
export const SignIn = (props) => {
    const dispatch = useDispatch();

    const isAuth = useSelector((state) => state.authentication.isAuth);
    const isSignedIn = useSelector((state) => state.shared.signedInUser.isSignedIn);

    const error = new URLSearchParams(props.location.search).get("error_description");

    const history = createBrowserHistory();

    const getAuthenticationCallbackUrl = () => {
        return window.sessionStorage.getItem("auth_callback_url");
    };

    const loginSuccessRedirect = () => {
        const AuthenticationCallbackUrl = getAuthenticationCallbackUrl();
        const location =
            !AuthenticationCallbackUrl || AuthenticationCallbackUrl === `${IDENTITY_SERVER_URL}sign-in`
                ? "/app/home"
                : AuthenticationCallbackUrl;

        history.push(location);
    };

    useEffect(() => {
        if (!isAuth && !error) {
            dispatch(handleSignIn());
        } else if (error === USER_DENIED_CONSENT) {
            dispatch(handleSignIn(true));
        } else {
            const userDetails = AuthenticateSessionUtil.getAllSessionParameters();
            dispatch(requestSignInSuccess(userDetails));
        }
    }, [isAuth]);

    useEffect(() => {
        if (isSignedIn) {
            loginSuccessRedirect();
        }
    }, [isSignedIn]);

    return null;
};
