const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './src/file/index.js'),
  devtool: false,
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.png$/,
        use: [
          {
            loader: path.resolve(__dirname, '../loaders/file-loader/index.js'),
          },
        ],
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin()],
};
