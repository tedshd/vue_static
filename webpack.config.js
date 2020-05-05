const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const PrerenderSPAPlugin = require('prerender-spa-plugin')
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const { SitemapStream, streamToPromise } = require('sitemap')

const hostUrl = ''
const routes = ['/', '/about/', '/contact/']

const sitemapUrls = []
const sitemapGenerate = []
// const resolve = dir => path.join(__dirname, dir);

// get i18n lang
let langs = ['en', 'zh-TW']

fs.readdirSync(path.join(__dirname, 'src/locales')).forEach(file => {
  langs.push(file.replace('.json', ''))
})

// generate i18n router for i18n page
const langsPrerender = []

for (let index = 0; index < langs.length; index++) {
  let lang = langs[index]
  let langRoutes = Array.from(routes)

  for (let x = 0; x < langRoutes.length; x++) {
    langRoutes[x] = '/' + lang + langRoutes[x]
  }

  langsPrerenderUpdate(lang, langRoutes)
}

function langsPrerenderUpdate (lang, langRoutes) {
  langsPrerender.push(

    new PrerenderSPAPlugin({
      staticDir: path.join(__dirname, 'dist'),
      routes: langRoutes,
      postProcess (renderedRoute) {
        console.log('build router:', renderedRoute);
        if (renderedRoute.route === '/') {
          // const fileName = lang ? `${lang}.html` : `index.html`;
          let dir = 'dist'
          renderedRoute.outputPath = path.join(__dirname, dir, 'index.html');
        } else {
          // const fileName = lang
          //   ? `${renderedRoute.route}.${lang}.html`
          //   : `${renderedRoute.route}.html`;
          let dir = 'dist'
          renderedRoute.outputPath = path.join(__dirname, dir, renderedRoute.route, 'index.html');
        }
        console.log('renderedRoute')
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
sitemapGenerate.push(
  new PrerenderSPAPlugin({
    staticDir: path.join(__dirname, 'dist'),
    routes,
    postProcess (context) {
      const { originalRoute, route, html } = context;
      const reg = /(?<=<a\s*.*href=")[^"]*(?=")/g;
      const urlList = html.match(reg).filter(url => url.startsWith('http'));
      sitemapUrls.push(originalRoute);
      if (urlList.length) {
        urlList.forEach(url => sitemapUrls.push(url));
      }
      if (route === routes[routes.length - 1]) {
        let currentSitemapUrls = Array.from(new Set(sitemapUrls));
        currentSitemapUrls = currentSitemapUrls.map(url => {
          const isMao = url.indexOf('#') > -1;
          return { url: isMao ? url.split('#')[0] : url, changefreq: 'weekly', priority: 0.1, lastmod: new Date().toLocaleDateString() }
        });
        console.log(currentSitemapUrls)

        const smStream = new SitemapStream({
          // TODO Modify it
          hostname: 'http://www.mywebsite.com',
          lastmodDateOnly: false, // print date not time
        })

        for (let index = 0; index < currentSitemapUrls.length; index++) {
          smStream.write(currentSitemapUrls[index]);
        }
        smStream.end()

        streamToPromise(smStream).then(function (xml) {
          console.log(xml.toString())
          fs.writeFileSync(path.join(__dirname, 'dist/sitemap.xml'), xml.toString());
        })
      }
      return context
    },
    renderer: new Renderer({
      inject: {},
      //在 main.js 中 document.dispatchEvent(new Event('render-event'))，兩者的事件名稱要對應上。
      //render-event的作用就是在render-event事件執行後執行preRender
      renderAfterDocumentEvent: 'render-event',
      //puppeteer參數，標籤意思：完全信任在Chrome中打開的內容
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  })
)



module.exports = {
  mode: process.env.NODE_ENV,
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
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
      })
    ])
    .concat(langsPrerender)
    .concat(sitemapGenerate)

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
