const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Simple webpack configuration for browser extension
module.exports = {
  mode: 'production',
  // Increase memory limit to avoid segmentation faults
  performance: {
    hints: false,
  },
  // Split the build into smaller chunks to avoid memory issues
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxSize: 2000000, // 2MB max chunk size
    },
    // Minimize output but with less aggressive settings
    minimize: true,
    minimizer: [
      '...',
      compiler => {
        // Use a custom minimizer with lower memory usage
        const TerserPlugin = require('terser-webpack-plugin');
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              passes: 1, // Reduce passes to save memory
            },
            mangle: false, // Disable name mangling to save memory during build
          },
        }).apply(compiler);
      },
    ],
  },
  entry: {
    popup: './src/popup.tsx',
    background: './src/background.ts',
    content: './src/content.ts',
    options: './src/options.tsx',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|webp|svg)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    fallback: {
      path: false,
      fs: false,
    },
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build/chrome-mv3-prod'),
    clean: true,
  },
  plugins: [
    // Copy manifest and assets
    new CopyPlugin({
      patterns: [
        { 
          from: './assets', 
          to: 'assets',
          noErrorOnMissing: true
        },
        {
          from: './_locales',
          to: '_locales',
          noErrorOnMissing: true
        }
      ],
    }),
    // Generate HTML files
    new HtmlWebpackPlugin({
      template: './src/popup.html',
      filename: 'popup.html',
      chunks: ['popup'],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: './src/options.html',
      filename: 'options.html',
      chunks: ['options'],
      cache: false,
    }),
  ],
}; 