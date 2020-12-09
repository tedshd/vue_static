const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const PrerenderSPAPlugin = require('prerender-spa-plugin')
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const { SitemapStream, streamToPromise } = require('sitemap')

const routes = ['/', '/about/', '/contact/']
const host = 'https://www.example.com'
const releaseDir = 'dist'
const langs = ['en', 'zh-TW']
// const langs = ['en']

let sitemapUrls = []


// generate i18n router for i18n page
const langsPrerender = []

// check generate i18n or single lang page
if (langs.length > 1) {
  for (let index = 0; index < langs.length; index++) {
    let lang = langs[index]
    let langRoutes = Array.from(routes)

    // rebuild routes
    for (let x = 0; x < langRoutes.length; x++) {
      langRoutes[x] = '/' + lang + langRoutes[x]
    }
    // first lang is d4 lang
    if (index === 0) {
      langsPrerenderUpdate(lang, routes)
    }
    langsPrerenderUpdate(lang, langRoutes)
  }
} else {
  langsPrerenderUpdate(langs[0], routes)
}

function langsPrerenderUpdate (lang, langRoutes) {
  langsPrerender.push(

    new PrerenderSPAPlugin({
      staticDir: path.join(__dirname, releaseDir),
      routes: langRoutes,
      postProcess (renderedRoute) {
        if (renderedRoute.route === '/') {
          renderedRoute.outputPath = path.join(__dirname, releaseDir, 'index.html');
        } else {
          renderedRoute.outputPath = path.join(__dirname, releaseDir, renderedRoute.route, 'index.html');
        }
        // console.log('renderedRoute')
        console.log(renderedRoute)
        return renderedRoute;
      },

      renderer: new Renderer({
        injectProperty: '__PRERENDER_INJECTED__',
        inject: {
          isPrerender: true,
          lang: lang // 多语言输出
        },
        headless: true,
        renderAfterDocumentEvent: 'render-event' // 和 main.js 裡面的事件一致
      })
    })
  )
}

function sitemapGenerate () {
  for (let index = 0; index < routes.length; index++) {
    sitemapUrls.push(host + routes[index]);
  }
  sitemapUrls = sitemapUrls.map(url => {
    const isMao = url.indexOf('#') > -1;
    var xmlData = {
      url: isMao ? url.split('#')[0] : url,
      changefreq: 'weekly',
      priority: 0.5,
      lastmod: new Date().toLocaleDateString()
    };
    if (langs.length > 1) {
      xmlData['links'] = [];
      for (let i = 0; i < langs.length; i++) {
        var tmpObj = {
          lang: langs[i],
          url: host + '/' + langs[i] + url.replace(host, '')
        };
        xmlData['links'].push(tmpObj);
      }
    }
    return xmlData
  });

  const smStream = new SitemapStream({
    hostname: host,
    lastmodDateOnly: false, // print date not time
    xmlns: { // trim the xml namespace
      news: false, // flip to false to omit the xml namespace for news
      xhtml: true,
      image: false,
      video: false,
    }
  })

  for (let index = 0; index < sitemapUrls.length; index++) {
    smStream.write(sitemapUrls[index]);
  }
  smStream.end()

  streamToPromise(smStream).then(function (xml) {
    // console.log(xml.toString())
    if (!fs.existsSync(path.join(__dirname, releaseDir))) {
      fs.mkdirSync(path.join(__dirname, releaseDir));
    }
    fs.writeFileSync(path.join(__dirname, releaseDir, '/sitemap.xml'), xml.toString());
  })
}

module.exports = {
  mode: process.env.NODE_ENV,
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, releaseDir),
    publicPath: '/',
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          'vue-loader'
        ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              // minimize: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                require('postcss-import')(),
                require('postcss-apply')(),
                require('postcss-css-variables')(),
                require('cssnano')()
                // require('postcss-preset-env')(),
              ]
            }
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: false,
  },
  devtool: '#eval-source-map',
  plugins: [
    new VueLoaderPlugin(),
  ]
}
if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  module.exports.plugins = (module.exports.plugins || [])
    .concat([
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"'
        }
      }),
      new HtmlWebpackPlugin({
        title: 'PRODUCTION prerender-spa-plugin',
        template: 'index.html',
        filename: path.resolve(__dirname, 'dist/index.html'),
        favicon: 'favicon.ico'
      }),
      new CopyPlugin([
        {
          from: 'src/assets',
          to: './'
        },
        {
          from: '*.jpg',
          to: './'
        },
        {
          from: '*.png',
          to: './'
        },
        {
          from: '*.icon',
          to: './'
        },
        {
          from: '*.ico',
          to: './'
        },
        {
          from: '*.svg',
          to: './'
        },
      ])
    ])
    .concat(langsPrerender)
  sitemapGenerate()

} else {
  // NODE_ENV === 'development'
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    }),
    new HtmlWebpackPlugin({
      title: 'DEVELOPMENT prerender-spa-plugin',
      template: 'index.html',
      filename: 'index.html',
      favicon: 'favicon.ico'
    }),
  ])
}
