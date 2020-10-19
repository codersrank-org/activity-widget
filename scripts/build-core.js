// const exec = require('exec-sh');
const fs = require('fs');
const { rollup } = require('rollup');
const { default: babel } = require('@rollup/plugin-babel');
const replace = require('@rollup/plugin-replace');
const Terser = require('terser');

const autoprefixer = require('./autoprefixer.js');
const cleanCSS = require('./clean-css.js');
const scss = require('./scss.js');
const banner = require('./banner');

const build = async () => {
  const filename = 'codersrank-activity';
  const env = process.env.NODE_ENV || 'development';
  const outputDir = env === 'development' ? 'dev' : 'package';

  let cssContent = fs.readFileSync('./src/widget.scss', 'utf-8');
  cssContent = await scss(cssContent);
  cssContent = await autoprefixer(cssContent);
  cssContent = await cleanCSS(cssContent);

  const bundle = await rollup({
    input: './src/widget.js',
    plugins: [
      replace({
        delimiters: ['', ''],
        $_STYLES_$: cssContent,
      }),
      babel({ babelHelpers: 'bundled' }),
    ],
  });
  const bundleResult = await bundle.write({
    format: 'umd',
    name: 'CodersRankWidgetAcitivity',
    strict: true,
    sourcemap: true,
    sourcemapFile: `./${outputDir}/${filename}.js.map`,
    banner,
    file: `./${outputDir}/${filename}.js`,
  });

  if (env !== 'production') return;
  const result = bundleResult.output[0];
  const minified = await Terser.minify(result.code, {
    sourceMap: {
      content: env === 'development' ? result.map : undefined,
      filename: env === 'development' ? undefined : `${filename}.min.js`,
      url: `${filename}.min.js.map`,
    },
    output: {
      preamble: banner,
    },
  });

  fs.writeFileSync(`./${outputDir}/${filename}.min.js`, minified.code);
  fs.writeFileSync(`./${outputDir}/${filename}.min.js.map`, minified.map);
};

module.exports = build;
