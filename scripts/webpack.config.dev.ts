import FriendlyErrorsPlugin from '@nuxt/friendly-errors-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { HotModuleReplacementPlugin } from 'webpack';
import merge from 'webpack-merge';

import baseConfig from './webpack.config.base';

const devConfig = merge(baseConfig, {
    mode: 'development',
    devtool: 'eval-source-map',
    plugins: [
        new FriendlyErrorsPlugin(),
        new HotModuleReplacementPlugin(),
        new ReactRefreshWebpackPlugin(),
    ],
});

export default devConfig;
