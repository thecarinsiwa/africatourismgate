import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/node_modules/**',
      '**/build/**',
      '**/coverage/**',
      'apps/api/**',
      'apps/pos/**',
      '**/*.cjs',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
);
