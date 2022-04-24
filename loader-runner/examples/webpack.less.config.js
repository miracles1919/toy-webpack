const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './src/less/index.js'),
  devtool: false,
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          {
            loader: path.resolve(__dirname, '../loaders/style-loader/index.js'),
          },
          'css-loader',
          {
            loader: path.resolve(__dirname, '../loaders/less-loader/index.js'),
          },
        ],
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin()],
};
