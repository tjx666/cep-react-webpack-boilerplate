import TerserPlugin from 'terser-webpack-plugin';
import merge from 'webpack-merge';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import args from './args';
import baseConfig from './webpack.config.base';
import { isTest } from './constants';

const prodConfig = merge(baseConfig, {
    mode: isTest ? 'none' : 'production',
    devtool: isTest ? 'eval-source-map' : undefined,
    plugins: [
        ...(args.analyze
            ? [
                  new BundleAnalyzerPlugin({
                      analyzerPort: 3000,
                  }) as any,
              ]
            : []),
    ],
    optimization: {
        minimize: !isTest,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                extractComments: false,
            }),
        ],
    },
});

export default prodConfig;
