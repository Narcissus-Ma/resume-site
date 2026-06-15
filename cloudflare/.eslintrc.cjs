module.exports = {
  root: true,
  env: {
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  ignorePatterns: ['dist/', '.wrangler/'],
  overrides: [
    {
      files: ['scripts/*.mjs', 'tests/*.mjs'],
      env: {
        node: true,
      },
    },
  ],
};
