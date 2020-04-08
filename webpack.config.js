var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
const PrerenderSPAPlugin = require('prerender-spa-plugin')
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const fs = require('fs')

let langs = []
fs.readdirSync(path.join(__dirname, 'src/locales')).forEach(file => {
  langs.push(file.replace('.json', ''))
})

const routes = ['/', '/about/', '/contact/']
const langsPrerender = []
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
  module.exports.plugins = (module.exports.plugins || []).concat([
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
  ]).concat(langsPrerender)

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
