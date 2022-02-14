const path = require('path');
const PluginA = require('../plugins/pluginA');
const PluginB = require('../plugins/PluginB');

module.exports = {
  mode: 'development',

  entry: {
    pageA: path.resolve(__dirname, './src/pageA.js'),
    pageB: path.resolve(__dirname, './src/pageB.js'),
  },

  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js',
  },

  plugins: [new PluginA(), new PluginB()],

  module: {
    rules: [
      {
        test: /\.js/,
        // use: ['loaderA'],
        loader: path.resolve(__dirname, '../loaders/loaderA.js'),
      },
      {
        test: /\.js/,
        use: [path.resolve(__dirname, '../loaders/loaderB.js')],
      },
    ],
  },

  resolve: {
    extensions: ['.js'],
  },
};
