const Path = require('path');
const Webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const ExtractLess = new ExtractTextPlugin({
  allChunks: true,
  filename: "dist/style/dragSort.css",
  disable: process.env.NODE_ENV === "development"
});

const PORT = 9091;

const config = {
  entry: [
    // 开启 React 代码的模块热替换(HMR)
    'webpack-dev-server/client?http://localhost:' + PORT,
    // 为 webpack-dev-server 的环境打包代码
    // 然后连接到指定服务器域名与端口
    'webpack/hot/only-dev-server',
    // 为热替换(HMR)打包好代码
    // only- 意味着只有成功更新运行代码才会执行热替换(HMR)
    Path.resolve(__dirname, 'src/main.js')
  ],
  devtool: 'inline-source-map',
  output: {
    filename: 'dist/js/dragSort.js'
  },
  resolve: {
    modules: [Path.resolve(__dirname, 'node_modules')],
    extensions: ['.js']
  },
  module: {
    noParse: /node_modules\/(jquey|moment|chart\.js)/,
    rules: [
      {
        test: /\.css/,
        use: ExtractLess.extract({
          fallback: "style-loader",
          use: [{loader: "css-loader"}]
        })
      }, {
        test: /\.less$/,
        use: ExtractLess.extract({
          fallback: "style-loader",
          use: [{
              loader: "css-loader"
            }, {
              loader: "less-loader"
          }]
        })
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }, {
        test: /\.(jpe?g|png|gif|svg)(\?\S*)?$/i,
        use: ['url-loader?limit=10000&name=[name].[ext]&outputPath=public/images/']
      },
      // {
      //   test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
      //   use: ['url-loader?limit=30000&name=[name].[ext]&outputPath=assets/fonts/']
      // }
    ]
  },
  plugins: [
    ExtractLess,
    new Webpack.optimize.ModuleConcatenationPlugin(),
    new Webpack.NamedModulesPlugin(),
    new Webpack.HotModuleReplacementPlugin(),
    // 开启全局的模块热替换(HMR)
    new Webpack.HashedModuleIdsPlugin(),
    new Webpack.DefinePlugin({
      'process.env': {'NODE_ENV': JSON.stringify('development')}
    })
  ],
  devServer: {
    hot: true,
    port: PORT,
    host: 'localhost',
    open: true,
    historyApiFallback: true,
    stats: {errors: true, errorDetails: true, warnings: false, chunks: false},
    publicPath: "/",
    overlay: {warnings: true, errors: true},
    openPage: ''
  }
}

module.exports = config;
