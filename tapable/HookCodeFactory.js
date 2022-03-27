class HookCodeFactory {
  constructor(config) {
    this.config = config;
    this.options = undefined;
    this._args = undefined;
  }

  setup(instance, options) {
    instance._x = options.taps.map((t) => t.fn);
  }

  create(options) {
    this.init(options);

    let fn;

    switch (this.options.type) {
      case 'sync':
        fn = new Function(
          this.args(),
          '"use strict";\n' +
            this.header() +
            this.contentWithInterceptors(options)
        );
        break;
    }

    this.deinit();
    return fn;
  }

  /**
   * @param {{ type: "sync" | "promise" | "async", taps: Array<Tap>, interceptors: Array<Interceptor> }} options
   */
  init(options) {
    this.options = options;
    this._args = options.args.slice();
  }

  deinit() {
    this.options = undefined;
    this._args = undefined;
  }

  contentWithInterceptors(options) {
    if (this.options.interceptors.length > 0) {
      // ...
    }

    return this.content(options);
  }

  header() {
    let code = '';
    code += 'var _context;\n';
    code += 'var _x = this._x;console.log(this);\n';

    return code;
  }

  // 生成单个事件函数并调用，例如 _fn0 = this.x[0]; _fn0(...args)
  callTap(tapIndex, { onDone }) {
    let code = '';
    code += `var _fn${tapIndex} = _x[${tapIndex}];\n`;
    const tap = this.options.taps[tapIndex];
    switch (tap.type) {
      case 'sync':
        code += `_fn${tapIndex}(${this.args()});\n`;
        if (onDone) {
          code += onDone();
        }
        break;
    }

    return code;
  }

  callTapsSeries({ onDone }) {
    if (this.options.taps.length === 0) return onDone();

    let code = '';
    let current = onDone;
    // 遍历taps
    for (let i = this.options.taps.length - 1; i >= 0; i--) {
      const done = current;
      const content = this.callTap(i, {
        onDone: done,
      });
      current = () => content;
    }

    code += current();
    return code;
  }

  args() {
    const args = this._args;
    if (args.length === 0) return '';
    return args.join(', ');
  }
}

module.exports = HookCodeFactory;
