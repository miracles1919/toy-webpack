const {
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook,
  AsyncParallelHook,
  AsyncParallelBailHook,
} = require('tapable');

// 异步串行钩子
const hook = new AsyncSeriesHook(['arg1', 'arg2']);

console.time('timer');
hook.tapAsync('flag1', (arg1, arg2, callback) => {
  console.log('hook flag1:', arg1, arg2);
  setTimeout(() => {
    callback();
  }, 1000);
});

hook.tapPromise('flag2', (arg1, arg2) => {
  console.log('hook flag2:', arg1, arg2);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
});

hook.callAsync(1, 2, () => {
  console.log('hook done');
  console.timeEnd('timer');
});

异步串行保险钩子
const hook2 = new AsyncSeriesBailHook(['arg1', 'arg2']);

console.time('timer2');

hook2.tapPromise('flag1', (arg1, arg2) => {
  console.log('hook2 flag1:', arg1, arg2);

  return new Promise((resolve) => {
    setTimeout(() => {
      // 存在返回值 中断后续执行
      resolve(true);
    }, 1000);
  });
});

hook2.tapPromise('flag2', (arg1, arg2) => {
  console.log('hook2 flag2:', arg1, arg2);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
});

hook2.callAsync(1, 2, () => {
  console.log('hook2 done');
  console.timeEnd('timer2');
});

// 异步串行瀑布钩子
const hook3 = new AsyncSeriesWaterfallHook(['arg1', 'arg2']);

console.time('timer3');

hook3.tapPromise('flag1', (arg1, arg2) => {
  console.log('hook3 flag1:', arg1, arg2);

  return new Promise((resolve) => {
    setTimeout(() => {
      // 存在返回值 中断后续执行
      resolve(5);
    }, 1000);
  });
});

hook3.tapPromise('flag2', (arg1, arg2) => {
  console.log('hook3 flag2:', arg1, arg2);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
});

hook3.callAsync(1, 2, () => {
  console.log('hook3 done');
  console.timeEnd('timer3');
});

// 异步并行钩子
const hook4 = new AsyncParallelHook(['arg1', 'arg2']);

console.time('timer4');

hook4.tapPromise('flag1', (arg1, arg2) => {
  console.log('hook4 flag1:', arg1, arg2);

  return new Promise((resolve) => {
    setTimeout(() => {
      // 存在返回值 中断后续执行
      resolve();
    }, 1000);
  });
});

hook4.tapPromise('flag2', (arg1, arg2) => {
  console.log('hook4 flag2:', arg1, arg2);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
});

hook4.callAsync(1, 2, () => {
  console.log('hook4 done');
  console.timeEnd('timer4');
});

// 异步并行保险钩子
const hook5 = new AsyncParallelBailHook(['arg1', 'arg2']);

console.time('timer5');

hook5.tapPromise('flag1', (arg1, arg2) => {
  console.log('hook5 flag1:', arg1, arg2);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
});

hook5.tapPromise('flag2', (arg1, arg2) => {
  console.log('hook5 flag2 start');

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('hook5 flag2 end');
      resolve();
    }, 1000);
  });
});

hook5.callAsync(1, 2, () => {
  console.log('hook5 done');
  console.timeEnd('timer5');
});
