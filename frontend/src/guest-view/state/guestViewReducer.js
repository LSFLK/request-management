//Incident Reducers
import { createReducer } from 'redux-starter-kit';
import {
    createGuestIncidentRequest,
    createGuestIncidentSuccess,
    createGuestIncidentError,

    loadGuestIncidentRequest,
    loadGuestIncidentSuccess,
    loadGuestIncidentError,

    updateGuestIncidentRequest,
    updateGuestIncidentSuccess,
    updateGuestIncidentError,

    loadGuestIncidentReporterRequest,
    loadGuestIncidentReporterSuccess,
    loadGuestIncidentReporterError,

    updateGuestIncidentReporterRequest,
    updateGuestIncidentReporterSuccess,
    updateGuestIncidentReporterError,

    uploadFileGuestSuccess,

    createGuestIncidentWithReporterSuccess

} from '../../incident/state/incidentActions'

import {
    loadOrganizationSuccess,
    moveStepper,
} from './guestViewActions'


const initialState = {
    isLoading: false,
    activeStep: 0,
    organization:{},
}

const incidentReducer = createReducer(initialState, {
    [loadOrganizationSuccess] : (state, action) => {
        state.organization = action.payload.organization.data;
    },
    [createGuestIncidentRequest] : (state, action) => {
        state.isLoading = true;
    },
    [createGuestIncidentSuccess] : (state, action) => {
        state.activeStep = 1;
        state.isLoading = false;
    },
    [updateGuestIncidentRequest] : (state, action) => {
        state.isLoading = true;
    },
    [updateGuestIncidentSuccess] : (state, action) => {
        state.activeStep = state.activeStep + 1;
        state.isLoading = false;
    },
    [updateGuestIncidentReporterRequest] : (state, action) => {
        state.isLoading = true;
    },
    [updateGuestIncidentReporterSuccess] : (state, action) => {
        state.activeStep = state.activeStep + 1;
        state.isLoading = false;
    },
    [uploadFileGuestSuccess] : (state, action) => {
        state.activeStep = state.activeStep + 1;
        state.isLoading = false;
    },
    [moveStepper]  : (state, action) => {
        state.activeStep = action.payload.step
    },
    [createGuestIncidentWithReporterSuccess] : (state, action) => {
        state.activeStep = state.activeStep + 1;
        state.isLoading = false;
    }

})

export default incidentReducer;