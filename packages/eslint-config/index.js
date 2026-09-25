import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default tseslint.config(
   /** গ্লোবাল ইগনোর (বিল্ড ফোল্ডার বা নোড মডিউলস চেক করবে না) */
   {
      ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.config.js', 'scripts/**'],
   },

   /** জেন্ডারাল জেএস এবং টাইপস্ক্রিপ্ট রিকমেন্ডেড রুলস */
   js.configs.recommended,
   ...tseslint.configs.recommended,

   {
      files: ['**/*.{ts,tsx,js,jsx}'],
      languageOptions: {
         ecmaVersion: 'latest',
         sourceType: 'module',
         globals: {
            /** যেহেতু ব্যাকএন্ড প্যাকেজ, তাই নোড গ্লোবালস অ্যাক্টিভ থাকবে */
            ...globals.node,
            ...globals.es2025,
         },
         parserOptions: {
            /** টাইপ-অওয়ার লিন্টিংয়ের জন্য */
            project: './tsconfig.json',
         },
      },
      plugins: {
         'unused-imports': unusedImports,
         'simple-import-sort': simpleImportSort,
      },
      rules: {
         /** আনইউজড ভেরিয়েবল বা ইমপোর্ট হ্যান্ডলিং */
         '@typescript-eslint/no-unused-vars': 'off',
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

         /** ইমপোর্ট অর্ডারিং সর্টিং (অটোমেটিক গোছানো রাখবে) */
         'simple-import-sort/imports': 'error',
         'simple-import-sort/exports': 'error',

         // প্রোডাকশন সেফটি রুলস
         'no-console': ['warn', { allow: ['warn', 'error'] }], // কনসোল লগ থাকলে ওয়ার্নিং দেবে
         'prefer-const': 'error',
         '@typescript-eslint/no-explicit-any': 'warn', // `any` টাইপ ব্যবহার করলে অ্যালার্ট করবে
         '@typescript-eslint/consistent-type-imports': 'error', // টাইপ ইমপোর্ট সবসময় `import type` দিয়ে করতে বাধ্য করবে
      },
   },
);
