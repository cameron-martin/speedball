var gobble = require('gobble');

var source = gobble('src');

var builtFile = source
  .transform('babel')
  .transform('rollup', {
    entry: 'speedball.js',
    format: 'umd',
    moduleName: 'Speedball',
    moduleId: 'speedball',
    exports: 'named'
  });

module.exports = gobble([
  builtFile.transform('uglifyjs', { ext: '.min.js' }),
  builtFile,
  source.transform('babel', {
    babelrc: false,
    plugins: [
      'transform-flow-strip-types',
      'transform-class-properties'
    ],
    sourceMap: false
  }).moveTo('es2015')
]);
