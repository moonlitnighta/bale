import VueRouter from 'vue-router';

import home from './home.vue';
import login from './login.vue';

const routes = [
  	 {name:'home' , path: '/home', component: home},
  	 {name:'login' , path: '/login', component: login}
]
const router = new VueRouter({
	  mode: 'hash',
	  history: false,
	  routes: routes,
});

router.beforeEach((to, from, next) => {
	if(to.path == '/'){
	  	 next({path:'login'});
	}else{
	  	 next();
	}
});

export {routes , router}
