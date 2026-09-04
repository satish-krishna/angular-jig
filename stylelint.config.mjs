// The Part 2 CSS gate: tokens, not literals. A color or spacing value must be a
// design token (a var(--...) reference), not a hardcoded hex or pixel. This is
// the stylesheet half of the layout grammar (harness/layout-grammar-spec.md);
// the template half is the angular-eslint layout rules. The layout hook runs
// this over .css files and over inline `styles: []` blocks it extracts from
// components. The counter's own CSS scan is the independent auditor; this is the
// enforcement, and using stylelint's real postcss AST keeps the two engines
// genuinely different.
//
// color-no-hex is deliberately omitted: declaration-strict-value already flags a
// hex as "not a token," and adding color-no-hex would double-count the same hex
// and drift the gate's tally away from the counter's.
export default {
  plugins: ['stylelint-declaration-strict-value'],
  rules: {
    'scale-unlimited/declaration-strict-value': [
      ['/color/', 'background', '/padding/', '/margin/', 'gap', 'border-radius'],
      {
        ignoreValues: [
          'transparent',
          'currentColor',
          'inherit',
          'initial',
          'unset',
          'none',
          'auto',
          '0',
        ],
        disableFix: true,
      },
    ],
  },
};
