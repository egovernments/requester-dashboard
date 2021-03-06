<template>
    <side-sheet @close="$emit('close')">
        <div class="create-request-container">
            <transition mode="out-in" name="fade">
                <div v-if="!requestCreated">
                    <div class="title is-4">Create Request</div>

                    <transition appear mode="out-in" name="fade">
                        <div>
                            <div class="title is-6">
                                Please ensure the following criteria are
                                fulfilled while uploading the request file
                            </div>
                            <div></div>
                            <div class="subtitle is-6">
                                <ul>
                                    <li>
                                        1. File format should be .csv, download
                                        Pass Template below and use given format
                                        ONLY! <br /><br />
                                    </li>
                                    <li>
                                        2. Maximum allowed date for pass
                                        issuance is currently fixed at
                                        03/05/2020 <br /><br />
                                    </li>
                                    <li>
                                        3. Make sure the header row is present
                                        in the .csv file <br /><br />
                                    </li>
                                    <li>
                                        4. All details asked for employees are
                                        mandatory in the .csv file <br /><br />
                                    </li>
                                    <li>
                                        5. Make sure the Validity Date format is
                                        either DD/MM/YYYY or DD-MM-YYYY only
                                        <br /><br />
                                    </li>
                                    <li>
                                        6. All mobile numbers should be valid
                                        <br /><br />
                                    </li>
                                    <li>
                                        7. You can claim upto
                                        {{ org.activePassLimit | formatNumber }}
                                        passes only, in a single request<br /><br />
                                    </li>
                                </ul>
                            </div>

                            <hr />
                            <div></div>

                            <b-button
                                :href="passTemplateFile"
                                class="has-text-primary has-text-weight-bold"
                                download
                                icon-left="download"
                                size="is-medium"
                                tag="a"
                                type="is-white"
                                >Download Pass Template</b-button
                            >
                            <hr />
                            <div></div>
                            <div class="title is-5">Upload file</div>
                            <div></div>
                            <label
                                class="upload-file-container is-flex has-text-primary"
                                for="orderFile"
                            >
                                <b-icon
                                    icon="file-upload"
                                    size="is-medium"
                                ></b-icon>
                                <div class="text">Upload .csv file</div>
                                <input
                                    @change="handleFile"
                                    accept=".csv"
                                    hidden
                                    id="orderFile"
                                    name="order"
                                    ref="orderFile"
                                    type="file"
                                />
                            </label>

                            <div class="file-status is-flex" v-if="file">
                                <b-icon
                                    icon="check-circle"
                                    type="is-success"
                                ></b-icon>
                                <span class="subtitle is-6">{{
                                    file.name
                                }}</span>
                            </div>
                            <br />
                            <div
                                class="is-size-7 has-text-danger has-text-weight-semibold"
                                v-if="apiError"
                            >
                                {{ apiError }}
                            </div>
                        </div>
                    </transition>
                </div>

                <template v-else>
                    <div class="is-flex request-done-container">
                        <div>
                            <img
                                alt
                                src="../assets/approvalwaiting-icon.png"
                                width="80"
                            />
                        </div>

                        <div class="title is-4">Request sent successfully!</div>
                        <div class="subtitle is-7">
                            Kindly wait until we can we can review and get back
                            with the status of your application
                        </div>
                    </div>
                </template>
            </transition>

            <transition appear name="slideInBottom">
                <div class="step-navigtion-container">
                    <b-button
                        :disabled="disableBtn"
                        :loading="loading"
                        @click="proceed"
                        class="has-text-weight-bold"
                        expanded
                        type="is-primary"
                    >
                        <span v-if="requestCreated">Done</span>
                        <span v-else>Send Request</span>
                    </b-button>
                </div>
            </transition>
        </div>
    </side-sheet>
</template>

<script>
import SideSheet from './SideSheet.vue';
import EPassService from '../service/EPassService';
import { getAuthToken } from '../utils/session';
import { getError } from '../utils/error-handler';

export default {
    name: 'CreateRequest',

    components: {
        SideSheet
    },
    data() {
        let org = localStorage.getItem('org');

        if (org) {
            org = JSON.parse(org);
        }
        return {
            org: org || {},
            selectedReason: 'Essential services',
            passType: 'person',
            file: null,
            apiError: null,
            loading: false,
            requestCreated: false
        };
    },

    filters: {
        formatNumber(number) {
            return new Intl.NumberFormat('en-IN').format(number);
        }
    },

    computed: {
        disableBtn() {
            if (this.loading) {
                return true;
            }

            return false;
        },

        passTemplateFile() {
            return `${window.location.protocol}//${window.location.host}${
                process.env.APPLICATION_PATH
            }e-pass-template.csv?v=${Date.now()}`;
        }
    },
    methods: {
        setReason(reason) {
            this.selectedReason = reason;
        },

        setPassType(type) {
            this.passType = type;
        },

        handleFile() {
            this.apiError = null;

            this.file = this.$refs.orderFile.files[0];
            this.$refs.orderFile.files = null;
        },

        proceed() {
            if (this.requestCreated) {
                this.$emit('success');
                return;
            }

            this.createOrder();
        },

        async createOrder() {
            this.apiError = null;
            const formData = new FormData();

            formData.append('file', this.file);
            formData.append('orderType', this.passType);
            formData.append('purpose', this.selectedReason);
            formData.append('authToken', getAuthToken());

            this.loading = true;

            try {
                await EPassService.createOrder(formData);
                this.requestCreated = true;
            } catch (error) {
                this.apiError = getError(error);
            }

            this.loading = false;
        }
    }
};
</script>

<style lang="scss">
.create-request-container {
    padding: 2rem 0;
    overflow: scroll;
    height: 100%;
}

.step-navigtion-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 24px 32px;
    background: #ffffff;
    box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.25);
    button {
        height: 48px;
    }
}

.line-height-1.\5 {
    line-height: 1.5;
}

.upload-file-container {
    border-radius: 4px;
    border: 1px dashed #c6cbd4;
    padding: 20px;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    &:hover {
        background-color: #f5f5f5;
    }
    .text {
        margin-left: 8px;
    }
}

.file-status {
    margin-top: 16px;
    align-items: center;
    .subtitle {
        margin-left: 8px;
    }
}

.request-done-container {
    align-items: center;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    height: 100%;

    img {
        margin-bottom: 32px;
    }

    .title {
        margin-bottom: 24px;
    }

    .subtitle {
        line-height: 1.5;
    }
}
</style>
