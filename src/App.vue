<template>
  <div id="app">
    <img src="./assets/logo.png">
    <h1>{{ msg }}</h1>
    <h2>{{ $t('message') }}</h2>
    <p>
      <router-link :to="{path: '/' + lang }">Home</router-link>
      <router-link :to="{path: '/about/' + lang }">About</router-link>
      <router-link :to="{path: '/contact/' + lang}" >Contact</router-link>
    </p>
    <router-view></router-view>
  </div>
</template>

<script>

import store from './store'

var tmpLinks = []

function hreflangInit() {
  var tmpArray = []
  var xDefault = {
    'rel': 'alternate',
    'hreflang': 'x-default',
    'href': ''
  }
  tmpArray.push(xDefault)
  for (let x in store.state.langList) {
    var tmpObj = {
      'rel': 'alternate',
      'hreflang': x,
      'href': ''
    }
    tmpArray.push(tmpObj)
  }
  console.log('tmpArray', tmpArray)
  return tmpArray
}

var links = tmpLinks.concat(hreflangInit())

export default {
  name: 'app',
  metaInfo: {
    title: 'My Example App', // set a title
    meta: [
      {                 // set meta
        name: 'keyWords',
        content: 'My Example App'
      },
      {
        name: 'description',
        content: 'this is desc'
      }
    ],
    link: links
  },
  data () {
  console.log(store.state);
    return {
      msg: 'Welcome to your prerender-spa-plugin Vuejs 2.0 demo!',
      lang: this.$i18n.locale
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
