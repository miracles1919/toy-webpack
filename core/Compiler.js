const path = require('path');
const fs = require('fs');
const { SyncHook } = require('tapable');
const { toUnixPath, tryExtensions, getSourceCode } = require('./utils');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const types = require('@babel/types');
const generate = require('@babel/generator').default;

class Compiler {
  constructor(options) {
    this.options = options;

    this.rootPath = this.options.context || toUnixPath(process.cwd());

    // 创建plugin hooks
    this.hooks = {
      // 编译时的钩子
      run: new SyncHook(),

      // 输出到output之前的钩子
      emit: new SyncHook(),

      // 全部完成后的钩子
      done: new SyncHook(),
    };

    // 入口模块对象
    this.entries = new Set();
    // 依赖模块对象
    this.modules = new Set();
    // 代码块对象
    this.chunks = new Set();
    // 产出的文件对象
    this.assets = new Set();
    // 产出的文件名
    this.files = new Set();
  }

  run(callback) {
    // 触发钩子
    this.hooks.run.call();

    // 获取入口配置对象
    const entry = this.getEntry();

    // 编译入口文件
    this.buildEntryModule(entry);

    // 导出列表
    this.exportFile(callback);
  }

  // 获取入口路径
  getEntry() {
    let entry = null;
    const { entry: optionsEntry } = this.options;

    if (typeof optionsEntry === 'string') {
      entry['main'] = optionsEntry;
    } else {
      entry = optionsEntry;
    }

    // 将entry变成绝对路径
    Object.keys(entry).forEach((key) => {
      const value = entry[key];
      if (!path.isAbsolute(value)) {
        entry[key] = toUnixPath(path.join(this.rootPath, value));
      }
    });
    return entry;
  }

  buildEntryModule(entry) {
    Object.keys(entry).forEach((entryName) => {
      const entryPath = entry[entryName];
      const entryObj = this.buildModule(entryName, entryPath);
      this.entries.add(entryObj);
      this.buildEntryChunk(entryName, entryObj);
    });
    console.log('entries', this.entries);
    console.log('modules', this.modules);
    console.log('chunks', this.chunks);
  }

  // 模块编译
  buildModule(moduleName, modulePath) {
    // 1. 读取代码
    const originSourceCode = (this.originSourceCode = fs.readFileSync(
      modulePath,
      'utf-8'
    ));

    this.moduleCode = originSourceCode;

    // 2. 调用loader
    this.handleLoader(modulePath);

    // 3. 调用webpack进行模块编译 获得最终的module对象
    const module = this.handleWebpackCompiler(moduleName, modulePath);
    return module;
  }

  // 匹配loader处理
  handleLoader(modulePath) {
    const matchLoaders = [];
    // 1. 获取所有的loader规则
    const rules = this.options.module.rules;
    rules.forEach((loader) => {
      const testRule = loader.test;
      if (testRule.test(modulePath)) {
        if (loader.loader) {
          matchLoaders.push(loader.loader);
        } else {
          matchLoaders.push(...loader.use);
        }
      }
    });

    // 2. 倒叙执行loader
    for (let i = matchLoaders.length - 1; i >= 0; i--) {
      const loaderFn = require(matchLoaders[i]);
      this.moduleCode = loaderFn(this.moduleCode);
    }
  }

  // 调用webpack进行模块模块编译
  handleWebpackCompiler(moduleName, modulePath) {
    // 将当前模块相对于项目启动根目录计算出相对路径，作为模块Id
    const moduleId = './' + path.posix.relative(this.rootPath, modulePath);

    // 创建模块对象
    const module = {
      id: moduleId,
      dependencies: new Set(),
      name: [moduleName],
    };

    // 调用babel解析成AST
    const ast = parser.parse(this.moduleCode, {
      sourceType: 'module',
    });

    // 深度优先遍历AST tree
    traverse(ast, {
      CallExpression: (nodePath, state) => {
        const node = nodePath.node;
        if (node.callee.name === 'require') {
          // 获取源码中引入模块的相对路径
          const requirePath = node.arguments[0].value;

          // 获取模块的绝对路径
          const moduleDirName = path.posix.dirname(modulePath);
          const absolutePath = tryExtensions(
            path.posix.join(moduleDirName, requirePath),
            this.options.resolve.extensions,
            requirePath,
            moduleDirName
          );

          // 生成moduleId
          const moduleId =
            './' + path.posix.relative(this.rootPath, absolutePath);

          // 将require修改为__webpack__require__
          node.callee = types.identifier('__webpack__require__');
          // 将reuqire引用的路径修改为相对根路径
          node.arguments = [types.stringLiteral(moduleId)];

          const alreadyModules = Array.from(this.modules).map((i) => i.id);
          if (!alreadyModules.includes(moduleId)) {
            // 为当前模块添加require语句造成的依赖
            module.dependencies.add(moduleId);
          } else {
            // 已经存在，更新模块依赖
            this.modules.forEach((module) => {
              if (module.id === moduleId) {
                module.name.push(moduleName);
              }
            });
          }
        }
      },
    });

    // 根据AST生成新的代码
    const { code } = generate(ast);
    module._source = code;

    // 深度优先遍历依赖
    module.dependencies.forEach((dependency) => {
      const depModule = this.buildModule(moduleName, dependency);
      this.modules.add(depModule);
    });

    return module;
  }

  // 根据入口文件和依赖生成chunks
  buildEntryChunk(entryName, entryObj) {
    const chunk = {
      name: entryName,
      entryModule: entryObj,
      modules: Array.from(this.modules).filter(
        (module) => module.name.includes(entryName) // 获取跟当前entry相关的module
      ),
    };
    this.chunks.add(chunk);
  }

  // 将chunks加入输出列表中
  exportFile(callback) {
    const output = this.options.output;

    // 根据chunks生成assets内容
    this.chunks.forEach((chunk) => {
      const parseFileName = output.filename.replace('[name]', chunk.name);
      this.assets[parseFileName] = getSourceCode(chunk);
    });

    // 调用emit钩子
    this.hooks.emit.call();

    if (!fs.existsSync(output.path)) {
      fs.mkdirSync(output.path);
    }

    // 保存所有文件名
    this.files = Object.keys(this.assets);

    this.files.forEach((fileName) => {
      const filePath = path.join(output.path, fileName);
      fs.writeFileSync(filePath, this.assets[fileName]);
    });

    // 触发done钩子
    this.hooks.done.call();

    callback(null, {
      toJson: () => {
        return {
          entries: this.entries,
          modules: this.modules,
          files: this.files,
          chunks: this.chunks,
          assets: this.assets,
        };
      },
    });
  }
}

module.exports = Compiler;
