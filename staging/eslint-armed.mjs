import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import seal from './harness/gate/index.mjs';
import shape from './harness/gate/component-shape-index.mjs';
import layout from './harness/gate/layout-index.mjs';
import freeloader from './harness/gate/freeloader-index.mjs';

// All four gate engines, armed. The `seal` plugin encodes the sealing spec; `shape`
// the component-shape spec; `layout` and `freeloader` their own. Every rule file
// under harness/gate/rules is reachable from one of the four bundles, and every one
// of them is enabled here: a rule that ships disarmed is a rule that does not exist.
//
// Rules are split by what they parse, not by which bundle they came from. `shape`
// appears in both blocks because two of its rules (no-ng-model, no-orphan-ng-submit)
// read the template AST while the other thirteen read TypeScript.
//
// eslint-disable comments are switched off wholesale via noInlineConfig, because a
// rule with a suppression dial is not a rule. There is no escape hatch by design.
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
    plugins: { shape },
    linterOptions: { noInlineConfig: true },
    rules: {
      'shape/no-hand-set-change-detection': 'error',
      'shape/no-component-subscribe': 'error',
      'shape/no-forms-module': 'error',
      'shape/no-restated-validator': 'error',
      'shape/no-presentational-inject': 'error',
      'shape/no-reactive-form': 'error',
      'shape/no-root-provided-view-model': 'error',
      'shape/no-state-outside-view-model': 'error',
      'shape/no-feature-inject-data': 'error',
      'shape/no-unprovided-view-model': 'error',
      'shape/no-explicit-standalone': 'error',
      'shape/no-legacy-icon-module': 'error',
      'shape/no-unregistered-icon': 'error',
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angular.templateParser },
    plugins: { seal, shape, layout, freeloader },
    linterOptions: { noInlineConfig: true },
    rules: {
      'seal/no-raw-control': 'error',
      'seal/no-appearance-on-primitive': 'error',
      'seal/no-style-attribute': 'error',
      'seal/no-raw-icon': 'error',
      'seal/no-unknown-primitive': 'error',
      'seal/no-missing-composition-part': 'error',
      'shape/no-ng-model': 'error',
      'shape/no-orphan-ng-submit': 'error',
      'layout/no-raw-palette-color': 'error',
      'layout/no-space-utility': 'error',
      'layout/no-nested-flex-grid': 'error',
      'freeloader/no-legacy-control-flow': 'error',
      'freeloader/no-ng-class-style': 'error',
    },
  },
];
