import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleSignOut } from "./state/authentications.actions";

/**
 * This component handles the sign-out function
 */
export const SignOut = () => {
    const dispatch = useDispatch();
    const logoutInit = useSelector((state) => state.authenticationInformation.logoutInit);

    useEffect(() => {
        if (!logoutInit) {
            dispatch(handleSignOut());
        }
    }, [ logoutInit ]);

    return null;
};
