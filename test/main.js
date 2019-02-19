import Vue from 'vue';
import vueRouter from 'vue-router';
import _ from 'lodash';
import $ from 'jquery';

import './css/default.css';
import './font/iconfont.css';
import store from './store/index';
import App from './App.vue';
import { router } from './router';

Vue.use(vueRouter);

let root = new Vue({
	router: router,
	store: store,
	render(createElement){
		return createElement('App');
	},
	components: { App },
}).$mount('#app');

console.log(_.join(['hello', 'lodash'], '~'));
 $('body').ready(()=>{
 	console.log(_.join(['hello', 'jquery'], '~'));
 })



