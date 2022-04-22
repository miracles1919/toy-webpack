const path = require('path');
const webpack = require('webpack');
const { createFsFromVolume, Volume } = require('memfs');

module.exports = function (entry, loaderOptions = {}, config = {}) {
  const fullConfig = {
    mode: 'development',
    devtool: false,
    entry,
    output: {
      path: path.resolve(__dirname, '../outputs'),
      filename: '[name].bundle.js',
      chunkFilename: '[name].chunk.js',
      publicPath: '',
    },
    plugins: [],

    ...config,
  };

  const compiler = webpack(fullConfig);

  if (!config.outputFileSystem) {
    compiler.outputFileSystem = createFsFromVolume(new Volume());
  }

  return compiler;
};
