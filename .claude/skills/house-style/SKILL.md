---
name: house-style
description: The house frontend conventions for this repo, layered on top of the SpartanNG docs. Read before writing or editing any template or component stylesheet. Covers the layout grammar (grid for regions, flex for inline runs, no nested flex faking a grid) and the no-raw-literals rule for hand-written CSS. These extend the spartan docs where spartan is silent; they never contradict them.
---

# House frontend conventions

These are this repo's conventions, layered on top of the SpartanNG docs (the `spartan` skill). They extend the spartan docs where spartan is silent; they never contradict them. Where spartan already has a rule (semantic colors, `class` is for layout only, `gap-*` not `space-*`, `size-*` for equal dimensions), follow the spartan skill; this file adds only what spartan does not cover.

## Layout is a grammar

Layout is expressed with a small, fixed vocabulary, so that a screen's structure is decidable rather than a matter of taste.

- **Grid for regions.** A two-dimensional arrangement (a dashboard of cards, a page split into named areas, anything laid out in both rows and columns) uses CSS grid: `grid`, `grid-cols-*`, `grid-rows-*`, `gap-*`. Reach for grid whenever you are placing blocks in two dimensions.
- **Flex for inline runs.** `flex` is for a single-axis run of items: a row of buttons, an icon next to a label, a toolbar. One direction, one line of thought.
- **Do not nest flex to fake a grid.** A row of flex columns, each itself a flex stack, arranged to line up into a grid, is the anti-pattern. If the result reads as a grid, use grid. Nesting flex containers to approximate two-dimensional layout is not allowed.

Good:

```html
<!-- a two-dimensional card dashboard: grid -->
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <section hlmCard>...</section>
  <section hlmCard>...</section>
</div>

<!-- a single inline run: flex -->
<div class="flex items-center gap-2">
  <button hlmBtn variant="ghost">Cancel</button>
  <button hlmBtn>Save</button>
</div>
```

Bad:

```html
<!-- nested flex faking a grid: use grid instead -->
<div class="flex flex-wrap">
  <div class="flex flex-col">...</div>
  <div class="flex flex-col">...</div>
</div>
```

## No raw literals in hand-written CSS

Prefer Tailwind utilities and the spartan primitives over hand-written component stylesheets. When you do write a component stylesheet (an inline `styles: []` block or a `styleUrl` file), every color and length is a design token, never a raw literal:

- Colors come from the semantic token variables (`var(--primary)`, `var(--border)`, `var(--card)`), never a raw hex, `rgb()`, or `hsl()`.
- Lengths come from a token or the spacing scale, never a raw `px` value.

Good:

```css
.panel {
  background: var(--card);
  border: 1px solid var(--border);
  padding: var(--spacing-4);
  border-radius: var(--radius);
}
```

Bad:

```css
.panel {
  background: #3b82f6;
  padding: 16px;
}
```

This rule is about hand-written CSS, where spartan is silent because it assumes you use Tailwind utilities. It does NOT restrict spartan's own idiomatic Tailwind arbitrary values in templates (for example a one-off `sm:max-w-[425px]` on a dialog), which the spartan docs use and bless. In templates, follow the spartan color rule (semantic tokens, never a raw palette value like `bg-blue-500`); this file governs the stylesheet you write by hand.

## Component shape: containers and presentational components

Angular's `CLAUDE.md` says to keep components small and single-responsibility; it does not say how to split them. This repo does, so the split is decidable rather than a matter of taste.

- **Container (smart) components** are the routed feature components. They inject the application's data services (`HttpClient`, a `HeroService`, a store), hold the signals, and pass state down. They live in their feature folder (`src/app/heroes`, `src/app/dashboard`).
- **Presentational (dumb) components** live under `src/app/ui/`. They receive state through `input()`, emit through `output()`, and use `model()` for two-way binding. They inject no application data service: a presentational component that reaches for `HttpClient` or a feature `*Service` is doing a container's job and belongs in a feature folder instead. Injecting a pure framework or UI helper (`ElementRef`, `DestroyRef`, a spartan service) is fine; injecting data is not.

Good:

```ts
// src/app/ui/hero-card.ts: presentational, no data service
@Component({ selector: 'app-hero-card', /* ... */ })
export class HeroCard {
  readonly hero = input.required<Hero>();
  readonly selected = output<Hero>();
}
```

Bad:

```ts
// src/app/ui/hero-card.ts: a presentational component injecting a data service
@Component({ selector: 'app-hero-card', /* ... */ })
export class HeroCard {
  private readonly heroes = inject(HeroService); // belongs in a container
  readonly hero = input.required<Hero>();
}
```

Two shape rules follow from the Angular baseline and are stated here so they are one place to read:

- **Do not hand-set change detection.** `OnPush` is the Angular v22 default, and `CLAUDE.md` says not to set `changeDetection` explicitly. So writing `changeDetection: ChangeDetectionStrategy.OnPush` (or `.Default`) in a `@Component` is drift, not diligence. Leave it off.
- **No `.subscribe` in a component.** `CLAUDE.md` says to handle observables with the async pipe. A component that calls `.subscribe(...)` on an observable is managing a subscription by hand where the template could do it. Convert at the edge and bind with the async pipe (or `toSignal`).

## Forms: schema-driven with zod

Forms in this repo are schema-driven. A zod schema is the single source of truth for a form's shape, its validation, and its field labels; the form component reads from the schema and never restates what the schema already says.

- **The model type is `z.infer<typeof schema>`.** Never hand-write a form-model interface; infer it from the schema so the shape lives in one place.
- **Validation flows through the schema.** Build the form with Angular signal-forms and validate the whole form through zod: `form(model, (path) => validateStandardSchema(path, schema))`. zod 4 is a Standard Schema, so Angular validates it natively. Do NOT restate a rule as a per-field signal-forms validator (`required`, `minLength`, `maxLength`, `min`, `max`, `email`, `pattern`): the schema already owns those. `validateStandardSchema` is the one blessed validator; `validateHttp` and `validateAsync` stay available for server-side checks a schema cannot express.
- **Labels ride on the schema** via each field's `.meta()`, read with `formMeta(schema)` from `src/app/forms/zod-meta.ts`. Do not hard-code a label the schema already carries.
- **Controls are spartan helm.** Wrap each control in `hlm-field`, bind with `[formField]="form.name"`, and show errors from `form.name().errors()`. Submit valid data with `submit(this.form, async () => { ... })`.
- **No template-driven forms, and no reactive forms.** Do not use `ngModel`, `FormsModule`, or the template-driven directives. Reactive forms (`FormGroup`/`FormControl`/`FormBuilder`) are not this repo's pattern either: a form's schema is always known here, so author it with signal-forms and zod.

The schema lives beside the form as `<feature>.schema.ts`, exporting the schema and `export type XModel = z.infer<typeof schema>`.

Good:

```ts
// hero.schema.ts
export const heroSchema = z.object({
  name: z.string().min(1).meta({ label: 'Name', control: 'text' } satisfies FormFieldMeta),
});
export type HeroModel = z.infer<typeof heroSchema>;
```

```ts
// hero-form.ts (no explicit changeDetection: OnPush is the v22 default)
protected readonly model = signal<HeroModel>({ name: '' });
protected readonly form = form(this.model, (path) => validateStandardSchema(path, heroSchema));
protected readonly meta = formMeta(heroSchema);
```

Bad:

```ts
// a hand-written model, and a rule the schema already states
interface HeroModel { name: string; }             // should be z.infer<typeof heroSchema>
readonly form = form(this.model, (path) => {
  required(path.name);                             // the schema already requires it
});
```

```html
<!-- template-driven: not used in this repo -->
<input [(ngModel)]="hero.name" name="name" />
```

## Why these are written down

The whole point of this repo is that a written convention is not a guardrail: the model reads good docs and drifts anyway. These conventions exist so the drift has something concrete to be measured and gated against. They are here to be mechanized, not merely remembered.
