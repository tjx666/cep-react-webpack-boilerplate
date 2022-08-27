const OFF = 0;
const WARN = 1;
// const ERROR = 2;

/** @type {import('eslint').Linter.Config} */
module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 13,
        sourceType: 'module',
    },
    plugins: ['react', '@typescript-eslint'],
    rules: {
        '@typescript-eslint/ban-ts-comment': OFF,
        '@typescript-eslint/no-empty-function': OFF,
        '@typescript-eslint/no-empty-interface': OFF,
        '@typescript-eslint/no-explicit-any': OFF,
        '@typescript-eslint/no-non-null-assertion': OFF,
        '@typescript-eslint/no-unused-vars': [
            WARN,
            { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],

        'react/self-closing-comp': [
            WARN,
            {
                component: true,
                html: true,
            },
        ],
    },
    ignorePatterns: ['web/assets/js'],
};
