import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    netid: "",
  },
  mutations: {
    setNetid(state, n) {
      state.netid = n;
    }
  },
  actions: {
  },
  modules: {
  }
})
