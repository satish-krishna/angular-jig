import noRawPaletteColor from './rules/no-raw-palette-color.mjs';
import noSpaceUtility from './rules/no-space-utility.mjs';

// The `layout` eslint plugin: the Part 2 template rules, mechanizing spartan's
// styling docs (semantic colors only, gap not space). Independent of the counter
// (angular-eslint parser vs the counter's @angular/compiler). messageIds map:
//   rawPaletteColor -> raw-palette-color
//   spaceUtility    -> space-utility
// The raw-css-literal rule is enforced by stylelint in the layout hook, not
// here (angular-eslint does not lint CSS). The nested-flex-grid heuristic is
// counter-only: too noisy to hard-block an edit.
const plugin = {
  meta: { name: 'layout', version: '1.0.0' },
  rules: {
    'no-raw-palette-color': noRawPaletteColor,
    'no-space-utility': noSpaceUtility,
  },
};

export default plugin;
