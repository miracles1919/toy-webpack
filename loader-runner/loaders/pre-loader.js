function loader(source) {
  console.log('pre: normal', source);
  return source + '//pre';
}

loader.pitch = function () {
  console.log('pre pitch');
};

module.exports = loader;
