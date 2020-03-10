const path = require('path');
const merge = require("webpack-merge");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv').config();
const fs = require('fs');

module.exports = env => {
  
  
  const devMode = env.NODE_ENV !== 'production';

  const cwp = devMode ? () => {} : new CleanWebpackPlugin();
  
  return {
    entry: {
      main: './src/index.js'
    },
    devtool: 'inline-source-map',
    devServer: !devMode ? {} : {
      host: dotenv.parsed.URL,
      https: {
        key: fs.readFileSync('../../../_tools/traefik-proxy/devcerts/' + dotenv.parsed.URL + '+1-key.pem'),
        cert: fs.readFileSync('../../../_tools/traefik-proxy/devcerts/' + dotenv.parsed.URL + '+1.pem'),
      },
      allowedHosts: [
        dotenv.parsed.URL,
      ]
    },
    output: {
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
      modules: [
        'node_modules',
        path.resolve(__dirname, 'dev')
      ],
      extensions: ['.js'],
      alias: {
        '@scss': path.resolve(__dirname, 'src/scss'),
        '@img': path.resolve(__dirname, 'src/img'),
        '@': path.resolve(__dirname, 'src')
      }
    },
    module: {
      rules: [
        {
          test: /\.js?$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
              ],
            },
          },
        },
        {
          test: [/.css$|.scss$/],
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: devMode,
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [
                  require('autoprefixer'),
                ],
                sourceMap: devMode,
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: devMode,
              }
            },
          ]
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/',
              esModule: false,
            }
          }],
        },
        {
          test: /\.(html)$/,
          use: {
            loader: 'html-loader'
          },
        },
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Ecran Noir',
        inject: true,
        template: './src/index.html'
      }),
      cwp,
      new MiniCssExtractPlugin({
        filename: 'main.[contenthash:8].css',
      }),
      new CopyPlugin([
        { 
          from: 'src/.htaccess', 
          to: '.htaccess',
          toType: 'file'
        },
      ]),
    ],
    optimization: {
      minimizer: [
        new UglifyJsPlugin(),
        new OptimizeCSSAssetsPlugin()
      ]
    },
  }
}
