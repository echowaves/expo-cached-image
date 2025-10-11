const { FlatCompat } = require('@eslint/eslintrc');

/* eslint-disable no-undef */
/* global require, module, __dirname */

const compat = new FlatCompat({
  baseDirectory: __dirname
});

module.exports = [
  {
    ignores: [
      'eslint.config.js',
      '.prettierrc.js',
      'babel.config.js',
      'node_modules/**',
      'dist/**',
      '.expo/**',
      'lib/**',
      '.codacy/**',
      '**/*.d.ts'
    ]
  },
  ...compat.config({
    extends: ['airbnb-base', 'prettier'],
    env: {
      browser: true,
      es6: true,
      es2021: true,
      node: true
    },
    parser: '@babel/eslint-parser',
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      }
    },
    plugins: ['prettier'],
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',

      // Trailing comma rule (aligned with Codacy PMD AvoidTrailingComma)
      'comma-dangle': ['error', 'never'],

      // Codacy-aligned rules - Error/High severity
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_'
        }
      ],
      'no-console': 'off', // Allow console for debugging
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-return-await': 'error',
      'no-await-in-loop': 'warn',
      'require-atomic-updates': 'error',

      // Import rules (matching Codacy patterns)
      'import/no-unresolved': ['error', { commonjs: true, amd: true }],
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/no-deprecated': 'error',
      'import/no-cycle': ['error', { maxDepth: 10, ignoreExternal: false }],
      'import/no-named-as-default': 'warn',
      'import/no-named-as-default-member': 'error',

      // Security-related rules (matching Codacy security patterns)
      'no-restricted-globals': ['error', 'event', 'fdescribe'],
      'no-prototype-builtins': 'error',
      'no-unsafe-negation': 'error',

      // Best practices
      'prefer-const': 'error',
      'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
      'prefer-template': 'warn',
      'prefer-destructuring': [
        'warn',
        {
          array: false,
          object: true
        }
      ],

      // Code quality
      complexity: ['warn', { max: 15 }],
      'max-depth': ['warn', { max: 4 }],
      'max-nested-callbacks': ['warn', { max: 3 }],
      'max-params': ['warn', { max: 4 }],

      // Airbnb overrides for better Codacy alignment
      'consistent-return': 'off',
      'no-underscore-dangle': 'off',
      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsFor: [
            'state',
            'acc',
            'e',
            'ctx',
            'req',
            'request',
            'res',
            'response'
          ]
        }
      ],
      'class-methods-use-this': 'off',
      'no-plusplus': 'off'
    }
  }),
  {
    files: ['**/eslint.config.js', '**/.prettierrc.js', '**/babel.config.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly'
      }
    },
    rules: {
      'no-undef': 'off',
      'import/no-extraneous-dependencies': 'off'
    }
  }
];
