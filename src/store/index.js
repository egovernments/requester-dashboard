import Vue from 'vue';
import Vuex from 'vuex';
import EPassService from '../service/EPassService';
import { getError } from '../utils/error-handler';
import get from 'lodash/get';

Vue.use(Vuex);

let reqOrderList = localStorage.getItem('reqOrderList');

if (reqOrderList) {
    reqOrderList = JSON.parse(reqOrderList);
}

export default new Vuex.Store({
    state: {
        orderList: reqOrderList || [],
        stateMap: {},
        stateConfig: {}
    },

    mutations: {
        setOrderList(state, list) {
            state.orderList = list;
        },
        setStateList(store, list) {
            store.stateMap = list;
        },
        setStateConfig(store, list) {
            store.stateConfig = list;
        }
    },
    actions: {
        async fetchOrders({ commit }) {
            try {
                const { data } = await EPassService.getOrders();
                const orders = get(data, 'orders', []).map(item => {
                    return {
                        ...item,
                        searchTerm: `${item.id}|${
                            item.requestCount
                        }|${item.purpose.toLowerCase()}`
                    };
                });
                commit('setOrderList', orders);
                localStorage.setItem('reqOrderList', JSON.stringify(orders));
            } catch (error) {
                getError(error);
            }
        },
        async fetchStateList({ commit }) {
            const { data: res } = await EPassService.fetchStateList();
            commit('setStateList', res.stateMap);
            const stateConfig = res.stateConfig;
            const stateMap = res.stateMap;

            const stateConfigMap =
                stateMap &&
                Object.keys(stateMap).reduce((result, item) => {
                    result[stateMap[item]] = stateConfig[item];
                    return result;
                }, {});

            commit('setStateConfig', stateConfigMap);
            localStorage.setItem('stateList', res.stateMap);
        }
    }
});
