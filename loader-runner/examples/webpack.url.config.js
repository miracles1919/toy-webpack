const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './src/url/index.js'),
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
            loader: path.resolve(__dirname, '../loaders/url-loader/index.js'),
            options: {
              limit: 2048,
              fallback: path.resolve(
                __dirname,
                '../loaders/file-loader/index.js'
              ),
            },
          },
        ],
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin()],
};
