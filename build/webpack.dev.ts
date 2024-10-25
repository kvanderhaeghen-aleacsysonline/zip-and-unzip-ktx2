/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Path from 'path';
import Webpack from 'webpack';
import { Config } from './webpack.utils';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { getIpAddress } from './networkHelper';
// import CompressionPlugin from 'compression-webpack-plugin';

const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const config: Webpack.Configuration = {
    devtool: 'source-map',
    mode: 'development',
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
    devServer: {
        host: getIpAddress(),
        port: 8043,
        client: {
            overlay: true,
        },
        devMiddleware: {
            writeToDisk: true,
        },
        open: 'index.html',
        static: [{ directory: Config.outPathDev }, Path.join(__dirname, 'assets')],
        server: {
            type: 'https',
        },
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: false, // Remove console.log statements
                    },
                    output: {
                        comments: false, // Remove comments
                    },
                },
                extractComments: false, // Remove license file with extracted comments
            }),
        ],
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
                {
                    from: Path.join(__dirname, '..', 'assets'),
                    to: Path.join(Config.outPathDev, 'assets'),
                },
                {
                    from: Path.join(__dirname, '..', 'node_modules/pixi-basis-ktx2/assets/'),
                    to: Path.join(Config.outPathDev, ''),
                },
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
        path: Config.outPathDev + '/',
        libraryTarget: 'umd',
        libraryExport: 'default',
        library: Config.outputName,
        hotUpdateChunkFilename: 'hot/hot-update.js',
        hotUpdateMainFilename: 'hot/hot-update.json',
    },
    resolve: {
        mainFields: ['module', 'main'],
        extensions: ['.ts', '.tsx', '.js', '.vue', '.json', 'd.ts'],
    },
} as any;

export default config;
