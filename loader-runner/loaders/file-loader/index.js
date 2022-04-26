const { interpolateName } = require('loader-utils');

/**
 * 这里有个文件名的问题
 * xx.png 在经过webpack处理后变成了 [hash].png
 * 可以通过loader-utils提供的interpolateName获取资源写出的路径以及名称
 */
function fileLoader(source) {
  const options = this.getOptions() || {};

  const filename = options.filename;

  // https://github.com/webpack/loader-utils#interpolatename
  const targetFilename = interpolateName(this, filename, {
    content: source,
  });

  console.log('targetFilename', targetFilename);

  this.emitFile(targetFilename, source);

  return `module.exports = ${JSON.stringify(targetFilename)}`;
}

fileLoader.raw = true;

module.exports = fileLoader;
