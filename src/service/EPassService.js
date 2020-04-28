import axios from 'axios';
import { SHOW_LOADING, HIDE_LOADING } from '../utils/contants';
import { getAuthToken, get } from '../utils/session';
import dotprop from 'dot-prop';
import { isProd, isGithub } from '../utils/helpers';
import isEmpty from 'lodash/get';

const BASE_URL = (() => {
    const DEFAULT_API = 'http://localhost:8080/';
    const EPASS_API = `${window.location.protocol}//${window.location.hostname}/ecurfew`;

    if (!isProd || isGithub) {
        return DEFAULT_API;
    }

    return EPASS_API;
})();

const fileHeaders = {
    'Content-Type': 'multipart/form-data'
};

axios.defaults.baseURL = BASE_URL;
axios.defaults.headers['Content-Type'] = 'application/json';

const showLoader = () => {
    window.dispatchEvent(new CustomEvent(SHOW_LOADING));
};

const hideLoader = () => {
    window.dispatchEvent(new CustomEvent(HIDE_LOADING));
};

axios.interceptors.request.use(
    function(config) {
        showLoader();
        return config;
    },
    function(error) {
        hideLoader();
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    function(response) {
        hideLoader();
        return response;
    },
    function(error) {
        const message = dotprop.get(error, 'response.data.message');
        if (
            error.response.status === 401 ||
            String(message).indexOf('invalid token') > -1
        ) {
            window.dispatchEvent(new CustomEvent('LOGIN'));
            return Promise.reject();
        }

        hideLoader();
        return Promise.reject(error);
    }
);

export default {
    signIn(email, password, stateName) {
        return axios.post('/signin', {
            email,
            password,
            accountType: 'user',
            stateName
        });
    },

    createAccount({ name, email, password, orgID, orgName, stateName, peid }) {
        return axios.post('/createAccount', {
            name,
            email,
            password,
            orgID,
            peid: !peid || isEmpty(peid) ? undefined : peid,
            orgName,
            stateName
        });
    },

    verifyOTP({ emailId, otp, stateName, peidOTP }) {
        return axios.post('/verifyOTP', {
            identifier: emailId,
            accountIdentifierType: 'email',
            otp,
            stateName,
            peidOTP
        });
    },

    requestOTP(emailId, stateName, peid) {
        return axios.post('/requestOTP', {
            identifier: emailId,
            stateName,
            accountIdentifierType: 'email',
            peid
        });
    },

    updatePassword({ email, password, authToken }) {
        return axios.post('/updatePassword', {
            email,
            password,
            authToken
        });
    },

    createOrder(formData) {
        return axios.post('/createOrder', formData, { headers: fileHeaders });
    },

    downloadQRCodes(orderID) {
        return axios.post('/downloadQRCodes', {
            orderID,
            authToken: getAuthToken()
        });
    },

    getRequesterUserProfile() {
        return axios.post(`/getRequesterUserProfile`, null, {
            params: {
                authToken: getAuthToken()
            }
        });
    },

    getOrders() {
        return axios.post('/getOrders', {
            accountID: get('accountID'),
            authToken: getAuthToken()
        });
    },

    getOrganization() {
        return axios.post('/getOrganization', {
            authToken: getAuthToken()
        });
    },

    fetchStateList() {
        return axios.post(`/fetchStateList`);
    }
};
