import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Cookie from 'js-cookie'
import { getPermission } from './permission'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import './common/scss/common.css';
Vue.use(ElementUI);
// Vue.use(Vuex);

// import '@/permission' // permission control
import filters from './common/js/filters.js'
for (let item in filters) {
  Vue.filter(item, filters[item])
}
Vue.config.productionTip = false

// 引入常用的组件
import tableList from '@/components/tableList'
Vue.component('tableList',tableList);
import pagePagination from '@/components/pagePagination'
Vue.component('pagePagination',pagePagination);
import deleteDialog from '@/components/deleteDialog'
Vue.component('deleteDialog', deleteDialog);
if(sessionStorage.getItem('username')){
  router.onReady(() => {
    getPermission()
  });
}
const whiteLoginList = ['/login']
router.beforeEach((to, from, next) => {
  if(whiteLoginList.includes(to.path) || sessionStorage.getItem('username')){
    next();
  }else{
    next('/login')
  }
})

new Vue({
  el: '#app',
  router,
  store,
  Cookie,
  components: { App },
  template: '<App/>'
})
