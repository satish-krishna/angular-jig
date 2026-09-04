import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import seal from './harness/gate/index.mjs';

// The Part 1 sealing gate. Three custom template rules (the `seal` plugin)
// encode the sealing spec (harness/sealing-spec.md); the structural counter
// encodes the same spec independently. eslint-disable comments are switched off
// wholesale via noInlineConfig, because a rule with a suppression dial is not a
// rule. There is no escape hatch by design.
export default [
  {
    ignores: ['dist/**', '.angular/**', 'node_modules/**', 'coverage/**', 'libs/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { project: false },
    },
    processor: angular.processInlineTemplates,
    linterOptions: { noInlineConfig: true },
  },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angular.templateParser },
    plugins: { seal },
    linterOptions: { noInlineConfig: true },
    rules: {
      'seal/no-raw-control': 'error',
      'seal/no-class-on-primitive': 'error',
      'seal/no-style-attribute': 'error',
    },
  },
];
