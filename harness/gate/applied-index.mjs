import noAppliedAppearanceOnPrimitive from './rules/no-applied-appearance-on-primitive.ts';

// The `applied` eslint plugin: series 2's one gate. Deliberately NOT part of the
// `seal` plugin or the repo's eslint.config.mjs: it runs only inside
// .claude/hooks/check-applied-appearance.mjs, which only the gate-on settings
// register, so a gate-off run that calls `npm run lint` never receives it.
// Its counter twin is the expanded appearance-on-primitive count in
// harness/counter/bem-counter.mjs (launching branch); the two share no code.
const plugin = {
  meta: { name: 'applied', version: '1.0.0' },
  rules: { 'no-applied-appearance-on-primitive': noAppliedAppearanceOnPrimitive },
};

export default plugin;
