class pluginB {
  // 注册同步钩子
  apply(compiler) {
    compiler.hooks.done.tap('Plugin B', () => {
      console.log('PluginB');
    });
  }
}

module.exports = pluginB;
