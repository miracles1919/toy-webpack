// basic

const {
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  SyncLoopHook,
} = require('tapable');

const hook = new SyncHook(['arg1', 'arg2', 'arg3']);

// 注册事件
hook.tap('flag1', (...args) => {
  console.log('hook flag1:', args);
});

hook.tap('flag2', (...args) => {
  console.log('hook flag2:', args);
});

// 触发回调
hook.call(1, 2, 3);

// waterfall 将上一个函数的返回值传递给下个函数作为参数
const hook2 = new SyncWaterfallHook(['arg1', 'arg2', 'arg3']);
hook2.tap('flag1', (...args) => {
  console.log('hook2 flag1:', args);
  return 'flag1';
});

hook2.tap('flag2', (...args) => {
  console.log('hook2 flag2:', args);
});

hook2.tap('flag3', (...args) => {
  console.log('hook2 flag3:', args);
});
hook2.call(1, 2, 3);

// bail 函数中存在返回值时中断后续事件调用
const hook3 = new SyncBailHook(['arg1', 'arg2', 'arg3']);
hook3.tap('flag1', (...args) => {
  console.log('hook3 flag1:', args);
  return 'flag1';
});

hook3.tap('flag2', (...args) => {
  console.log('hook3 flag2:', args);
});

hook3.call(1, 2, 3);

// loop 函数中存在非undefined返回时重新开始执行
const hook4 = new SyncLoopHook();
let m = 1,
  n = 2;
hook4.tap('flag1', () => {
  console.log('hook4 flag1:', m);
  if (m) {
    return m--;
  }
});

hook4.tap('flag2', () => {
  console.log('hook4 flag2:', n);
  if (n) {
    return n--;
  }
});

hook4.call();
