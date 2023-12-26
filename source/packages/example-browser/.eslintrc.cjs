/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    ecmaVersion: 'latest',
    'project': './tsconfig.json'
  },
  'rules': {
    // no-floating-promises
    '@typescript-eslint/no-floating-promises': 'error'
  }
}
