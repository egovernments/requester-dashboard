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
        stateMap: {}
    },

    mutations: {
        setOrderList(state, list) {
            state.orderList = list;
        },
        setStateList(store, list) {
            store.stateMap = list;
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
            localStorage.setItem('stateList', res.stateMap);
        }
    }
});
