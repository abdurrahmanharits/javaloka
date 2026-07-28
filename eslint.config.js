import js from '@eslint/js';
import globals from 'globals';

export default [
    { ignores: ['dist/**', 'node_modules/**', 'vendor/**', 'public/**', 'resources/**', 'database/**', 'app/**', 'bootstrap/**', 'config/**', 'routes/**'] },
    js.configs.recommended,
    { files: ['**/*.{js,jsx}'], languageOptions: { ecmaVersion: 'latest', sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } }, globals: { ...globals.browser, ...globals.node } }, rules: { 'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }] } },
];
