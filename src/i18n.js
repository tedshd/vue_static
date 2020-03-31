import Vue from 'vue'
import VueI18n from 'vue-i18n'

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

function urlUpdateQuery (url, query) {
  let u = ''
  let q = ''
  const obj = {}
  if (url) {
    u = new URL(url)
  } else {
    u = location
  }
  if (!query) {
    console.error('urlUpdateQuery: query is not set')
    return
  }
  if (typeof query !== 'object') {
    console.error('urlUpdateQuery: query is not object')
    return
  }
  if (u.search) {
    var qArray = u.search.slice(1).split('&')
    for (var i = 0; i < qArray.length; i++) {
      var tmp = qArray[i].split('=')
      obj[tmp[0]] = tmp[1]
    }
  }
  for (var x in query) {
    obj[x] = query[x]
  }
  for (var y in obj) {
    q = q + '&' + y + '=' + obj[y]
  }
  q = '?' + q.slice(1)
  return u.protocol + '//' + u.host + u.pathname + q + u.hash
}
function getQueryString (name) {
  name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]')
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
  const results = regex.exec(location.search)
  return results == null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

var langList = {
  ar: 'العربية',
  bg: 'български език',
  cs: 'čeština',
  de: 'Deutsch',
  el: 'ελληνικά',
  en: 'English',
  es: 'Español',
  fa: 'فارسی',
  fr: 'français',
  he: 'עברית',
  hi: 'हिन्दी',
  hu: 'magyar',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  ms: 'Bahasa Melayu',
  nl: 'Nederlands',
  no: 'Norsk',
  pl: 'język polski',
  pt: 'Português',
  ro: 'Română',
  ru: 'русский',
  sr: 'српски језик',
  sv: 'Svenska',
  th: 'ไทย',
  tr: 'Türkçe',
  vi: 'Tiếng Việt',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文'
}
const langstring = getQueryString('hl')

if (!langList[langstring]) {
  let langD4 = 'en'
  let lang = navigator.language
  if (lang === 'zh-TW' ||
    lang === 'zh-CN') {
    langD4 = lang
  } else {
    lang = lang.split('-')[0]
    if (langList[lang]) {
      langD4 = lang
    }
  }
  location.href = urlUpdateQuery(location, {
    hl: langD4
  })
}

Vue.config.lang = langstring

const html = document.documentElement // returns the html tag
html.setAttribute('lang', langstring)

export default new VueI18n({
  locale: Vue.config.lang || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages()
})
