import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import i18n from './i18n'
import MetaInfo from 'vue-meta-info'

Vue.use(VueRouter)

Vue.use(MetaInfo)

const Home = { template: '<div><h2>Home Page</h2></div>' }
const About = { template: '<div><h2>About Page</h2></div>' }
const Contact = { template: '<div><h2>Contact Page</h2></div>' }

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/contact', component: Contact }
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

new Vue({
  el: '#app',
  router,
  render: h => h(App),
  i18n,
  mounted () {
    // You'll need this for renderAfterDocumentEvent.
    document.dispatchEvent(new Event('render-event'))
  }
})
