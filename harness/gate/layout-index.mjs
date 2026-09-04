import noLiteralValue from './rules/no-literal-value.mjs';
import noPresentationOnRaw from './rules/no-presentation-on-raw.mjs';

// The `layout` eslint plugin: the Part 2 layout-grammar rules on the template
// surface. Independent of the counter (angular-eslint parser vs the counter's
// @angular/compiler). messageIds map onto counter kinds:
//   literalValue       -> literal-value
//   presentationOnRaw  -> presentation-on-raw
// The nested-flex-grid heuristic is deliberately counter-only: it is measured,
// not enforced, because a low-confidence heuristic should not hard-block an edit.
// Stylesheet literals are enforced by the gate's separate CSS check, not here.
const plugin = {
  meta: { name: 'layout', version: '1.0.0' },
  rules: {
    'no-literal-value': noLiteralValue,
    'no-presentation-on-raw': noPresentationOnRaw,
  },
};

export default plugin;
