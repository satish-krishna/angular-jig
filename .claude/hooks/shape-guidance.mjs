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

// The worked-example corrective for the capstone's MVVM rules (7-10). Same
// rationale as SHAPE_FORMS_GUIDANCE above: a rejection is the highest-salience
// teaching moment, and the MVVM shape is the sharpest non-native pattern in the
// series (nothing in the agent's baseline suggests a component-scoped
// ViewModel), so the fix a bare rule message can state in one line is not
// enough here either. Copy this exact shape:
export const MVVM_GUIDANCE = [
  '',
  'Use the house MVVM pattern: a container owns its state through a component-scoped',
  'ViewModel it provides and injects; it holds no signal()/computed() and injects no',
  'data service itself. Copy this exact shape:',
  '',
  '  // hero-detail.view-model.ts',
  "  import { Injectable, inject, signal, computed } from '@angular/core';",
  "  import { HeroService } from './hero.service';",
  '',
  '  @Injectable() // no providedIn: this ViewModel is scoped to the component that provides it',
  '  export class HeroDetailViewModel {',
  '    private readonly heroes = inject(HeroService);',
  "    readonly query = signal('');",
  '    readonly filtered = computed(() => this.heroes.list().filter((h) => h.name.includes(this.query())));',
  '  }',
  '',
  '  // hero-detail.ts',
  '  @Component({',
  "    selector: 'app-hero-detail',",
  '    providers: [HeroDetailViewModel], // provided at component scope, where it is injected',
  '    template: `<p>{{ vm.filtered().length }}</p>`,',
  '  })',
  '  export class HeroDetail {',
  '    protected readonly vm = inject(HeroDetailViewModel); // inject the ViewModel, not the service',
  '    protected readonly route = inject(ActivatedRoute); // routing is still fine directly in the component',
  '    // no signal()/computed() and no inject(HeroService) here: the ViewModel owns both',
  '  }',
  '',
  "Read the house-style skill's MVVM section for the full example.",
].join('\n');

// The messageIds/ruleIds whose fix is the MVVM worked example above.
export const MVVM_RULE_IDS = new Set([
  'shape/no-root-provided-view-model',
  'shape/no-state-outside-view-model',
  'shape/no-feature-inject-data',
  'shape/no-unprovided-view-model',
]);
