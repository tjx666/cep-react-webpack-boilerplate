const packageJSON = require('./package.json');

/** @type {import ('@babel/core').ConfigFunction} */
module.exports = (api) => {
    api.cache(true);

    const envPreset = [
        '@babel/env',
        {
            modules: false,
            targets: 'Chrome >= 61.0.3163.91',
            bugfixes: true,
            useBuiltIns: 'usage',
            corejs: { version: packageJSON.devDependencies['core-js'].replace('^', '') },
        },
    ];

    const productionConfig = {
        presets: [['@babel/preset-react', { runtime: 'automatic' }]],
    };

    return {
        sourceType: 'unambiguous',
        presets: ['@babel/preset-typescript', envPreset],
        plugins: [
            '@babel/plugin-transform-runtime',
            ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }],
        ],
        env: {
            development: {
                presets: [['@babel/preset-react', { runtime: 'automatic', development: true }]],
                plugins: [require.resolve('react-refresh/babel')],
            },
            test: productionConfig,
            production: productionConfig,
        },
    };
};
