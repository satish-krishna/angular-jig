import noLegacyControlFlow from './rules/no-legacy-control-flow.mjs';
import noNgClassStyle from './rules/no-ng-class-style.mjs';

// The `freeloader` eslint plugin: the Part 4 edit-time vocabulary rules, the
// second freeloader (the house rules the type-checker ignores). The first
// freeloader, strictTemplates, is the compiler and lives at the build, not here.
// Independent of the counter (angular-eslint parser vs @angular/compiler).
// messageId -> kind:
//   legacyControlFlow -> legacy-control-flow
//   ngClassStyle       -> ng-class-style
const plugin = {
  meta: { name: 'freeloader', version: '1.0.0' },
  rules: {
    'no-legacy-control-flow': noLegacyControlFlow,
    'no-ng-class-style': noNgClassStyle,
  },
};

export default plugin;
