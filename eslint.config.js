const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  // Global ignores
  {
    ignores: ['.angular/**', 'coverage/**', 'dist/**', 'node_modules/**', 'cli/**'],
  },
  // TypeScript files
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: ['app', 'volt', 'ui', 'ngp'], style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'warn',
        { type: 'element', prefix: ['app', 'volt', 'ui', 'icon'], style: 'kebab-case' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
      '@angular-eslint/prefer-inject': 'warn',
      'no-useless-escape': 'warn',
    },
  },
  // HTML files
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/label-has-associated-control': 'warn',
    },
  },
  // Prettier integration
  {
    files: ['**/*.ts', '**/*.html'],
    rules: {
      ...prettier.rules,
    },
  }
);
