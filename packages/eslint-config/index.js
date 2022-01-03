const path = require('path');

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: path.resolve(__dirname, '../../'),
    project: ['./tsconfig.json', './packages/**/tsconfig.json'],
  },
  env: {
    'jest/globals': true,
  },
  plugins: ['@typescript-eslint', 'jest', 'simple-import-sort'],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:jest/recommended',
    'prettier',
  ],
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    camelcase: 'off', // Slack uses snake_case data
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'sort-imports': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        ts: 'never',
      },
    ],
    'import/order': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '__mocks__/**/*.*',
          'scripts/**/*.*',
          'test/**/*.*',
          '**/*.d.ts',
        ],
      },
    ],
    'jest/prefer-expect-assertions': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase', 'snake_case'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'allow',
      },

      {
        selector: 'variable',
        format: ['camelCase', 'snake_case', 'UPPER_CASE', 'PascalCase'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'allow',
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
    ],
  },
  overrides: [
    {
      files: ['*.spec.ts', 'jest.config.js', '**/__mocks__/**/*'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        // Incorrectly recognizes packages only used in tests as "dependencies"
        'import/no-extraneous-dependencies': 'off',
        'import/no-import-module-exports': 'off',
      },
    },
    {
      files: ['jest.config.js'],
      rules: {
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
    },
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
