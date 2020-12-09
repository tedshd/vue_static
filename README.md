# vue_static
build vue static site

## Feature

* Static page
* i18n support
* SEO support
* CSS L4 support
* CSS import support
* Auto generate sitemap


## Usage

### Config

#### webpack.config.js

```javascript
const routes = ['/', '/about/', '/contact/']
const host = 'https://www.example.com'
const releaseDir = 'dist'
const langs = ['en', 'zh-TW']
```

First language in langs is default language

### Single language

#### webpack.config.js

```javascript
const langs = ['en']
```

#### src/i18n.js

```javascript
const langs = ['en']
```

### Multi language
