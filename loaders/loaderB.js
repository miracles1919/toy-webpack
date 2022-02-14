function loaderB(sourceCode) {
  console.log('loader B');
  return sourceCode + `\n const loaderB = 'loaderB'`;
}

module.exports = loaderB;
