// The app-css gate (series 2 phase 3). Used only by .claude/hooks/check-app-css.mjs
// and .claude/hooks/check-src-after-bash.mjs, which only the series 3 gate-on
// settings register. Its counter twin is `appearance-in-app-css` in
// harness/counter/bem-counter.mjs on the launching branch; the two share no code.
export { checkStylesheet, stemOf, isGlobalStylesheet, remedyFor, baseUtility } from './layout-only.ts';
export { loadUtilityOracle, templateUtilities } from './template-utilities.ts';
