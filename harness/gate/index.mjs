import noRawControl from './rules/no-raw-control.mjs';
import noAppearanceOnPrimitive from './rules/no-appearance-on-primitive.mjs';
import noStyleAttribute from './rules/no-style-attribute.mjs';
import noRawIcon from './rules/no-raw-icon.mjs';
import noUnknownPrimitive from './rules/no-unknown-primitive.mjs';
import noMissingCompositionPart from './rules/no-missing-composition-part.mjs';

// The `seal` eslint plugin: the six custom template rules that encode the
// sealing spec. This is one of the two independent engines; the other is
// harness/counter/counter.mjs. They share the spec (../sealing-spec.md), not
// code. Each rule's messageId maps one-to-one onto a counter `kind`:
//   rawControl              -> raw-control
//   appearanceOnPrimitive   -> appearance-on-primitive
//   styleAttribute          -> style-attribute
//   rawIcon                 -> raw-icon
//   unknownPrimitive        -> unknown-primitive
//   missingCompositionPart  -> missing-composition-part
const plugin = {
  meta: { name: 'seal', version: '1.0.0' },
  rules: {
    'no-raw-control': noRawControl,
    'no-appearance-on-primitive': noAppearanceOnPrimitive,
    'no-style-attribute': noStyleAttribute,
    'no-raw-icon': noRawIcon,
    'no-unknown-primitive': noUnknownPrimitive,
    'no-missing-composition-part': noMissingCompositionPart,
  },
};

export default plugin;
