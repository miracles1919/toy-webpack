const webpack = require('./webpack');
const config = require('../examples/webpack.config');

// 步骤1: 初始化参数
// 步骤2: 初始化compiler
const compiler = webpack(config);

compiler.run((err, status) => {
  if (err) {
    console.log(err);
  }
});
