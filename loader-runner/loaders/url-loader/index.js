const mime = require('mime');

function urlLoader(source) {
  const options = this.getOptions() || {};
  let limit = options.mime || 1024;
  const fallback = options.fallback;

  if (limit) {
    limit = parseInt(limit, 10);
  }

  if (limit && source.length < limit) {
    const fileType = mime.getType(this.resourcePath);

    const base64str = `data:${fileType};base64,${source.toString('base64')}`;

    return `module.exports = ${JSON.stringify(base64str)}`;
  } else {
    const fallbackLoader = require(fallback);
    return fallbackLoader.call(this, source);
  }
}

urlLoader.raw = true;

module.exports = urlLoader;
