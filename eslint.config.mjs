import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import seal from './harness/gate/index.mjs';
import shape from './harness/gate/component-shape-index.mjs';
import layout from './harness/gate/layout-index.mjs';
import freeloader from './harness/gate/freeloader-index.mjs';
import applied from './harness/gate/applied-index.mjs';

// Every ESLint-hosted house rule. The sealing gate plus the component-shape plane. The `seal` plugin encodes
// the sealing spec (harness/sealing-spec.md) and `shape` encodes the
// component-shape spec (harness/component-shape-spec.md); the two structural
// counters encode the same specs independently. eslint-disable comments are
// switched off wholesale via noInlineConfig, because a rule with a suppression
// dial is not a rule. There is no escape hatch by design.
//
// The shape plane is listed here as well as in .claude/hooks/check-component-shape.mjs
// so that `npm run lint` enforces it. Before this, those fifteen rules ran ONLY
// when the PostToolUse hook fired on an agent's edit -- a human in an editor, or
// CI running lint, saw none of them. Across the entire Hero Ops Console build
// the shape plane never once cited a rule in the firing log, and a plane that
// fires for only one kind of author is only half a constitution.
//
// The same reasoning now covers the rest of the ESLint-hosted rules. `layout`
// (literal palette colors, space-* utilities, nested flex/grid), `freeloader`
// (legacy control flow, ngClass/ngStyle) and `applied` (appearance applied to a
// primitive through a sibling stylesheet) each have a Write/Edit hook in
// .claude/settings.json with exactly the settings below, and each is listed
// here so that lint and the hooks cannot disagree. Two gates are not ESLint
// plugins: the app-css gate and stylelint run from `npm run lint` as second and
// third commands (harness/gate/check-app-css-all.mjs over every stylesheet and
// template, then `stylelint "src/**/*.css"`).
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
    plugins: { seal, shape, layout, freeloader, applied },
    linterOptions: { noInlineConfig: true },
    rules: {
      'seal/no-raw-control': 'error',
      'seal/no-appearance-on-primitive': 'error',
      'seal/no-style-attribute': 'error',
      'seal/no-raw-icon': 'error',
      'seal/no-unknown-primitive': 'error',
      'seal/no-missing-composition-part': 'error',
      'seal/no-unportalled-overlay': 'error',
      'seal/no-class-on-forwarding-primitive': 'error',
      'shape/no-ng-model': 'error',
      'shape/no-orphan-ng-submit': 'error',
      'layout/no-raw-palette-color': 'error',
      'layout/no-space-utility': 'error',
      'layout/no-nested-flex-grid': 'error',
      'freeloader/no-legacy-control-flow': 'error',
      'freeloader/no-ng-class-style': 'error',
      'applied/no-applied-appearance-on-primitive': 'error',
    },
  },
];
