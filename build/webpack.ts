/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Path from 'path';
import Webpack from 'webpack';
import { Config } from './webpack.utils';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import Ip from 'ip';
import os from 'os';

const nodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const useLocalNetworkAddress = true;
const networkInterfaces = os.networkInterfaces();
const nonLocalInterfaces: Record<string, os.NetworkInterfaceInfo[]> = {};
let myNetworkAddress: string = Ip.address();
if (useLocalNetworkAddress) {
    for (const inet in networkInterfaces) {
        const addresses = networkInterfaces[inet]!;
        for (let i = 0; i < addresses.length; i++) {
            const address = addresses[i];
            if (!address.internal) {
                if (!nonLocalInterfaces[inet]) {
                    nonLocalInterfaces[inet] = [];
                }
                nonLocalInterfaces[inet].push(address);
                if (address.address.includes('192.168')) {
                    if (address.address !== '192.168.0.1') {
                        myNetworkAddress = address.address;
                    }
                }
            }
        }
    }
    // console.log(nonLocalInterfaces);
}

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
        host: myNetworkAddress,
        port: 8080,
        inline: true,
        open: true,
        overlay: true,
        openPage: 'index.html',
        disableHostCheck: true,
        writeToDisk: true,
        contentBase: [Config.outPath, Path.join(__dirname, 'assets')],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: Config.outputName,
            template: './build/assets/index.html',
            inject: false,
            filename: 'index.html',
            
        }),
        new CopyPlugin({
            patterns: [
                { from: Path.join(__dirname, '..', 'assets'), to: Path.join(Config.outPath, 'assets') },
                { from: Path.join(__dirname, '..', 'node_modules/pixi-basis-ktx2/assets/'), to: Path.join(Config.outPath, '') },
            ],
            
        }),
        new nodePolyfillPlugin(),
    ],
    output: {
        filename: Config.outFileName,
        path: Config.outPath + '/',
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
