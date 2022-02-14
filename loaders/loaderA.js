function loaderA(sourceCode) {
  console.log('loader A');
  return sourceCode + `\n const loaderA = 'loaderA'`;
}

module.exports = loaderA;
