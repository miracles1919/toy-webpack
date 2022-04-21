const fs = require('fs');
const path = require('path');
// const { runLoaders } = require('loader-runner');
const { runLoaders } = require('./core/index')

// 模块路径
const filePath = path.resolve(__dirname, './app.js');

// 模拟内容
const request = 'inline1-loader!inline2-loader!./app.js';


// 模拟webpack配置
const rules = [
  {
    test: /\.js$/,
    use: ['normal-loader'],
  },
  {
    test: /\.js$/,
    use: ['pre-loader'],
    enforce: 'pre',
  },
  {
    test: /\.js$/,
    use: ['post-loader'],
    enforce: 'post',
  },
];

// 提取inline loader
const parts = request.replace(/^-?!+/, '').split('!');

const sourcePath = parts.pop();

const inlineLoaders = parts;

const preLoaders = [],
  normalLoaders = [],
  postLoaders = [];

rules.forEach((rule) => {
  if (rule.test.test(sourcePath)) {
    switch (rule.enforce) {
      case 'pre':
        preLoaders.push(...rule.use);
        break;
      case 'post':
        postLoaders.push(...rule.use);
        break;

      default:
        normalLoaders.push(...rule.use);
        break;
    }
  }
});

/**
 * 根据inlineLoader的规则过滤需要的loader
 */
let loaders = [];

if (request.startsWith('!!')) {
  loaders.push(...inlineLoaders);
} else if (request.startsWith('-!')) {
  loaders.push(...postLoaders, ...inlineLoaders);
} else if (request.startsWith('!')) {
  loaders.push(...postLoaders, ...inlineLoaders, ...preLoaders);
} else {
  loaders.push(
    ...[...postLoaders, ...inlineLoaders, ...normalLoaders, ...preLoaders]
  );
}

// 模拟webpack中的路径解析
const resolveLoader = (loader) => path.resolve(__dirname, './loaders', loader);

loaders = loaders.map(resolveLoader);

runLoaders(
  {
    resource: filePath,
    loaders,
    context: {
      // 传递上下文
      name: 'miralces',
    },
    readResouce: fs.readFile.bind(fs),
    // processResouce
  },
  (err, res) => {
    console.log('err', err);
    console.log('res', res);
  }
);
