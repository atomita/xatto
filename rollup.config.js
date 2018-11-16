import pkg from './package.json';
import typescript from 'rollup-plugin-typescript2';

const banner = `/*
xatto v${pkg.version}
https://github.com/atomita/xatto
Released under the MIT License.
*/`;

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/xatto.js',
    format: 'umd',
    name: 'xatto',
    sourceMap: true,
    banner,
  },
  plugins: [typescript({
    exclude: [
      '*.d.ts',
      '**/*.d.ts',
      '*.test.ts',
      '**/*.test.ts',
      '*.test.tsx',
      '**/*.test.tsx'
    ]
  })]
}
