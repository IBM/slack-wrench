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
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
    'prettier/@typescript-eslint',
    'plugin:jest/recommended',
  ],
  plugins: ['@typescript-eslint', 'jest', 'simple-import-sort'],
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    camelcase: 'off', // Slack uses snake_case data
    'simple-import-sort/sort': 'error',
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
  },
  overrides: [
    {
      files: ['*.spec.ts', 'jest.config.js', '**/__mocks__/**/*'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        // Incorrectly recognizes packages only used in tests as "dependencies"
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['jest.config.js'],
      rules: {
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
