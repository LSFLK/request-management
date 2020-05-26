
import { createAction } from 'redux-starter-kit';
import * as organizationApi from "../../api/organizations";

// Loading one organization
export const loadOrganizationRequest = createAction('INCIDENT/LOAD_ORGANIZATION_REQUEST');
export const loadOrganizationSuccess = createAction('INCIDENT/LOAD_ORGANIZATION_Success');
export const loadOrganizationError = createAction('INCIDENT/LOAD_ORGANIZATION_Error');

export function loadOrganization(organizationId) {
    return async function (dispatch) {
        dispatch(loadOrganizationRequest());
        try{
            const responseOrganization = await organizationApi.getOrganization(organizationId);
            dispatch(loadOrganizationSuccess({
                "organization": responseOrganization.data,
            }));

        }catch(error){
            dispatch(loadOrganizationError(error));
        }
    }
}

//stepper movement actions
export const moveStepper = createAction('GUEST_VIEW/MOVE_STEPPER');










