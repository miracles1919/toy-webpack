const { HookMap, SyncHook } = require('tapable')

const keyedHook = new HookMap(key => new SyncHook(['arg']))

keyedHook.for('key1').tap('Plugin1', arg=> {
  console.log('Plugin1', arg)
})

keyedHook.for('key2').tap('Plugin2', arg=> {
  console.log('Plugin2', arg)
})

keyedHook.for('key3').tap('Plugin3', arg=> {
  console.log('Plugin3', arg)
})

const hook = keyedHook.get('key1')
if (hook) {
  hook.call('hello')
}