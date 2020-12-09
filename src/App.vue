<template>
  <div id="app">
    <img src="./assets/logo.png">
    <h1>{{ msg }}</h1>
    <h2>{{ $t('message') }}</h2>
    <h3>{{lang}}</h3>
    <p>
      <router-link :to="{path:  i18nPath + '/' }">Home</router-link>
      <router-link :to="{path: i18nPath + '/about/' }">About</router-link>
      <router-link :to="{path: i18nPath + '/contact/'}" >Contact</router-link>
    </p>
    <router-view></router-view>
  </div>
</template>

<script>

import store from './store';

function hreflangInit(locale, path) {
  var tmpArray = [];
  var xDefault = {
    rel: 'alternate',
    hreflang: 'x-default',
    href: store.state.url + path
  };
  tmpArray.push(xDefault);
  for (let x in store.state.langList) {
    var tmpObj = {
      rel: 'alternate',
      hreflang: x,
      href: store.state.url + '/' + x + '/' + path.replace(path.match(/\/\w+\/?/), '')
    };
    tmpArray.push(tmpObj);
  }
  return tmpArray
}

let links = function (locale, path) {
  let tmpLinks = [
    {
      'rel': 'canonical',
      'href': store.state.url + path
    },
    {
      'rel': 'alternate',
      'media': 'only screen and (max-width: 640px)',
      'href': store.state.url + path
    },
    {
      'rel': 'alternate',
      'media': 'handheld',
      'href': store.state.url + path
    }
  ]
  return tmpLinks.concat(hreflangInit(locale, path))
}

export default {
  name: 'app',
  metaInfo() {
    return {
      title: this.$i18n.t('title'), // set a title
      meta: [
        {
          'http-equiv': 'content-language',
          'content': this.$i18n.locale
        },
        {
          'property': 'og:title',
          'content': this.$i18n.t('title')
        },
        {
          'property': 'og:url',
          'content': store.state.url + this.$route.path
        },
        {
          'property': 'og:image',
          'content': ''
        },
        {
          'property': 'og:image:width',
          'content': '600'
        },
        {
          'property': 'og:image:height',
          'content': '315'
        },
        {
          'property': 'og:type',
          'content': 'website'
        },
        {
          'property': 'og:site_name',
          'content': 'Bizny'
        },
        {
          'name': 'twitter:card',
          'content': 'summary'
        },
        {
          'name': 'twitter:title',
          'content': this.$i18n.t('title')
        },
        {
          'name': 'twitter:description',
          'content': this.$i18n.t('description')
        },
        {
          'name': 'twitter:image',
          'content': ''
        },
        {
          'property': 'og:description',
          'content': this.$i18n.t('description')
        },
        {
          'name': 'description',
          'content': this.$i18n.t('description')
        }
      ],
      link: links(this.$i18n.locale, this.$route.path)
    }
  },
  mounted() {
  },
  data () {
    return {
      obj: '',
      i18nPath: (Object.keys(store.state.langList).length) ?  '/' + this.$i18n.locale :  '',
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
