import Vue from 'vue'
import Router from 'vue-router'
import store from './store'

import Home from './views/Home.vue'
import About from './views/About.vue'

Vue.use(Router)
console.log(process.env.BASE_URL);

var routesArray = [];

var langList = store.state.langList

console.log(langList);

function urlHome () {
  var tmpArray = []
  for (let x in langList) {
    var tmpObj = {
      path: '/' + x + '/',
      name: 'home',
      component: Home
    }
    tmpArray.push(tmpObj)
  }
  return tmpArray;
}

function urlAbout () {
  var tmpArray = []
  for (let x in langList) {
    var tmpObj = {
      path: '/' + x + '/about/',
      name: 'about',
      component: About
    }
    tmpArray.push(tmpObj)
  }
  return tmpArray;
}

routesArray = [].concat(urlHome()).concat(urlAbout())

console.log(urlHome(), urlAbout(), routesArray)

export function createRouter () {
  return new Router({

    mode: 'history',
    base: process.env.BASE_URL,
    routes: routesArray
  })
}
