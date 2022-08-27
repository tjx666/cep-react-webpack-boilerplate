import webpack from 'webpack';
import WebpackDevServer, { Configuration as DevServerConfiguration } from 'webpack-dev-server';

import webpackConfig from './webpack.config.dev';

const compiler = webpack(webpackConfig);
const port = 3600;
// const PROXY_URL_MAP: Record<string, string | undefined> = {
//     development: '',
//     test: '',
//     // stage: '',
//     production: '',
// };
const devServerOptions: DevServerConfiguration = {
    // hot 和 client 都已经在 entry 中配置好了
    hot: false,
    client: false,
    liveReload: true,
    port,
    open: false,
    devMiddleware: {
        stats: 'minimal',
    },
    proxy: {
        // '/api': {
        //     changeOrigin: true,
        //     target: PROXY_URL_MAP[process.env.NODE_ENV ?? 'development'],
        // },
    },
};
const server = new WebpackDevServer(devServerOptions, compiler);
server.start();
