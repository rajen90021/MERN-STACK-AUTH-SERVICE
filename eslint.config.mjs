import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    ignores: ['dist', 'node_modules', 'eslint.config.mjs'],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigrootDir: import.meta.dirname,
      },
    },
    rules: {
      // "no-console":"error",
      'dot-notation': 'error',
    },
  },
)
