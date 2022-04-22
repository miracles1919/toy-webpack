// 移植自style-loader
// https://github.com/webpack-contrib/style-loader/blob/master/test/helpers/index.js
const compile = require('./compile');
const getCompiler = require('./getCompiler');
const runInJsDom = require('./runInJsDom');

module.exports = {
  compile,
  getCompiler,
  runInJsDom
};
