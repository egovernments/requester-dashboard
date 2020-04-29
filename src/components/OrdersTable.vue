<template>
    <div>
        <transition mode="out-in" name="fade">
            <div v-if="!loading && orderList.length > 0">
                <nav class="level">
                    <div class="level-left">
                        <div class="level-item">
                            <div class="is-flex">
                                <span class="m-r-8">Total orders:</span>
                                <span class="has-text-weight-bold">{{
                                    filteredSignUpList.length
                                }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="level-right">
                        <div class="level-item">
                            <div class="is-flex">
                                <b-field grouped>
                                    <p class="control">
                                        <b-dropdown
                                            aria-role="list"
                                            class="filter-options"
                                            position="is-bottom-left"
                                            v-model="statusOption"
                                        >
                                            <button
                                                class="button"
                                                slot="trigger"
                                                slot-scope="{ active }"
                                            >
                                                <span
                                                    :class="
                                                        `has-text-${getStatusClass(
                                                            statusOption
                                                        )}`
                                                    "
                                                    class="has-text-weight-semibold is-uppercase"
                                                >
                                                    {{
                                                        statusMap[statusOption]
                                                    }}
                                                </span>
                                                <b-icon
                                                    :icon="
                                                        active
                                                            ? 'menu-up'
                                                            : 'menu-down'
                                                    "
                                                ></b-icon>
                                            </button>

                                            <b-dropdown-item
                                                :key="value"
                                                :value="value"
                                                aria-role="listitem"
                                                v-for="(status,
                                                value) in statusMap"
                                            >
                                                <span
                                                    :class="
                                                        `has-text-${getStatusClass(
                                                            value
                                                        )}`
                                                    "
                                                    class="has-text-weight-bold is-uppercase"
                                                    >{{ status }}</span
                                                >
                                            </b-dropdown-item>
                                        </b-dropdown>
                                    </p>

                                    <b-field>
                                        <b-input
                                            icon="magnify"
                                            icon-clickable
                                            placeholder="Search..."
                                            type="search"
                                            v-model="searchText"
                                        ></b-input>
                                    </b-field>
                                </b-field>
                            </div>
                        </div>
                    </div>
                </nav>

                <b-table
                    :current-page.sync="currentPage"
                    :data="filteredSignUpList"
                    :default-sort-direction="defaultSortDirection"
                    :paginated="isPaginated"
                    :pagination-position="paginationPosition"
                    :per-page="perPage"
                    :sort-icon="sortIcon"
                    :sort-icon-size="sortIconSize"
                    v-if="filteredSignUpList.length > 0"
                >
                    <template slot-scope="props">
                        <b-table-column
                            field="createdAt"
                            label="Raised on"
                            sortable
                        >
                            <div class="has-text-dark is-size-6">
                                {{ props.row.createdAt | formatDate }}
                            </div>
                            <div class="has-text-grey is-size-6">
                                {{ props.row.createdAt | formatTime }}
                            </div>
                        </b-table-column>

                        <b-table-column field="id" label="Order Id" sortable>{{
                            props.row.id
                        }}</b-table-column>

                        <b-table-column
                            field="requestCount"
                            label="No. of Passes Generated"
                            sortable
                            >{{ props.row.applicationAccepted }}</b-table-column
                        >

                        <b-table-column
                            field="requestCount"
                            label="No. of Passes Rejected"
                            sortable
                            >{{ props.row.applicationRejected }}</b-table-column
                        >

                        <b-table-column
                            field="purpose"
                            label="Purpose"
                            sortable
                        >
                            {{ props.row.purpose }}
                        </b-table-column>

                        <b-table-column
                            field="orderStatus"
                            label="Status"
                            sortable
                        >
                            <span
                                :class="
                                    `has-text-${getStatusClass(
                                        props.row.orderStatus
                                    )}`
                                "
                                class="has-text-weight-bold is-uppercase"
                                >{{
                                    props.row.orderStatus | formatStatusLabel
                                }}</span
                            >
                        </b-table-column>
                        <b-table-column field="zipFileURL" label=" ">
                            <b-button
                                @click="downloadQRCodes(props.row.id)"
                                class="has-text-primary has-text-weight-semibold"
                                icon-left="download"
                                size="is-small"
                                tag="a"
                                type="is-white"
                                v-if="props.row.zipFileURL"
                                >Download e-Passes</b-button
                            >
                        </b-table-column>
                    </template>

                    <template slot="bottom-left">
                        <span class="is-size-7 has-text-weight-bold m-r-8"
                            >Request per page:</span
                        >
                        <b-select
                            placeholder="Select a character"
                            size="is-small"
                            v-model="perPage"
                        >
                            <option
                                :key="index"
                                :value="item"
                                v-for="(item, index) in [10, 25, 50]"
                                >{{ item }}</option
                            >
                        </b-select>
                    </template>
                </b-table>
            </div>
            <div class="no-request-image" v-else>
                <img alt src="../assets/no-request.png" />
            </div>
        </transition>
    </div>
</template>

<script>
import dayjs from 'dayjs';
import EPassService from '../service/EPassService';
import { showSuccess, showError } from '../utils/toast';

export default {
    name: 'OrdersTable',

    components: {},
    data() {
        return {
            statusOption: 'all',
            isPaginated: true,
            searchText: '',
            paginationPosition: 'bottom',
            defaultSortDirection: 'asc',
            sortIcon: 'arrow-up',
            sortIconSize: 'is-small',
            currentPage: 1,
            perPage: 10,
            loading: false
        };
    },

    computed: {
        orderList() {
            return this.$store.state.orderList;
        },
        statusMap() {
            const map = {
                all: 'Show All'
            };
            this.orderList.forEach(o => {
                map[o.orderStatus] = this.$options.filters.formatStatusLabel(
                    o.orderStatus
                );
            });
            return map;
        },

        filterByStatus() {
            if (this.statusOption === 'all') {
                return this.orderList;
            }
            return this.orderList.filter(
                o => o.orderStatus == this.statusOption
            );
        },

        filteredSignUpList() {
            return this.filterByStatus.filter(order =>
                order.searchTerm.match(this.searchText.trim().toLowerCase())
            );
        }
    },

    filters: {
        formatDate(date) {
            return dayjs(new Date(date)).format('DD MMM YY');
        },
        formatTime(date) {
            return dayjs(new Date(date)).format('hh:mm A');
        },

        formatRequestLabel(request) {
            return request.toLowerCase() === 'person'
                ? 'Individual'
                : 'Vehicle';
        },

        formatStatusLabel(status) {
            status = status.replace('_', ' ');

            if (status.toLowerCase() === 'created') return 'PENDING';
            if (status.toLowerCase() === 'declined') return 'REJECTED';

            return status;
        }
    },

    methods: {
        fetchOrders() {
            this.$store.dispatch('fetchOrders');
        },

        async downloadQRCodes(orderId) {
            try {
                const { data } = await EPassService.downloadQRCodes(orderId);
                const url = data.processedS3URL;

                const ele = document.createElement('a');
                ele.setAttribute('download', 'download');
                ele.href = url;

                ele.click();

                showSuccess(`e-Passes downloaded successfully`);
            } catch (error) {
                showError(`Unable to download e-Passes`);
            }
        },
        getStatusClass(status) {
            if (status.match('all')) return 'dark ';

            if (status.match('created|processing')) return 'warning';

            if (status.match('declined|failed|invalid_file')) return 'danger';

            if (status.match('approved')) return 'success';

            return 'primary';
        }
    },
    created() {
        this.fetchOrders();
    }
};
</script>

<style lang="scss">
.filter-options {
    .dropdown-item.is-active,
    .dropdown .dropdown-menu .has-link .is-active,
    .dropdown-item.is-active {
        background-color: #f7f7f7;
    }
}
</style>
