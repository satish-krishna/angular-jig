// The worked-example corrective for the forms rules of the component-shape gate.
// A gate rejection is the highest-salience teaching moment the agent gets, so it
// hands back the documented right pattern (signal-forms driven by a zod schema),
// not just the violation. Part 3's gate-on-guided A/B measured this: swapping a
// prose reminder for this worked example took house-pattern use from 0/3 to 3/3.
// Shared by the shape hook and its experiment variant so the two never drift.
export const SHAPE_FORMS_GUIDANCE = [
  '',
  'Use the house forms pattern: Angular signal-forms driven by a zod schema.',
  'Do NOT hand-roll a form with a plain signal, a manual (change) handler, and a',
  'safeParse on submit; that passes the rules but is not the pattern. Copy this exact shape:',
  '',
  '  // hero.schema.ts',
  "  import { z } from 'zod';",
  '  export const heroSchema = z.object({ name: z.string().min(1) });',
  '  export type HeroModel = z.infer<typeof heroSchema>;',
  '',
  '  // hero-detail.ts',
  "  import { form, submit, validateStandardSchema } from '@angular/forms/signals';",
  '  protected readonly model = signal<HeroModel>({ name: loadedHero.name });',
  '  protected readonly heroForm = form(this.model, (path) => validateStandardSchema(path, heroSchema));',
  '',
  '  <!-- template -->',
  '  <input hlmInput [formField]="heroForm.name" />',
  '  @for (e of heroForm.name().errors(); track e.kind) { <hlm-field-error>{{ e.message }}</hlm-field-error> }',
  '',
  "Read the house-style skill's Forms section for the full example.",
].join('\n');

// The messageIds/ruleIds whose fix is the forms worked example above. The other
// shape rules (change detection, subscribe, presentational inject) carry their
// own one-line fix in the rule message and do not need the form snippet.
export const FORMS_RULE_IDS = new Set([
  'shape/no-reactive-form',
  'shape/no-forms-module',
  'shape/no-restated-validator',
  'shape/no-ng-model',
]);
