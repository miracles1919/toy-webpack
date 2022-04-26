const path = require('path');
const { compile, getCompiler, runInJsDom } = require('./helpers');

describe('style-loader', () => {
  it('should work', async () => {
    const entry = path.resolve(__dirname, '../examples/src/style');
    const compiler = getCompiler(
      entry,
      {},
      {
        module: {
          rules: [
            {
              test: /\.css$/,
              use: [
                { loader: path.resolve(__dirname, '../loaders/style-loader') },
                'css-loader',
              ],
            },
          ],
        },
      }
    );

    const stats = await compile(compiler);

    runInJsDom('main.bundle.js', compiler, stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot('DOM');
    });
  });
});
