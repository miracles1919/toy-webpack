// interception

const { SyncHook } = require('tapable');

const hook = new SyncHook(['arg1', 'arg2', 'arg3']);

hook.intercept({
  register: (tapInfo) => {
    console.log(`${tapInfo.name} is registered`);
    return tapInfo;
  },

  call: (...args) => {
    console.log('call');
  },

  tap: (tap) => {
    console.log('tap', tap);
  },

  loop: (...args) => {
    console.log(args, 'loop');
  },
});

hook.tap('flag', (...args) => {
  console.log('hook flag1:', args);
});

hook.call(1, 2, 3);
