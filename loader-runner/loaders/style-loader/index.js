function styleLoader(source) {
  console.log('source', source);
}

styleLoader.pitch = function (remainingRequest, previousRequest, data) {
  // remainingRequest css-loader!index.css

  const script = `
    import style from '!!${remainingRequest}';

    const styleEl = document.createElement('style');
    styleEl.innerHTML = style
    document.head.appendChild(styleEl)
`;

  return script;
};

module.exports = styleLoader;
