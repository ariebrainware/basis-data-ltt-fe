const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development', // change to 'production' for production builds
  entry: './assets/js/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Optional: If you plan to use Babel
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html' // use your index.html as template
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "assets/js/color-modes.js",
          to: "assets/js/color-modes.js"
        },
        {
          from: "assets/js/main.js",
          to: "assets/js/main.js"
        },
        {
          from: "assets/dist/js/bootstrap.bundle.min.js",
          to: "assets/dist/js/bootstrap.bundle.min.js"
        },
        {
          from: "assets/dist/css/main.css",
          to: "css/main.css"
        },
        {
          from: "assets/brand/bootstrap-logo.svg",
          to: "assets/brand/bootstrap-logo.svg"
        },
      ]
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    open: {
      app: {
        name: 'google-chrome'
      }
    },
    port: 8080,
    hot: true
  }
};