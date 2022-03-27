const SyncHook = require('./SyncHook');

const hook = new SyncHook(['arg1', 'arg2', 'arg3']);

hook.tap('flag1', (...args) => {
  console.log('hook flag1:', args);
});

hook.tap('flag2', (...args) => {
  console.log('hook flag2:', args);
});

hook.call(1, 2, 3);
