var gobble = require('gobble');

var source = gobble('src');

// This is a temporary fix until
// https://github.com/rollup/rollup/pull/652
// is merged.
function addEsModule( input, options ) {
  const search = "exports['default'] = Speedball;";
  const replacement = '\n\nObject.defineProperty(exports, "__esModule", {value: true});\n\n';

  return input.replace(search, search + replacement);
}

var builtFile = source
  .transform('babel')
  .transform('rollup', {
    entry: 'speedball.js',
    format: 'umd',
    moduleName: 'Speedball',
    moduleId: 'speedball',
    exports: 'named',
    sourceMap: true
  })
  .transform(addEsModule);

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
