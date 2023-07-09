/** @type {import("prettier").Config} */
const config = {
    plugins: [require.resolve('prettier-plugin-tailwindcss')],
    singleQuote: true,
    trailingComma: 'all',
    tabWidth: 4,
    semi: true,
    endOfLine: 'lf',
    printWidth: 80,
    arrowParens: 'always',
};

module.exports = config;
