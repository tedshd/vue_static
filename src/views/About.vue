<template>
  <div class="about">
    <h2>This is an about page</h2>
    <h2>{{ $t('message') }}</h2>
    <h3>{{ lang }}</h3>
  </div>
</template>

<script>

import store from "./../store";

function hreflangInit(t) {
  var tmpArray = [];
  var xDefault = {
    rel: 'alternate',
    hreflang: 'x-default',
    href: store.state.url + '/' + t.locale
  };
  tmpArray.push(xDefault);
  for (let x in store.state.langList) {
    var tmpObj = {
      rel: 'alternate',
      hreflang: x,
      href: store.state.url + '/' + x
    };
    tmpArray.push(tmpObj);
  }
  console.log("tmpArray", tmpArray);
  return tmpArray
}

let links = function (t) {
  let tmpLinks = [
    {
      'rel': 'canonical',
      'href': store.state.url + '/' + t.locale
    },
    {
      'rel': 'alternate',
      'media': 'only screen and (max-width: 640px)',
      'href': store.state.url + '/' + t.locale
    },
    {
      'rel': 'alternate',
      'media': 'handheld',
      'href': store.state.url + '/' + t.locale
    }
  ]
  return tmpLinks.concat(hreflangInit(t))
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
          'content': store.state.url + '/' + this.$i18n.locale
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
      link: links(this.$i18n)
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
