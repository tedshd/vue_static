import Vue from 'vue'
import VueI18n from 'vue-i18n'
import store from './store'

Vue.use(VueI18n)

function loadLocaleMessages () {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
  const messages = {}
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      messages[locale] = locales(key)
    }
  })
  return messages
}

let langString = location.pathname.split('/')[1]

if (!window['__PRERENDER_INJECTED__']) {
  if (store.state.langD4) {
    langString = store.state.langD4
  } else {
    if (!store.state.langList[langString]) {
      let langD4 = store.state.langD4
      let lang = navigator.language
      if (lang === 'zh-TW' ||
        lang === 'zh-CN') {
        langD4 = lang
      } else {
        lang = lang.split('-')[0]
      }
      location.href = '/' + store.state.langList[lang]
    }
  }
}


if (window['__PRERENDER_INJECTED__'] && window['__PRERENDER_INJECTED__'].lang) {
  Vue.config.lang = window['__PRERENDER_INJECTED__'].lang
} else {
  Vue.config.lang = langString
}

const html = document.documentElement // returns the html tag
html.setAttribute('lang', Vue.config.lang)

export default new VueI18n({
  locale: Vue.config.lang,
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE,
  messages: loadLocaleMessages()
})
