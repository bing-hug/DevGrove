import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import EsLintConfigPrettier from 'eslint-config-prettier'
import pluginPrettier from 'eslint-plugin-prettier'
import { readFileSync } from 'fs'

const autoImportConfig = JSON.parse(
  readFileSync('./.eslintrc-auto-import.json', 'utf8')
)

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    plugins: {
      js,
      prettier: pluginPrettier
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...autoImportConfig.globals
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      'prettier/prettier': 'error'
    }
  },
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser
      }
    }
  },
  EsLintConfigPrettier
]
