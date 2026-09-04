import noRawControl from './rules/no-raw-control.mjs';
import noClassOnPrimitive from './rules/no-class-on-primitive.mjs';
import noStyleAttribute from './rules/no-style-attribute.mjs';

// The `seal` eslint plugin: the three custom template rules that encode the
// Part 1 sealing spec. This is one of the two independent engines; the other is
// harness/counter/counter.mjs. They share the spec (../sealing-spec.md), not
// code. Each rule's messageId maps one-to-one onto a counter `kind`:
//   rawControl        -> raw-control
//   classOnPrimitive  -> class-on-primitive
//   styleAttribute    -> style-attribute
const plugin = {
  meta: { name: 'seal', version: '1.0.0' },
  rules: {
    'no-raw-control': noRawControl,
    'no-class-on-primitive': noClassOnPrimitive,
    'no-style-attribute': noStyleAttribute,
  },
};

export default plugin;
