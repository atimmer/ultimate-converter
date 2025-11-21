import js from '@eslint/js'
import globals from 'globals'
import nextPlugin from '@next/eslint-plugin-next'
import { FlatCompat } from '@eslint/eslintrc'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const compat = new FlatCompat({ baseDirectory: __dirname })

export default defineConfig([
  {
    ignores: ['.next/', 'dist/', 'node_modules/'],
  },
  // Next.js recommended rules converted for Flat config.
  ...compat.extends('next', 'next/core-web-vitals'),
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      '@next/next': nextPlugin,
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
  },
])
