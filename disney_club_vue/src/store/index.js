import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    clientId: "",
    isUser: "",
    isAdmin: "",
  },
  mutations: {
    setClientId(state, n) {
      state.clientId = n;
    },
    setIsUser(state, u) {
      state.isUser = u;
    },
    setIsAdmin(state, a) {
      state.isAdmin = a;
    },
  },
  actions: {},
  modules: {},
});
