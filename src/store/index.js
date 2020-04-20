import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    url: '',
    langD4: 'en',
    langList: {
      // ar: 'العربية',
      // bg: 'български език',
      // cs: 'čeština',
      // de: 'Deutsch',
      // el: 'ελληνικά',
      // en: 'English',
      // es: 'Español',
      // fa: 'فارسی',
      // fr: 'français',
      // he: 'עברית',
      // hi: 'हिन्दी',
      // hu: 'magyar',
      // id: 'Bahasa Indonesia',
      // it: 'Italiano',
      // ja: '日本語',
      // ko: '한국어',
      // ms: 'Bahasa Melayu',
      // nl: 'Nederlands',
      // no: 'Norsk',
      // pl: 'język polski',
      // pt: 'Português',
      // ro: 'Română',
      // ru: 'русский',
      // sr: 'српски језик',
      // sv: 'Svenska',
      // th: 'ไทย',
      // tr: 'Türkçe',
      // vi: 'Tiếng Việt',
      // 'zh-CN': '简体中文',
      // 'zh-TW': '繁體中文'
    }
  }
})
