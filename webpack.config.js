var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
const PrerenderSPAPlugin = require('prerender-spa-plugin')
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const langs = ['zh-TW', 'en']
const routes = ['/', '/about', '/contact']
const langsPrerender = []
for (let index = 0; index < langs.length; index++) {
  let lang = langs[index];
  langsPrerender.push(

    new PrerenderSPAPlugin({
      staticDir: path.join(__dirname, 'dist'),
      routes: routes,
      postProcess (renderedRoute) {
        // 若是首页就打包成相应的html文件
        if (renderedRoute.route === '/') {
          const fileName = lang ? `${lang}.html` : `index.html`;
          renderedRoute.outputPath = path.join(__dirname, 'dist', fileName);
        } else {
          const fileName = lang
            ? `${renderedRoute.route}.${lang}.html`
            : `${renderedRoute.route}.html`;
          renderedRoute.outputPath = path.join(__dirname, 'dist', renderedRoute.route, fileName);
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
        loader: 'vue-loader'
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
          'css-loader'
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
