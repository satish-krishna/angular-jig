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

// The worked-example corrective for the two icon rules added after the
// capstone (rules 12 and 13). Both fail silently rather than loudly:
// NgIconsModule throws at bootstrap and takes the whole app down with a blank
// page, while a hand-rolled registration (a custom token, a plain object)
// typechecks and registers nothing, so the build is green and the icons are
// blank. That is exactly the drift a one-line rule message will not stop, so
// the fix is the worked example, copied from the house-style skill's icons
// section verbatim.
export const ICON_GUIDANCE = [
  '',
  'Icons: import the standalone NgIcon, never NgIconsModule, and register every',
  'icon the component renders with provideIcons. Copy this exact shape:',
  '',
  "  import { NgIcon, provideIcons } from '@ng-icons/core';",
  "  import { lucideUsers } from '@ng-icons/lucide';",
  '',
  '  @Component({',
  '    imports: [NgIcon],',
  '    providers: [provideIcons({ lucideUsers })],',
  '    template: `<ng-icon name="lucideUsers" />`,',
  '  })',
  '',
  'Do NOT import NgIconsModule (throws at bootstrap), and do NOT register an icon',
  "through a custom token or a plain object (registers nothing): only provideIcons",
  'registers an icon.',
  '',
  "Read the house-style skill's icons section for the full example.",
].join('\n');

// The messageIds/ruleIds whose fix is the icon worked example above.
export const ICON_RULE_IDS = new Set(['shape/no-legacy-icon-module', 'shape/no-unregistered-icon']);

// The worked-example corrective for rule 14, orphan-ng-submit. The gate
// caused this one: banning FormsModule and ReactiveFormsModule (rules 3 and
// 6) also removes the only directives that ever supply the `ngSubmit` output,
// so `(ngSubmit)` on a native `<form>` is not an error, it is a DOM listener
// for an event nothing fires. A bare "don't do this" would leave the agent's
// prior for "how a form submits" with nowhere to go, so the fix names the
// actual submit path, copied from the house-style skill's "Submitting a form"
// section verbatim.
export const SUBMIT_GUIDANCE = [
  '',
  'There is exactly one submit path in this repo: submit(this.form, ...) from',
  '@angular/forms/signals. (ngSubmit) is not part of it; NgForm and',
  'FormGroupDirective, the only directives that fire it, ship with FormsModule and',
  'ReactiveFormsModule, and this repo uses neither, so the binding is dead.',
  'Copy this exact shape:',
  '',
  '  <!-- template: no (ngSubmit) on the <form> -->',
  '  <form>',
  '    <hlm-field> ... </hlm-field>',
  '    <button hlmBtn type="submit">Save</button>',
  '  </form>',
  '',
  '  // class: wire the submit through the form itself',
  "  import { submit } from '@angular/forms/signals';",
  '  protected readonly save = () => submit(this.form, async (f) => { /* ... */ });',
  '',
  "Read the house-style skill's \"Submitting a form\" section for the full example.",
].join('\n');

// The messageIds/ruleIds whose fix is the submit worked example above.
export const SUBMIT_RULE_IDS = new Set(['shape/no-orphan-ng-submit']);
