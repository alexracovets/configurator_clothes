import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const importSortGroups = [
  ['^react$', '^react-dom$'],
  ['^next'],
  ['^@react-three', '^three', '^konva'],
  ['^@radix-ui', '^@base-ui', '^@tailwindcss'],
  ['^[^@./]'],
  [
    '^@organisms',
    '^@molecules',
    '^@atoms',
    '^@shared',
    '^@templates',
    '^@pages',
    '^@store',
    '^@hooks',
    '^@utils',
    '^@shaders',
    '^@fonts',
    '^@constants',
    '^@types',
    '^@styles',
  ],
  ['^@?\\w'],
  ['^\\.'],
];

const eslintConfig = defineConfig([
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
    },
    rules: {
      'object-curly-newline': 'off',

      'import/no-duplicates': ['error', { 'prefer-inline': false }],

      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true,
          ignoreCase: true,
        },
      ],
      'simple-import-sort/imports': ['error', { groups: importSortGroups }],
      'simple-import-sort/exports': 'error',
    },
  },
  eslintConfigPrettier,
]);

export default eslintConfig;
