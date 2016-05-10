var gobble = require('gobble');

var builtFile = gobble('index.js')
  .transform('babel')
  .transform('rollup', {
    entry: 'index.js',
    format: 'umd',
    moduleName: 'Speedball'
  });

module.exports = gobble([
  builtFile.transform( 'uglifyjs', { ext: '.min.js' }),
  builtFile
]);
