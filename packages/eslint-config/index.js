module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
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
    '@typescript-eslint/camelcase': 'off', // Slack uses snake_case data
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  },
  overrides: [
    {
      files: ['*.spec.ts', 'jest.config.js'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        // Incorrectly recognizes packages only used in tests as "dependencies"
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
