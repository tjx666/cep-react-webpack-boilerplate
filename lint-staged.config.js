module.exports = {
    'JSX/**/*.jsx': 'eslint -c ./JSX/.eslintrc.js',
    'web/**/*.{js,ts,tsx}': 'eslint -c ./web/.eslintrc.js',
    'web/**/*.{ts,tsx}': 'format-imports --config ./import-sorter.json',
    'web/**/*.{css,less}': 'stylelint --config ./web/.stylelintrc.json',
    '*.{js,jsx,ts,tsx,json,css,less,md,xml}': 'prettier --write',
    'web/**/*.ts?(x)': () => 'tsc -p ./web/tsconfig.json --noEmit',
};
