function loader(source) {
  console.log('normal: normal', source);
  return source + '//normal';
}

loader.pitch = function () {
  console.log('normal pitch');
};

module.exports = loader;
