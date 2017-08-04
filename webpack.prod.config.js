const Path = require('path');
const Webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const ExtractLess = new ExtractTextPlugin({
  allChunks: true,
  filename: "dist/style/dragSort.css",
  disable: process.env.NODE_ENV === "development"
})

const config = {
  entry: {
    main: Path.resolve(__dirname, 'src/main.js')
  },
  output: {
    filename: 'dist/js/dragSort.js'
  },
  stats: {
    errors: true, errorDetails: true, warnings: false, chunks: false
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
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
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
    new Webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new Webpack.DefinePlugin({
      'process.env': {'NODE_ENV': JSON.stringify('production')}
    }),
    // new Webpack.optimize.UglifyJsPlugin({
    //   beautify: false,
    //   compress: true,
    //   comments: false
    // }),
    new Webpack.NoEmitOnErrorsPlugin()
  ]
}

module.exports = config;
