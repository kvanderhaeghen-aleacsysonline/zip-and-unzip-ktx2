module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        parser: '@typescript-eslint/parser', 
        ecmaVersion: 2020,
        sourceType: 'module',
        tsconfigRootDir: 'build/',
        project: ['tsconfig.all.json'],
    },
    env: {
        node: true,
        commonjs: true,
        browser: true,
        es6: true,
        es2017: true,
    },
    plugins: [
        '@typescript-eslint',
        'prettier',
    ],
    extends: [
        'eslint:recommended', // Default recommended rules
        'plugin:@typescript-eslint/recommended', // Default typescript rules
        'plugin:@typescript-eslint/recommended-requiring-type-checking', // Enable typescript typechecking
        'plugin:prettier/recommended', // Enable prettier eslint rules
    ],
    rules: {
        'no-async-promise-executor': 'off',
        'no-prototype-builtins': 'off',
        'prettier/prettier': ['error'],
        '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
    },
};
