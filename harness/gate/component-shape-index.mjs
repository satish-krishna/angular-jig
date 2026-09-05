import noHandSetChangeDetection from './rules/no-hand-set-change-detection.mjs';
import noComponentSubscribe from './rules/no-component-subscribe.mjs';
import noFormsModule from './rules/no-forms-module.mjs';
import noRestatedValidator from './rules/no-restated-validator.mjs';
import noPresentationalInject from './rules/no-presentational-inject.mjs';
import noReactiveForm from './rules/no-reactive-form.mjs';
import noNgModel from './rules/no-ng-model.mjs';
import noRootProvidedViewModel from './rules/no-root-provided-view-model.mjs';
import noStateOutsideViewModel from './rules/no-state-outside-view-model.mjs';
import noFeatureInjectData from './rules/no-feature-inject-data.mjs';
import noUnprovidedViewModel from './rules/no-unprovided-view-model.mjs';

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
//   reactiveForm           -> reactive-form
//   vmNotComponentScoped   -> vm-not-component-scoped   (capstone MVVM, rule 7)
//   stateOutsideVm         -> state-outside-vm           (capstone MVVM, rule 8)
//   featureInjectsData     -> feature-injects-data       (capstone MVVM, rule 9)
//   vmNotProvided          -> vm-not-provided            (capstone MVVM, rule 10)
// The two heuristics (hand-written-form-model, dumb-holds-state) are counter-only
// and deliberately have no gate rule.
const plugin = {
  meta: { name: 'shape', version: '1.0.0' },
  rules: {
    'no-hand-set-change-detection': noHandSetChangeDetection,
    'no-component-subscribe': noComponentSubscribe,
    'no-forms-module': noFormsModule,
    'no-restated-validator': noRestatedValidator,
    'no-presentational-inject': noPresentationalInject,
    'no-reactive-form': noReactiveForm,
    'no-ng-model': noNgModel,
    'no-root-provided-view-model': noRootProvidedViewModel,
    'no-state-outside-view-model': noStateOutsideViewModel,
    'no-feature-inject-data': noFeatureInjectData,
    'no-unprovided-view-model': noUnprovidedViewModel,
  },
};

export default plugin;
