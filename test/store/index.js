import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions';
import mutations from './mutations';
import states from './states';

import app from './modules/app.js';

Vue.use(Vuex)
export default new Vuex.Store({
    states,
    mutations,
    actions,
    modules: {
      app
    }
})