const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/pages/index.js', // Adjust if needed
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // add more rules if necessary
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // This should match the location of your index.html file
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};