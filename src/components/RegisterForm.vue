<template>
    <div class="register-form">
        <div class="title">Register</div>

        <section>
            <form @submit.prevent.stop>
                <b-field
                    :message="error.orgName"
                    :type="{ 'is-danger': !!error.orgName }"
                >
                    <template slot="label">
                        Organization name <span class="has-text-danger">*</span>
                    </template>
                    <b-input
                        @blur="validateOrgName"
                        @focus="error.orgName = ''"
                        type="text"
                        v-model="user.orgName"
                    ></b-input>
                </b-field>

                <b-field
                    :message="error.orgId"
                    :type="{ 'is-danger': !!error.orgId }"
                >
                    <template slot="label">
                        GSTIN Id <span class="has-text-danger">*</span>
                    </template>
                    <b-input
                        @blur="validateOrgId"
                        @focus="error.orgId = ''"
                        type="text"
                        v-model="user.orgId"
                    ></b-input>
                </b-field>

                <b-field
                    :message="error.peid"
                    :type="{ 'is-danger': !!error.peid }"
                >
                    <template slot="label">
                        Principal Entity ID (PEID)
                        <b-tooltip
                            placement="is-right"
                            type="is-dark"
                            label="Principal Entity ID (PEID) [It is a unique ID usually obtained by companies who use services from Telecom Service Providers (TSP) through registration in the UCC DLT platform. Authenticating your organization via PE ID will increase trust in the company registration.]"
                        >
                            <b-icon
                                class="info-icon"
                                size="is-small"
                                icon="information"
                                type="is-grey"
                            ></b-icon>
                        </b-tooltip>
                    </template>
                    <b-input
                        @blur="validatePEID"
                        @focus="error.peid = ''"
                        type="text"
                        v-model="user.peid"
                    ></b-input>
                </b-field>

                <b-field
                    :message="error.state"
                    :type="{ 'is-danger': !!error.state }"
                >
                    <template slot="label">
                        State <span class="has-text-danger">*</span>
                    </template>
                    <b-select
                        :disabled="Object.keys(stateMap).length === 0"
                        @change="validateState"
                        @focus="error.state = ''"
                        expanded
                        placeholder="Select a state"
                        v-model="user.state"
                    >
                        <option
                            :key="index"
                            :value="state"
                            v-for="(state, index) in stateMap"
                            >{{ state }}</option
                        >
                    </b-select>
                </b-field>

                <b-field
                    :message="error.name"
                    :type="{ 'is-danger': !!error.name }"
                >
                    <template slot="label">
                        Your name <span class="has-text-danger">*</span>
                    </template>
                    <b-input
                        @blur="validateName"
                        @focus="error.name = ''"
                        type="text"
                        v-model="user.name"
                    ></b-input>
                </b-field>

                <b-field
                    :message="error.email"
                    :type="{ 'is-danger': !!error.email }"
                >
                    <template slot="label">
                        Official / Organization Email
                        <span class="has-text-danger">*</span>
                    </template>
                    <b-input
                        @blur="validateEmail"
                        @focus="error.email = ''"
                        type="email"
                        v-model="user.email"
                    ></b-input>
                </b-field>

                <b-field
                    :message="error.pass"
                    :type="{ 'is-danger': !!error.pass }"
                >
                    <template slot="label">
                        Enter Password <span class="has-text-danger">*</span>
                    </template>
                    <b-input
                        @blur="validatePassword"
                        @focus="error.pass = ''"
                        password-reveal
                        type="password"
                        v-model="user.pass"
                    ></b-input>
                </b-field>

                <b-field
                    :message="error.cpass"
                    :type="{ 'is-danger': !!error.cpass }"
                >
                    <template slot="label">
                        Confirm Password <span class="has-text-danger">*</span>
                    </template>
                    <b-input
                        @blur="confimPassword"
                        @focus="error.cpass = ''"
                        password-reveal
                        type="password"
                        v-model="user.cpass"
                    ></b-input>
                </b-field>

                <div
                    class="is-size-7 has-text-danger has-text-weight-semibold"
                    v-if="apiError"
                >
                    {{ apiError }}
                </div>

                <div class="buttons m-y-48">
                    <b-button
                        :disabled="loading"
                        :loading="loading"
                        @click="register"
                        class="has-text-weight-bold"
                        expanded
                        native-type="submit"
                        type="is-primary"
                        >Register</b-button
                    >
                </div>
            </form>
            <br />
            <div class="is-size-6">
                <span class="m-r-8">Have a verified account already?</span>
                <router-link class="has-text-weight-semibold" to="/login"
                    >Login</router-link
                >
            </div>
        </section>
    </div>
</template>

<script>
import { isValidEmail, isValidPeid } from '../utils/helpers';
import EPassService from '../service/EPassService';
import { getError } from '../utils/error-handler';

export default {
    name: 'RegisterForm',
    components: {},

    data() {
        return {
            user: {
                orgName: '',
                orgId: '',
                peid: undefined,
                name: '',
                email: '',
                pass: '',
                cpass: '',
                state: null
            },
            error: {
                orgName: '',
                orgId: '',
                name: '',
                peid: '',
                email: '',
                pass: '',
                cpass: '',
                state: ''
            },
            loading: false,
            apiError: null
        };
    },
    computed: {
        stateMap() {
            return this.$store.state.stateMap;
        }
    },
    methods: {
        validateEmail() {
            this.error.email = '';
            if (!this.user.email) {
                this.error.email = 'Please enter email id';
            } else if (!isValidEmail(this.user.email.trim())) {
                this.error.email = 'Invalid email address';
            }
        },

        validatePassword() {
            this.error.pass = '';
            if (!this.user.pass) {
                this.error.pass = 'Please enter password';
            } else if (
                this.user.pass.trim().length < 5 ||
                this.user.pass.trim().length > 20
            ) {
                this.error.pass =
                    'Invalid password length, should be between 5 and 20';
            }
        },

        validateOrgName() {
            this.error.orgName = '';
            if (!this.user.orgName) {
                this.error.orgName = 'Please enter organization name';
            } else if (
                this.user.orgName.trim().length < 1 ||
                this.user.orgName.trim().length > 100
            ) {
                this.error.orgName =
                    'Invalid org name length, should be between 1 and 100';
            }
        },

        validateName() {
            this.error.name = '';
            if (!this.user.name) {
                this.error.name = 'Please enter your name';
            } else if (
                this.user.name.trim().length < 1 ||
                this.user.name.trim().length > 100
            ) {
                this.error.name =
                    'Invalid name length, should be between 5 and 20';
            }
        },

        validateState() {
            this.error.state = '';
            if (!this.user.state) {
                this.error.state = 'Please select a state';
            }
        },

        validateOrgId() {
            this.error.orgId = '';
            if (!this.user.orgId) {
                this.error.orgId = 'Please enter organization / GSTIN id';
            } else if (this.user.orgId.trim().length !== 15) {
                this.error.orgId =
                    'Invalid size, GSTIN should be 15 characters!';
            }
        },

        validatePEID() {
            this.error.peid = '';
            if (this.user.peid) {
                if (!isValidPeid(this.user.peid.trim())) {
                    this.error.peid =
                        'Principal Entity ID (PEID) should be only numbers! Length should be between 12-19 characters!';
                }
            }
        },

        confimPassword() {
            this.error.cpass = '';
            if (!this.user.cpass) {
                this.error.cpass = 'Please re-enter password';
                return;
            }

            if (this.user.cpass !== this.user.pass) {
                this.error.cpass = 'Password does not match!';
            }
        },

        isValid() {
            this.validateName();
            this.validateOrgName();
            this.validateState();
            this.validateOrgId();
            this.validatePEID();
            this.validateEmail();
            this.validatePassword();
            this.confimPassword();

            return !Object.keys(this.error).some(key => !!this.error[key]);
        },

        async register() {
            if (!this.isValid()) {
                return;
            }

            this.loading = true;
            try {
                const {
                    name,
                    email,
                    pass,
                    orgId,
                    orgName,
                    state,
                    peid
                } = this.user;

                await EPassService.createAccount({
                    email: email.trim(),
                    name: name.trim(),
                    password: pass.trim(),
                    orgName: orgName.trim(),
                    peid: peid ? peid.trim() : peid,
                    orgID: orgId.trim(),
                    stateName: state
                });

                this.loading = false;

                sessionStorage.setItem('email', email.trim());
                sessionStorage.setItem('state', state);
                if (peid) {
                    sessionStorage.setItem('peid', peid);
                }
                this.$router.push('/verify-otp');
            } catch (error) {
                this.loading = false;
                this.apiError = getError(error);
            }
        }
    }
};
</script>

<style lang="scss">
.register-form {
    section {
        margin-top: 60px;
        button {
            height: 40px;
        }
        .label {
            font-weight: 600;
        }
    }
}

.b-tooltip.is-dark:after {
    background: #363636;
    color: whitesmoke;
    white-space: inherit !important;
    width: 300px !important;
}
</style>
