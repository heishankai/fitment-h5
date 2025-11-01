/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    // 允许单词组件名（可选）
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'warn',
    // 允许在模板中使用 v-if 和 v-for
    'vue/no-use-v-if-with-v-for': 'warn',
    // 允许无用的转义字符
    'no-useless-escape': 'warn',
    // 允许 switch case 的 fallthrough
    'no-fallthrough': 'warn',
    // 不允许未使用的变量（在开发中很常见）
    'no-unused-vars': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ]
  },
  // 为不同文件类型设置不同的规则
  overrides: [
    {
      files: ['*.cjs'],
      env: {
        node: true
      },
      rules: {
        'no-undef': 'off'
      }
    }
  ]
}
