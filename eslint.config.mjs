import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['node_modules/', 'dist/', '.turbo/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        projectService: true, // Tells ESLint to use the nearest tsconfig
        tsconfigRootDir: import.meta.dirname, // Anchors the resolution to the root
      },
      globals: {
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
      },
    },
  }
);