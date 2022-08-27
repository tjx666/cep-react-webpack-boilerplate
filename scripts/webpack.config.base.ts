import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { resolve as resolvePath, sep } from 'path';
import { Configuration, DefinePlugin } from 'webpack';

import { BUILD_DIR, isDev, isProd, isTest, PROJECT_ROOT } from './constants';
import packageJSON from '../package.json';

const webDir = resolvePath(PROJECT_ROOT, 'web');
const devEntries = ['webpack/hot/dev-server.js', 'webpack-dev-server/client/index.js?hot=true'];
const configuration: Configuration = {
    target: 'electron-renderer',
    entry: [...(isDev ? devEntries : []), resolvePath(webDir, 'index.tsx')],
    output: {
        path: resolvePath(BUILD_DIR, 'web'),
        filename: 'js/[name].js',
        globalObject: 'this',
    },
    externals: {
        'node:fs': 'commonjs fs',
        'node:buffer': 'commonjs buffer',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        alias: {
            '@': resolvePath(webDir),
            assets: resolvePath(webDir, 'assets'),
            components: resolvePath(webDir, 'components'),
            pages: resolvePath(webDir, 'pages'),
            slices: resolvePath(webDir, 'slices'),
            utils: resolvePath(webDir, 'utils'),
        },
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: resolvePath(webDir, 'public/index.html'),
            minify: isProd
                ? { minifyJS: true, removeComments: true, collapseWhitespace: true }
                : false,
            chunks: [],
        }),
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                configFile: resolvePath(webDir, 'tsconfig.json'),
            },
        }),
        new DefinePlugin({
            APP_VCT: Date.now(),
            APP_VERSION: JSON.stringify(packageJSON.version),
            __DEV__: isDev ? 'true' : 'false',
            __TEST__: isTest ? 'true' : 'false',
            __PROD__: isProd ? 'true' : 'false',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.wasm$/,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
            {
                test: /\.(js|ts|tsx)$/,
                loader: 'babel-loader',
                options: { cacheDirectory: true },
                include: [
                    webDir,
                    (input) => {
                        // FIXME: 也许可以优化打包性能
                        return ['p-limit', 'yocto-queue'].some((mod) => input.includes(mod));
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
            {
                test: /\.less$/i,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024,
                    },
                },
                generator: {
                    filename: 'images/[hash]-[name][ext][query]',
                },
            },
            {
                test: /\.(ttf|woff|woff2|eot|otf)$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024,
                    },
                },
                generator: {
                    filename: 'fonts/[hash]-[name][ext][query]',
                },
            },
        ],
    },
};

export default configuration;
