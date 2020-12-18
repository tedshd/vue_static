<template>
  <div class="about">
    <h2>This is an about page</h2>
    <h2>{{ $t('message') }}</h2>
    <h3>{{ lang }}</h3>
    <h4>i18nPath</h4>
    <p>{{i18nPath}}</p>
    <p>Now you use {{browser}}</p>
  </div>
</template>

<script>

import store from "./../store";
import { isMobile, browserName } from 'mobile-device-detect';

export default {
  name: 'about',
  mounted() {
    console.log(this.$route)
    console.log('mobile-device-detect', isMobile);
  },
  data () {
    return {
      obj: '',
      i18nPath: (Object.keys(store.state.langList).length) ?  '/' + this.$i18n.locale :  '',
      msg: 'Welcome to your prerender-spa-plugin Vuejs 2.0 demo!',
      lang: this.$i18n.locale,
      browser: browserName
    }
  }
}
</script>
