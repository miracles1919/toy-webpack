function loader(source) {
  console.log('post: normal', source);
  return source + '//post';
}

loader.pitch = function () {
  console.log('post pitch');
};

module.exports = loader;
