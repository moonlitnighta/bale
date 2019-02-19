export default {
  state: {
      user:''
  },
  mutations: {
    LOADING_STATUS(state , params) {
      state.user = params;
    },
    EXIT(state) {
      state.user = '';
    }
  },
  actions: {
      ['login'](ctx,params) {
          ctx.commit('LOADING_STATUS' , params);
      },
      ['exit'](ctx,params) {
          ctx.commit('EXIT');
      },
  }
}
