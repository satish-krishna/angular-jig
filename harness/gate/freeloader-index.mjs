import noLegacyControlFlow from './rules/no-legacy-control-flow.mjs';
import noNgClassStyle from './rules/no-ng-class-style.mjs';

const plugin = {
  meta: { name: 'freeloader', version: '1.0.0' },
  rules: {
    'no-legacy-control-flow': noLegacyControlFlow,
    'no-ng-class-style': noNgClassStyle,
  },
};

export default plugin;
