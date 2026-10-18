// The app-css gate. Used only by .claude/hooks/check-app-css.mjs and
// .claude/hooks/check-src-after-bash.mjs, not by eslint.config.mjs. Its counter
// twin is `appearance-in-app-css` in harness/counter/bem-counter.mjs; the two
// share no code.
export { checkStylesheet, stemOf, isGlobalStylesheet, remedyFor, baseUtility } from './layout-only.ts';
export { loadUtilityOracle, templateUtilities } from './template-utilities.ts';
