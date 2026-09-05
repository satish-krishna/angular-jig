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
import noExplicitStandalone from './rules/no-explicit-standalone.mjs';
import noLegacyIconModule from './rules/no-legacy-icon-module.mjs';
import noUnregisteredIcon from './rules/no-unregistered-icon.mjs';
import noOrphanNgSubmit from './rules/no-orphan-ng-submit.mjs';

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
    'no-explicit-standalone': noExplicitStandalone,
    'no-legacy-icon-module': noLegacyIconModule,
    'no-unregistered-icon': noUnregisteredIcon,
    'no-orphan-ng-submit': noOrphanNgSubmit,
  },
};

export default plugin;
