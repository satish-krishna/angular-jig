# The component-shape spec (Part 3)

The written contract for Part 3, encoded twice and independently: by the gate (typescript-eslint over component `.ts` files, and angular-eslint over templates for the one template-level rule) and by the counter (the TypeScript compiler API for `.ts`, and Angular's own compiler for templates). Neither shares code, parser, or AST types with the other. This file is the arbiter if the two disagree on a fixture; one of the encodings is then wrong.

Read `sealing-spec.md` (Part 1) and `layout-grammar-spec.md` (Part 2) first. Part 3 is the last of the vocabulary arc, and it moves from the template into the component class: most of its rules are TypeScript-AST properties, not template ones.

## The rules are the docs, mechanized

Same load-bearing principle as Parts 1 and 2: every rule comes from a doc in the agent's baseline, and the gate enforces exactly what those docs say and permits everything they permit. Three sources feed Part 3, all present in both run conditions:

- **Angular's generated `CLAUDE.md`**: `OnPush` is the v22 default so do not set `changeDetection` explicitly; use the async pipe for observables; keep components small and single-responsibility; prefer signals for state.
- **The spartan `forms.md` doc**: spartan's `hlmField` and controls work with template-driven, reactive, and signal forms alike. Spartan is neutral on which forms API you use; it does not ban any. So the forms rule is not spartan's, it is the house doc's.
- **The house-style skill** (`.claude/skills/house-style`, `.agents/skills/house-style`): the container/presentational split (presentational components live under `src/app/ui/` and inject no application data service), and the schema-driven forms pattern (a zod schema is the single source of truth; the model is `z.infer<typeof schema>`; validation flows through `validateStandardSchema(path, schema)` and is never restated as a per-field validator; template-driven and reactive forms are not used).

Two of Part 3's five gated rules are drawn straight from Angular's `CLAUDE.md` and need no new doc: no hand-set `changeDetection`, and no `.subscribe` in a component. The other three (template-driven forms, restated validators, and a presentational component injecting a data service) exceed or sharpen what Angular's docs cleanly decide, so, per the series principle, the house-style skill was written first and only then gated. Doc-first, always, and here also **code-first**: the schema-driven pattern is unusable unless the repo actually has the substrate it names, so `zod` is installed and the `src/app/forms` helpers (`FormFieldMeta`, `formMeta`) are added before the gate mechanizes the rule. A gate for `validateStandardSchema` while the agent cannot import it would be a trap, not a test. Where Angular's docs express a preference rather than a prohibition, the gate does not harden the preference into a defect; that residue (a reactive form, a hand-written model where `z.infer` fit) is measured by the counter only.

## What is installed (read from source, not memory)

At this substrate commit: Angular 22.1, SpartanNG 1.4.1, typescript-eslint 8.69, angular-eslint 22.2, and zod 4 (added as the forms substrate for this Part). Angular signal-forms ship inside `@angular/forms` as `@angular/forms/signals`; the installed build exports `form`, `submit`, `FormField`, `validateStandardSchema`, and the per-field validators `required`, `minLength`, `maxLength`, `min`, `max`, `email`, `pattern` (plus `validate`, `validateAsync`, `validateHttp`, `validateTree` for logic a schema cannot own). Because zod 4 is a Standard Schema, `validateStandardSchema(path, schema)` validates a whole signal-form through the zod schema natively, which is what makes the schema the single source of truth rather than a parallel copy of the rules.

The original Part 3 sketch said "schema-owned forms with zod," and that was correct: the house forms pattern is schema-driven with zod. A mid-series note that struck zod (reading only the earlier repo state, where zod was not yet installed and the baseline mentioned only signal-forms) was wrong and is reversed here. The `src/app/forms` helpers and the `<feature>.schema.ts` convention are the code half of the doc-first move.

## The measurement model (cumulative baseline)

By Part 3 the Part 1 sealing hook and the Part 2 layout hook are baseline: on in both conditions. The single variable Part 3 moves is the component-shape gate. gate-off is sealing plus layout; gate-on is sealing plus layout plus component shape. The full baseline (both MCP servers, the spartan and house-style skills including the new component-shape and forms sections, Angular's `CLAUDE.md`, and the installed forms substrate) is identical and present in both conditions.

## The rules (hard-gated)

Every gated Part 3 violation is one of exactly five kinds. The gate reports them by `messageId`; the counter tallies them by `kind`. The kind strings are the shared vocabulary and must match on both sides.

### 1. `hand-set-change-detection`: an explicit `changeDetection` in `@Component`

Docs: `CLAUDE.md`, "Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+." The decidable property is the inverse of the original sketch: the violation is setting `changeDetection` at all, to any value, not the absence of `OnPush`.

- Violation: a `@Component({ ... })` decorator whose metadata object has a `changeDetection` property (whether `OnPush` or `Default`).
- Good (passes): a `@Component` with no `changeDetection` key. Bad (fails): `@Component({ changeDetection: ChangeDetectionStrategy.OnPush })`, `@Component({ changeDetection: ChangeDetectionStrategy.Default })`.

Decidable from the TS AST alone: the presence of the property key in the decorator's object literal. No type information required.

### 2. `component-subscribe`: a `.subscribe(...)` call inside a component class

Docs: `CLAUDE.md`, "Use the async pipe to handle observables." A component that calls `.subscribe(...)` is hand-managing a subscription where the template's async pipe (or `toSignal`) would do it. The residue this rule targets is the reflex of subscribing to route params, a service observable, or a valueChanges stream inside `ngOnInit`.

- Violation: a call expression of the form `<expr>.subscribe(...)` textually inside the body of a class decorated with `@Component`.
- Good (passes): binding an observable with the async pipe in the template, or `toSignal(obs)` in the class. Bad (fails): `this.route.params.subscribe(p => ...)`, `this.heroes.getAll().subscribe(...)` in a component.

Scope note: the rule fires only inside `@Component` classes, not services or resolvers, where `.subscribe` is legitimate. A member access named `subscribe` is the signal; this is a syntactic property, so a variable literally named `subscribe` that is not a call is not flagged. False-positive risk (a non-RxJS `.subscribe`) is low in a component and is accepted, because the whole point is that a component should not be the place subscriptions live.

### 3. `template-driven-form`: `ngModel` or `FormsModule`

Docs: the house-style skill, "No template-driven forms." `CLAUDE.md` ranks template-driven last; the house doc removes it entirely, along with reactive forms, in favor of the schema-driven signal-forms pattern. This kind spans both engines, because template-driven forms show up in two places.

- Violation (template): an `ngModel` binding on a control, in any form: `[(ngModel)]="x"`, `[ngModel]="x"`, or a bare `ngModel` attribute.
- Violation (TypeScript): `FormsModule` in a component's `imports` array.
- Good (passes): a signal-form bound with `[formField]` and validated through `validateStandardSchema`. Bad (fails): `<input [(ngModel)]="hero.name" name="name" />`, or `imports: [FormsModule]`.

The template half is checked by the gate with the angular-eslint template parser and by the counter with `@angular/compiler`; the TypeScript half (`FormsModule` import) by typescript-eslint in the gate and the TS compiler API in the counter.

### 4. `restated-validator`: a per-field signal-forms validator the schema already owns

Docs: the house-style skill, "Do NOT restate a rule as a per-field signal-forms validator: the schema already owns those." The house forms pattern makes the zod schema the single source of truth and reaches the form through `validateStandardSchema(path, schema)`. Calling a per-field validator in the form's rule function duplicates a rule the schema states, which is the exact smell the schema-driven pattern exists to remove.

- Violation: a call, inside a component, to one of the signal-forms per-field constraint validators: `required`, `minLength`, `maxLength`, `min`, `max`, `email`, `pattern` (identified as an imported binding from `@angular/forms/signals`).
- Not a violation: `validateStandardSchema` (the blessed path), and the escape-hatch validators `validateHttp`, `validateAsync`, `validate`, `validateTree`, which express server-side or cross-field logic a schema cannot own. Those are permitted and never flagged.
- Good (passes): `form(model, (path) => validateStandardSchema(path, heroSchema))`. Bad (fails): `form(model, (path) => { required(path.name); minLength(path.name, 2); })`.

Decidable from the TS AST: a call expression whose callee resolves to one of the seven named validator imports from `@angular/forms/signals`, inside a `@Component` class. The counter keys on the same imported-name set via the TS compiler API.

### 5. `presentational-injects-data`: a `ui/` component that injects a data service

Docs: the house-style skill, "Presentational (dumb) components live under `src/app/ui/` ... They inject no application data service." A presentational component that reaches for a data service is doing a container's job. The property is made decidable by two concrete markers, both stated in the house doc so the agent is told the convention:

- The component's file path is under `src/app/ui/`.
- The class body contains an `inject(X)` call where `X` is `HttpClient` or an identifier ending in `Service` (for example `HeroService`), and `X` is not on the pure-UI allowlist below.

- Allowlist (injecting these in a `ui/` component is fine): framework and rendering helpers (`ElementRef`, `DestroyRef`, `ChangeDetectorRef`, `Renderer2`, `NgZone`, `ViewContainerRef`, `TemplateRef`) and spartan/UI services (any identifier beginning with `Hlm`). These are presentation infrastructure, not application data.
- Good (passes): a `src/app/ui/hero-card.ts` that declares `input()`/`output()` and injects nothing, or only an allowlisted helper. Bad (fails): a `src/app/ui/hero-card.ts` that calls `inject(HeroService)` or `inject(HttpClient)`.

This rule is a name-based heuristic promoted to a hard gate deliberately: the `Service` suffix plus `HttpClient`, scoped to `ui/`, is the decidable slice the house convention makes checkable. A container component in a feature folder injecting the same service is correct and is never flagged, because the rule keys on the `ui/` path. Whether a component that is not under `ui/` should have been presentational is a judgment call, and that is the counter-only residue below.

## Counter-only heuristics (measured, never gated)

Three Part 3 signals are not cleanly decidable, or are a preference the baseline permits, and so are measured by the counter and reported as low-confidence, never used to block an edit. A heuristic that hard-blocks on a false positive is a bad gate; this is the same call Part 2 made for `nested-flex-grid`.

### 6. `hand-written-form-model` (heuristic)

A form component whose model type is a locally declared `interface` or `type` for the form's shape, instead of `z.infer<typeof schema>`. The house rule is that the model is inferred from the schema. This is a heuristic because deciding that a given interface "is a form model" (rather than any other data shape) is not clean: the counter flags an `interface`/`type` that is used as the type argument of a `signal<...>()` which then feeds a `form(...)` call, and reports it as a smell, not a defect.

### 7. `reactive-form` (heuristic)

Use of the reactive-forms API (`FormGroup`, `FormControl`, `FormBuilder`, `ReactiveFormsModule`) in a component. The house doc does not use reactive forms, but Angular's own `CLAUDE.md` permits them as a fallback, so this is a preference the baseline allows rather than drift the gate should block. It is counted to see how often the agent reaches for reactive forms instead of the schema-driven pattern, and never gated.

### 8. `dumb-holds-state` (heuristic)

A component under `src/app/ui/` that declares writable non-input state (a `signal(...)` or `WritableSignal` field that is not an `input()`/`model()`). A presentational component holding mutable local state may be a legitimate self-contained widget (an open/closed toggle) or a container that leaked into `ui/`. The counter cannot tell which, so it counts and flags it as the lowest-confidence smell of the three, not a defect.

## The tally shape (the counter's output contract)

```json
{
  "totals": {
    "hand-set-change-detection": 0,
    "component-subscribe": 0,
    "template-driven-form": 0,
    "restated-validator": 0,
    "presentational-injects-data": 0,
    "hand-written-form-model": 0,
    "reactive-form": 0,
    "dumb-holds-state": 0,
    "all": 0
  },
  "violations": [
    { "kind": "component-subscribe", "file": "src/app/heroes/hero-detail.ts", "line": 24, "detail": "this.route.params.subscribe" }
  ]
}
```

`totals.all` is the sum of the five gated kinds only; the three heuristics are in `totals` but excluded from `all`, so `all` counts what the gate could have blocked. `violations` is ordered by file, then line, then kind, so the same committed input serializes byte-identically. That ordering is what makes the determinism self-test (same diff in, identical tally out) meaningful. A full audit runs all three counters (Part 1, Part 2, Part 3 kinds) and reports each, because the series is cumulative.

## What each engine parses

- TypeScript (`hand-set-change-detection`, `component-subscribe`, `restated-validator`, the `FormsModule` half of `template-driven-form`, `presentational-injects-data`, and all three heuristics): the gate runs custom typescript-eslint rules over the TypeScript AST (`@typescript-eslint/typescript-estree` node types); the counter walks the TypeScript compiler's own AST via the compiler API (`ts.createSourceFile`, `ts.forEachChild`). Different AST shapes, no shared code.
- Templates (the `ngModel` half of `template-driven-form`): the gate uses the angular-eslint template parser; the counter uses `@angular/compiler`'s `parseTemplate`, reading `.html` files and inline `template:` strings.

Two engines, one spec, and the spec is the docs. If they ever disagree on a fixture, that disagreement is the finding.
