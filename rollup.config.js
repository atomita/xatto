import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/xatto.js',
    format: 'umd',
    name: 'xatto',
    sourceMap: true,
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
