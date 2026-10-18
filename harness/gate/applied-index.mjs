import noAppliedAppearanceOnPrimitive from './rules/no-applied-appearance-on-primitive.ts';

// The `applied` eslint plugin. Not part of the `seal` plugin. It runs inside
// .claude/hooks/check-applied-appearance.mjs and check-src-after-bash.mjs, and is
// also listed in the repo's eslint.config.mjs so `npm run lint` runs it. Its counter
// twin is the expanded appearance-on-primitive count in
// harness/counter/bem-counter.mjs; the two share no code.
const plugin = {
  meta: { name: 'applied', version: '1.0.0' },
  rules: { 'no-applied-appearance-on-primitive': noAppliedAppearanceOnPrimitive },
};

export default plugin;
