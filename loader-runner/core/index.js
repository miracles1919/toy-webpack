const fs = require('fs');

function runLoaders(options, callback) {
  // 处理的资源绝对路径
  const resource = options.resource || '';

  // 处理的所有loaders 组成的绝对路径数组
  let loaders = options.loaders;

  // loader执行上下文
  const loaderContext = options.context || {};

  // 读取资源内容的方法
  const readResource = options.readResource || fs.readFile.bind(fs);

  // 根据loaders路径数组创建loaders对象
  loaders = loaders.map(createLoaderObject);

  loaderContext.resourcePath = resource;
  loaderContext.readResource = readResource;
  loaderContext.loaderIndex = 0;
  loaderContext.loaders = loaders;
  loaderContext.data = null;

  // 异步
  loaderContext.async = null;
  loaderContext.callback = null;

  // 转化为inline-loader的形式
  Object.defineProperty(loaderContext, 'request', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders
        .map((item) => item.request)
        .concat(loaderContext.resourcePath || '')
        .join('!');
    },
  });

  // 保存剩下的请求 不包含自身（以LoaderIndex分界） 包含资源路径
  Object.defineProperty(loaderContext, 'remainingRequest', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders
        .slice(loaderContext + 1)
        .map((item) => item.request)
        .concat(loaderContext.resourcePath)
        .join('!');
    },
  });

  // 保存剩下的请求 包含自身也包含资源路径
  Object.defineProperty(loaderContext, 'currentRequest', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders
        .slice(loaderContext)
        .map((item) => item.request)
        .concat(loaderContext.resourcePath)
        .join('!');
    },
  });

  // 对于处理过的loader请求 不包含自身 不包含资源路径
  Object.defineProperty(loaderContext, 'previousRequest', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders
        .slice(0, loaderContext.loaderIndex)
        .map((item) => item.request)
        .join('!');
    },
  });

  // 保存pitch存储的值
  // pitch第三个参数可以修改，通过normal中的this.data可以获取
  Object.defineProperty(loaderContext, 'data', {
    enumerable: true,
    get: function () {
      return loaderContext.loaders[loaderContext.loaderIndex].data;
    },
  });

  const processOptions = {
    resourceBuffer: null,
  };

  iteratePitchingLoaders(processOptions, loaderContext, (err, result) => {
    callback(err, {
      result,
      resourceBuffer: processOptions.resourceBuffer
    })
  })
}

/**
 * 根据loader路径创建loader对象
 * @param {*} loader
 */
function createLoaderObject(loader) {
  const obj = {
    normal: null,
    pitch: null,
    raw: null,

    data: null,
    pitchExecuted: false,
    normalExecuted: false,

    request: loader,
  };

  // 按照路径加载loader模块（源码中支持ESM，这里仅支持CJS - -）
  const normalLoader = require(obj.request);

  obj.normal = normalLoader;
  obj.pitch = normalLoader.pitch;

  obj.raw = normalLoader.raw;
  return obj;
}

/**
 * 迭代loaders pitch
 * 按照 post -> inline -> normal -> pre 的顺序
 * @param {*} options processOptions对象
 * @param {*} loaderContext loader中的this
 * @param {*} callback runloaders的callback
 */
function iteratePitchingLoaders(options, loaderContext, callback) {
  // 超出loader个数
  if (loaderContext.loaderIndex >= loaderContext.loaders.length) {
    return processResource(options, loaderContext, callback);
  }

  const currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];
  if (currentLoaderObject.pitchExecuted) {
    loaderContext.loaderIndex++;
    return iteratePitchingLoaders(options, loaderContext, callback);
  }

  const pitchFunction = currentLoaderObject.pitch;
  currentLoaderObject.pitchExecuted = true;

  if (!pitchFunction) {
    return iteratePitchingLoaders(options, loaderContext, callback);
  }

  // 调用loader.pitch
  runSyncOrAsync(
    pitchFunction,
    loaderContext,
    [
      currentLoaderObject.remainRequest,
      currentLoaderObject.previousRequest,
      currentLoaderObject.data,
    ],
    function (err, ...args) {
      if (err) {
        return callback(err);
      }

      // 根据返回值判断
      // 存在返回值 -> 熔断 执行 normal loader
      // 不存在返回值 -> 执行下一个 pitch
      const hasArg = args.some((item) => item !== undefined);
      if (hasArg) {
        loaderContext.loaderIndex--;
        iterateNormalLoaders(options, loaderContext, args, callback);
      } else {
        iteratePitchingLoaders(options, loaderContext, callback);
      }
    }
  );
}

/**
 * 异步/同步执行loader
 * @param {*} fn
 * @param {*} context
 * @param {*} args
 * @param {*} callback
 */
function runSyncOrAsync(fn, context, args, callback) {
  let isSync = true;
  let isDone = false;

  const innerCallback = (context.callback = function () {
    isSync = false;
    isDone = true;
    callback(null, ...arguments);
  });

  context.async = function () {
    isSync = false;
    return innerCallback;
  };

  const res = fn.apply(context, args);
  if (isSync) {
    if (res === undefined) return callback();

    if (res && typeof res === 'object' && typeof res.then === 'function') {
      return res.then((r) => callback(null, r), callback);
    }

    return callback(null, res);
  }
}

/**
 * 读取文件
 * @param {*} options
 * @param {*} loaderContext
 * @param {*} callback
 */
function processResource(options, loaderContext, callback) {
  // 重置index，倒叙执行 pre -> normal -> inline -> post
  loaderContext.loaderIndex = loaderContext.loaders.length - 1;

  const resource = loaderContext.resourcePath;

  loaderContext.readResource(resource, (err, buffer) => {
    if (err) return callback(err);

    // 相当于processOptions.resourceBuffer = buffer
    options.resourceBuffer = buffer;
    iterateNormalLoaders(options, loaderContext, [buffer], callback);
  });
}

/**
 * 迭代normal loaders
 * 当pitch存在返回值时，args为pitch阶段的返回值
 * 当pitch不存在返回值时，args为即将处理的资源文件
 * @param {*} options
 * @param {*} loaderContext
 * @param {*} args
 * @param {*} callback
 */
function iterateNormalLoaders(options, loaderContext, args, callback) {
  // 所有loader处理完毕
  if (loaderContext.loaderIndex < 0) return callback(null, args);

  const currentLoader = loaderContext.loaders[loaderContext.loaderIndex];
  if (currentLoader.normalExecuted) {
    loaderContext.loaderIndex--;
    return iterateNormalLoaders(options, loaderContext, args, callback);
  }

  const normalFunction = currentLoader.normal;
  currentLoader.normalExecuted = true;
  if (!normalFunction) {
    return iterateNormalLoaders(options, loaderContext, args, callback);
  }

  convertArgs(args, currentLoader.raw);
  runSyncOrAsync(normalFunction, loaderContext, args, (err, ...args) => {
    if (err) return callback(err);

    // 这里的args是处理后的args
    iterateNormalLoaders(options, loaderContext, args, callback);
  });
}

/**
 * 转化资源source的格式
 * @param {*} args
 * @param {*} raw
 */
function convertArgs(args, raw) {
  if (!raw && Buffer.isBuffer(args[0])) {
    // 不需要buffer
    args[0] = args[0].toString();
  } else if (raw && typeof args[0] === 'string') {
    args[0] = Buffer.from(args[0], 'utf-8');
  }
}

module.exports = {
  runLoaders,
};
