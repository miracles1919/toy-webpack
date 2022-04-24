const less = require('less');

async function lessLoader(source) {
  const callback = this.async();

  const lessOptions = {
    sourceMap: {
      outputSourceFiles: true,
    },
  };
  const result = await less.render(source, lessOptions);

  const { css } = result;

  const map =
    typeof result.map === 'string' ? JSON.parse(result.map) : result.map;

  callback(null, css, map);
}

module.exports = lessLoader;
