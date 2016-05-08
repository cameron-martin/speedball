var gobble = require('gobble');

module.exports = gobble('index.js')
  .transform('babel')
  // .transform('rollup', {
  //   entry: 'index.js',
  //   format: 'umd',
  //   moduleName: ''
  // });
