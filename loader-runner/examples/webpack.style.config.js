const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './src/style/index.js'),
  devtool: false,
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: path.resolve(__dirname, '../loaders/style-loader/index.js'),
          },
          'css-loader',
        ],
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin()],
};
