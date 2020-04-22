var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
const PrerenderSPAPlugin = require('prerender-spa-plugin')
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const fs = require('fs')

const { SitemapStream, streamToPromise } = require('sitemap');
const siteMapUrls = [];
const resolve = dir => path.join(__dirname, dir);

let langs = []
fs.readdirSync(path.join(__dirname, 'src/locales')).forEach(file => {
  langs.push(file.replace('.json', ''))
})

const routes = ['/', '/about/', '/contact/']
const langsPrerender = []
const sitemapGenerate = []
for (let index = 0; index < langs.length; index++) {
  let lang = langs[index];
  let langRoutes = Array.from(routes);
  for (let x = 0; x < langRoutes.length; x++) {
    langRoutes[x] = '/' + lang + langRoutes[x];
  }
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
          // 多语言输出
          lang: lang
        },
        headless: true,
        renderAfterDocumentEvent: 'render-event'
      })
    })
  )
}
sitemapGenerate.push(
  new PrerenderSPAPlugin({
    staticDir: resolve('dist'),
    routes,
    postProcess (context) {
      //content 參數
      const { originalRoute, route, html } = context;
      //全局獲取href內容正則
      const reg = /(?<=<a\s*.*href=")[^"]*(?=")/g;
      //過濾不包含http或https開頭的url
      const urlList = html.match(reg).filter(url => url.startsWith('http'));
      //將路由添加到全局sitemap容器
      siteMapUrls.push(originalRoute);
      //將html中的外鏈添加到全局sitemap容器
      if (urlList.length) {
        urlList.forEach(url => siteMapUrls.push(url));
      }
      //噹噹前路由為最後一個生成路由時
      if (route === routes[routes.length - 1]) {
        //去除重複的鏈接
        let currentSiteMapUrls = Array.from(new Set(siteMapUrls));
        //過濾掉鏈接中的錨點後內容
        currentSiteMapUrls = currentSiteMapUrls.map(url => {
          const isMao = url.indexOf('#') > -1;
          //生成sitemap所需數據，具體參數參詳sitemap.js官網
          return { url: isMao ? url.split('#')[0] : url, changefreq: 'weekly', priority: 0.6, lastmod: new Date().toLocaleDateString() }
        });
        console.log(currentSiteMapUrls)

        const smStream = new SitemapStream({
          hostname: 'http://www.mywebsite.com',
          // xslUrl: "https://example.com/style.xsl",
          lastmodDateOnly: false, // print date not time
        })
        // coalesce stream to value
        // alternatively you can pipe to another stream

        for (let index = 0; index < currentSiteMapUrls.length; index++) {
          smStream.write(currentSiteMapUrls[index]);
        }
        smStream.end()

        streamToPromise(smStream).then(function (xml) {
          console.log(xml.toString())
          fs.writeFileSync(resolve('dist/sitemap.xml'), xml.toString());
        })
        //生成siteMap文件
      }
      //返回當前contet對象

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
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                require('postcss-import')(),
                require('postcss-apply')(),
                require('postcss-css-variables')()
                // require('postcss-preset-env')(),
                // require('cssnano')()
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
    // .concat(langsPrerender)
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
