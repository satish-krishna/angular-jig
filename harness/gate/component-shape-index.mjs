import noHandSetChangeDetection from './rules/no-hand-set-change-detection.mjs';
import noComponentSubscribe from './rules/no-component-subscribe.mjs';
import noFormsModule from './rules/no-forms-module.mjs';
import noRestatedValidator from './rules/no-restated-validator.mjs';
import noPresentationalInject from './rules/no-presentational-inject.mjs';
import noNgModel from './rules/no-ng-model.mjs';

// The `shape` eslint plugin: the Part 3 component-shape rules, encoding the
// component-shape spec (../component-shape-spec.md). It is the second of the two
// independent engines; the other is harness/counter/component-shape-counter.mjs.
// They share the spec, not code. The TypeScript rules run under typescript-eslint;
// no-ng-model runs under the angular-eslint template parser. messageId -> kind:
//   handSetChangeDetection -> hand-set-change-detection
//   componentSubscribe     -> component-subscribe
//   formsModule            -> template-driven-form  (TypeScript half)
//   ngModel                -> template-driven-form  (template half)
//   restatedValidator      -> restated-validator
//   presentationalInject   -> presentational-injects-data
// The three heuristics (hand-written-form-model, reactive-form, dumb-holds-state)
// are counter-only and deliberately have no gate rule.
const plugin = {
  meta: { name: 'shape', version: '1.0.0' },
  rules: {
    'no-hand-set-change-detection': noHandSetChangeDetection,
    'no-component-subscribe': noComponentSubscribe,
    'no-forms-module': noFormsModule,
    'no-restated-validator': noRestatedValidator,
    'no-presentational-inject': noPresentationalInject,
    'no-ng-model': noNgModel,
  },
};

export default plugin;
