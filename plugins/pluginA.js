class PluginA {
  // 注册同步钩子
  apply(compiler) {
    compiler.hooks.run.tap('Plugin A', () => {
      console.log('PluginA');
    });
  }
}

module.exports = PluginA;
