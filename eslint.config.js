// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import nPlugin from 'eslint-plugin-n';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import nextPlugin from '@next/eslint-plugin-next';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = dirname(fileURLToPath(import.meta.url));

const IGNORES = [
   '**/dist/**',
   '**/.next/**',
   '**/build/**',
   '**/coverage/**',
   '**/node_modules/**',
   '**/.turbo/**',
   '**/*.config.js',
   '**/*.config.mjs',
   '**/*.config.cjs',
   '**/scripts/**',
];

export default tseslint.config(
   { ignores: IGNORES },

   // ---------- Base JS ----------
   js.configs.recommended,

   // ---------- Base TypeScript (type-aware) ----------
   ...tseslint.configs.recommendedTypeChecked,
   ...tseslint.configs.stylisticTypeChecked,
   {
      languageOptions: {
         parserOptions: {
            // Requires a tsconfig per package; projectService auto-discovers
            // the nearest tsconfig.json without listing every project by hand.
            projectService: true,
            tsconfigRootDir: configDir,
         },
         globals: {
            ...globals.node,
         },
      },
   },

   // ---------- Shared rules for all TS/JS files ----------
   {
      files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
      plugins: {
         import: importPlugin,
         'unused-imports': unusedImports,
         'simple-import-sort': simpleImportSort,
         n: nPlugin,
      },
      rules: {
         // --- Correctness / safety ---
         '@typescript-eslint/no-explicit-any': 'warn',
         '@typescript-eslint/no-floating-promises': 'error',
         '@typescript-eslint/no-misused-promises': 'error',
         '@typescript-eslint/await-thenable': 'error',
         '@typescript-eslint/no-unnecessary-condition': 'off', // too strict for gradual adoption
         '@typescript-eslint/no-non-null-assertion': 'warn',
         '@typescript-eslint/consistent-type-imports': [
            'error',
            { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
         ],
         '@typescript-eslint/no-unused-vars': 'off', // handled by unused-imports
         'unused-imports/no-unused-imports': 'error',
         'unused-imports/no-unused-vars': [
            'warn',
            {
               vars: 'all',
               varsIgnorePattern: '^_',
               args: 'after-used',
               argsIgnorePattern: '^_',
            },
         ],

         // --- Import hygiene ---
         'import/no-cycle': ['error', { maxDepth: 5 }],
         'import/no-self-import': 'error',
         'import/no-duplicates': 'error',
         'simple-import-sort/imports': 'error',
         'simple-import-sort/exports': 'error',

         // --- Node correctness (catches missing deps, wrong Node APIs) ---
         'n/no-missing-import': 'off', // TS handles this; avoid false positives on path aliases
         'n/no-extraneous-import': 'error',
         'n/no-process-exit': 'error',

         // --- General hygiene ---
         'no-console': ['warn', { allow: ['warn', 'error'] }],
         'no-debugger': 'error',
         'no-return-await': 'off', // superseded by @typescript-eslint/return-await if enabled
         eqeqeq: ['error', 'always'],
         curly: ['error', 'all'],
      },
   },

   // ---------- Next.js app (apps/web) ----------
   {
      files: ['apps/web/**/*.{ts,tsx,js,jsx}'],
      plugins: {
         react,
         'react-hooks': reactHooks,
         'jsx-a11y': jsxA11y,
         '@next/next': nextPlugin,
      },
      languageOptions: {
         globals: { ...globals.browser },
      },
      settings: {
         react: { version: 'detect' },
      },
      rules: {
         ...react.configs.recommended.rules,
         ...reactHooks.configs.recommended.rules,
         ...jsxA11y.configs.recommended.rules,
         ...nextPlugin.configs.recommended.rules,
         ...nextPlugin.configs['core-web-vitals'].rules,
         'react/react-in-jsx-scope': 'off', // Next.js auto-imports JSX runtime
         'react/prop-types': 'off', // TS handles prop validation
      },
   },

   // ---------- NestJS app (apps/api) ----------
   {
      files: ['apps/api/**/*.ts'],
      rules: {
         // Nest relies heavily on decorators + DI; these patterns are safe there
         '@typescript-eslint/no-extraneous-class': 'off',
         '@typescript-eslint/no-empty-function': 'off', // lifecycle hooks, guards
         '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
   },

   // ---------- Backend packages (packages/*) ----------
   {
      files: ['packages/**/*.ts'],
      rules: {
         '@typescript-eslint/explicit-module-boundary-types': 'error', // public API of shared libs must be explicit
      },
   },

   // ---------- Test files ----------
   {
      files: ['**/*.{test,spec}.{ts,tsx}', '**/__tests__/**'],
      languageOptions: {
         globals: { ...globals.jest, ...globals.node },
      },
      rules: {
         '@typescript-eslint/no-explicit-any': 'off',
         '@typescript-eslint/no-non-null-assertion': 'off',
         'no-console': 'off',
      },
   },

   // ---------- Config/script files (plain Node, no type-aware lint) ----------
   {
      files: ['**/*.{cjs,mjs}', 'scripts/**/*.js'],
      ...tseslint.configs.disableTypeChecked,
      languageOptions: {
         globals: { ...globals.node },
      },
   },

   // ---------- Prettier: must be last, turns off conflicting style rules ----------
   prettierConfig,
);
