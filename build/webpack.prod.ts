/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Path from 'path';
import Webpack from 'webpack';
import { Config } from './webpack.utils';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
// import CompressionPlugin from 'compression-webpack-plugin';

const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const config: Webpack.Configuration = {
    devtool: false,
    mode: 'production',
    entry: {
        testProject: './src/index.ts',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/i,
                use: {
                    loader: 'ts-loader',
                    options: {
                        configFile: 'build/tsconfig.bundle.json',
                    },
                },
                exclude: /node_modules/,
            },
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                compress: {
                    drop_console: false, // Remove console.log statements
                },
                output: {
                    comments: false, // Remove comments
                },
            },
            extractComments: false, // Remove license file with extracted comments
        }),],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: Config.outputName,
            template: './build/assets/index.html',
            favicon: './build/assets/favicon.ico',
            inject: false,
            filename: 'index.html',
        }),
        new CopyPlugin({
            patterns: [
                { from: Path.join(__dirname, '..', 'assets'), to: Path.join(Config.outPathProd, 'assets') },
                { from: Path.join(__dirname, '..', 'node_modules/pixi-basis-ktx2/assets/'), to: Path.join(Config.outPathProd, '') },
            ],
        }),
        new NodePolyfillPlugin(),
        // new CompressionPlugin({
        //     algorithm: 'brotliCompress',
        //     filename: '[name].br[query]',
        //     test: /\.(js|css|html|svg)$/,
        //     compressionOptions: { level: 6 },
        //     threshold: 10240,
        //     minRatio: 0.8,
        //     deleteOriginalAssets: false,
        // }),
    ],
    output: {
        filename: Config.outFileName,
        path: Config.outPathProd + '/',
        libraryTarget: 'umd',
        libraryExport: 'default',
        library: Config.outputName,
    },
    resolve: {
        mainFields: ['module', 'main'],
        extensions: ['.ts', '.tsx', '.js', '.vue', '.json', 'd.ts'],
    },
} as any;

export default config;
