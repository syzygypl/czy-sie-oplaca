require('dotenv').config({ silent: true });

const webpack = require('webpack');

const PATHS = {
  app: './app',
  build: './build',
};
const TARGET = process.env.npm_lifecycle_event;

const configure = {
  entry: {
    app: PATHS.app,
  },
  output: {
    path: PATHS.build,
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: TARGET === 'develop' ? ['babel-loader', 'eslint-loader'] : ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        loaders: ['style', 'css'],
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass'],
      },
      {
        include: /\.pug/,
        loader: 'pug-html-loader',
      },
    ],
  },
  devtool: TARGET === 'develop' ? 'eval-source-map' : undefined,
  plugins: [
    new webpack.EnvironmentPlugin(['FIREBASE_URL', 'FIREBASE_SECRET']),
  ],
};

if (TARGET === 'build') {
  configure.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

if (TARGET === 'develop') {
  configure.devServer = {
    contentBase: PATHS.build,
    historyApiFallback: true,
    inline: true,
    progress: true,
  };
}

module.exports = configure;
