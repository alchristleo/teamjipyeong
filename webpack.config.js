const path = require('path');

module.exports = {
  mode: 'production',
  entry: './index.ts',
  target: 'node',
  output: {
    filename: 'worker.js', // [name] will take whatever the input filename is. defaults to 'main' if only a single entry value
    path: path.resolve(__dirname, '../release'), // the folder containing you final dist/build files. Default to './dist'
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              onlyCompileBundledFiles: true,
              transpileOnly: false,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
};
