const CALL_DELEGATE = function (...args) {
  this.call = this._createCall('sync')
  return this.call(...args)
};

class Hook {
  constructor(args = [], name = undefined) {
    this._args = args;
    this.name = name;

    this.taps = [];
    this.interceptors = [];

    this._call = CALL_DELEGATE
    this.call = CALL_DELEGATE;

    this._x = undefined;

    this.compile = this.compile;
    this.tap = this.tap;
  }

  compile() {
    throw new Error('Abstract: should be overridden');
  }

  _createCall(type) {
    return this.compile({
      taps: this.taps,
      interceptors: this.interceptors,
      args: this._args,
      type: type,
    });
  }

  tap(options, fn) {
    this._tap('sync', options, fn);
  }

  /**
   *
   * @param {*} type 注册类型 sync、async、...
   * @param {*} options 注册时传入的第一个参数
   * @param {*} fn 注册时传入的回调函数
   */
  _tap(type, options, fn) {
    if (typeof options === 'string') {
      options = {
        name: options.trim(),
      };
    } else if (typeof options !== 'object' || options === null) {
      throw new Error('Invalid tap options');
    }

    if (typeof options.name !== 'string' || options.name === '') {
      throw new Error('Missing name for tap');
    }

    options = Object.assign({ type, fn }, options);

    this._insert(options);
  }

  // 每次tap前调用 _resetCompilation 重新赋值 this.call
  _resetCompilation() {
    this.call = this._call
  }

  _insert(item) {
    this._resetCompilation()
    this.taps.push(item)
  }
}

module.exports = Hook