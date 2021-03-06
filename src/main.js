// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
window._ = require('lodash');
window.ws = null;

import Vue from 'vue'
import App from './App'
import router from './router'
import vueBeauty from 'vue-beauty'
import store from './store'
import * as filters from './util/filter'

import 'vue-beauty/package/style/vue-beauty.min.css'


Object.keys(filters).forEach(k => Vue.filter(k, filters[k])); //注册过滤器

Vue.use(vueBeauty);
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
