import noRawPaletteColor from './rules/no-raw-palette-color.mjs';
import noSpaceUtility from './rules/no-space-utility.mjs';
import noNestedFlexGrid from './rules/no-nested-flex-grid.mjs';

const plugin = {
  meta: { name: 'layout', version: '1.0.0' },
  rules: {
    'no-raw-palette-color': noRawPaletteColor,
    'no-space-utility': noSpaceUtility,
    'no-nested-flex-grid': noNestedFlexGrid,
  },
};

export default plugin;
