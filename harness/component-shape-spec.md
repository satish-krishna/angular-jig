# The component-shape spec (Part 3)

The written contract for Part 3, encoded twice and independently: by the gate (typescript-eslint over component `.ts` files, and angular-eslint over templates for the one template-level rule) and by the counter (the TypeScript compiler API for `.ts`, and Angular's own compiler for templates). Neither shares code, parser, or AST types with the other. This file is the arbiter if the two disagree on a fixture; one of the encodings is then wrong.

Read `sealing-spec.md` (Part 1) and `layout-grammar-spec.md` (Part 2) first. Part 3 is the last of the vocabulary arc, and it moves from the template into the component class: most of its rules are TypeScript-AST properties, not template ones.

## The rules are the docs, mechanized

Same load-bearing principle as Parts 1 and 2: every rule comes from a doc in the agent's baseline, and the gate enforces exactly what those docs say and permits everything they permit. Three sources feed Part 3, all present in both run conditions:

- **Angular's generated `CLAUDE.md`**: `OnPush` is the v22 default so do not set `changeDetection` explicitly; use the async pipe for observables; keep components small and single-responsibility; prefer signals for state.
- **The spartan `forms.md` doc**: spartan's `hlmField` and controls work with template-driven, reactive, and signal forms alike. Spartan is neutral on which forms API you use; it does not ban any. So the forms rule is not spartan's, it is the house doc's.
- **The house-style skill** (`.claude/skills/house-style`, `.agents/skills/house-style`): the container/presentational split (presentational components live under `src/app/ui/` and inject no application data service), and the schema-driven forms pattern (a zod schema is the single source of truth; the model is `z.infer<typeof schema>`; validation flows through `validateStandardSchema(path, schema)` and is never restated as a per-field validator; template-driven and reactive forms are not used).

Two of Part 3's original six gated rules are drawn straight from Angular's `CLAUDE.md` and need no new doc: no hand-set `changeDetection`, and no `.subscribe` in a component. The other four (template-driven forms, restated validators, a presentational component injecting a data service, and reactive forms) exceed or sharpen what Angular's docs cleanly decide, so, per the series principle, the house-style skill was written first and only then gated. Doc-first, always, and here also **code-first**: the schema-driven pattern is unusable unless the repo actually has the substrate it names, so `zod` is installed and the `src/app/forms` helpers (`FormFieldMeta`, `formMeta`) are added before the gate mechanizes the rule. A gate for `validateStandardSchema` while the agent cannot import it would be a trap, not a test.

The reactive-forms rule is the one place the house constitution overrides a framework endorsement rather than merely extending it: Angular's `CLAUDE.md` offers reactive forms as the fallback when signal-forms do not fit, and the house-style skill overrides that fallback outright (no reactive forms). That override was made explicit in the doc before the rule was gated, and the rule was promoted from a counter-only heuristic to a hard gate only after a measured run showed the agent reaching for reactive forms in two of three gate-off trials, exactly the drift the gate exists to stop. The heuristics that stay counter-only (a hand-written interface where `z.infer` would fit, and a `ui/` component holding writable state) are not cleanly decidable and stay measured, not blocked.

## What is installed (read from source, not memory)

At this substrate commit: Angular 22.1, SpartanNG 1.4.1, typescript-eslint 8.69, angular-eslint 22.2, and zod 4 (added as the forms substrate for this Part). Angular signal-forms ship inside `@angular/forms` as `@angular/forms/signals`; the installed build exports `form`, `submit`, `FormField`, `validateStandardSchema`, and the per-field validators `required`, `minLength`, `maxLength`, `min`, `max`, `email`, `pattern` (plus `validate`, `validateAsync`, `validateHttp`, `validateTree` for logic a schema cannot own). Because zod 4 is a Standard Schema, `validateStandardSchema(path, schema)` validates a whole signal-form through the zod schema natively, which is what makes the schema the single source of truth rather than a parallel copy of the rules.

The original Part 3 sketch said "schema-owned forms with zod," and that was correct: the house forms pattern is schema-driven with zod. A mid-series note that struck zod (reading only the earlier repo state, where zod was not yet installed and the baseline mentioned only signal-forms) was wrong and is reversed here. The `src/app/forms` helpers and the `<feature>.schema.ts` convention are the code half of the doc-first move.

## The measurement model (cumulative baseline)

By Part 3 the Part 1 sealing hook and the Part 2 layout hook are baseline: on in both conditions. The single variable Part 3 moves is the component-shape gate. gate-off is sealing plus layout; gate-on is sealing plus layout plus component shape. The full baseline (both MCP servers, the spartan and house-style skills including the new component-shape and forms sections, Angular's `CLAUDE.md`, and the installed forms substrate) is identical and present in both conditions.

## The rules (hard-gated)

Every gated Part 3 violation is one of exactly fourteen kinds: the six below, the four MVVM kinds the capstone added, and the four capstone-residue kinds added after the capstone run, each with their own section. The gate reports them by `messageId`; the counter tallies them by `kind`. The kind strings are the shared vocabulary and must match on both sides.

### 1. `hand-set-change-detection`: an explicit `changeDetection` in `@Component`

Docs: `CLAUDE.md`, "Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+." The decidable property is the inverse of the original sketch: the violation is setting `changeDetection` at all, to any value, not the absence of `OnPush`.

- Violation: a `@Component({ ... })` decorator whose metadata object has a `changeDetection` property (whether `OnPush` or `Default`).
- Good (passes): a `@Component` with no `changeDetection` key. Bad (fails): `@Component({ changeDetection: ChangeDetectionStrategy.OnPush })`, `@Component({ changeDetection: ChangeDetectionStrategy.Default })`.

Decidable from the TS AST alone: the presence of the property key in the decorator's object literal. No type information required.

### 2. `component-subscribe`: a `.subscribe(...)` call inside a component class

Docs: `CLAUDE.md`, "Use the async pipe to handle observables." A component that calls `.subscribe(...)` is hand-managing a subscription where the template's async pipe (or `toSignal`) would do it. The residue this rule targets is the reflex of subscribing to route params, a service observable, or a valueChanges stream inside `ngOnInit`.

- Violation: a call expression of the form `<expr>.subscribe(...)` textually inside the body of a class decorated with `@Component`.
- Good (passes): binding an observable with the async pipe in the template, or `toSignal(obs)` in the class. Bad (fails): `this.route.params.subscribe(p => ...)`, `this.heroes.getAll().subscribe(...)` in a component.

Scope note: the rule fires inside `@Component` classes and inside classes whose name ends in `ViewModel`, but not in other services or resolvers, where `.subscribe` is legitimate. The ViewModel half was added after the capstone measured the rule being evaded by relocation; see "Two widenings the capstone forced" below. A member access named `subscribe` is the signal; this is a syntactic property, so a variable literally named `subscribe` that is not a call is not flagged. False-positive risk (a non-RxJS `.subscribe`) is low in a component and is accepted, because the whole point is that a component should not be the place subscriptions live.

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

### 6. `reactive-form`: reactive forms where the house pattern is signal-forms plus zod

Docs: the house-style skill, "no reactive forms." This is the one Part 3 rule where the house constitution overrides a framework endorsement rather than extending it. Angular's `CLAUDE.md` offers reactive forms as the fallback when signal-forms do not fit; the house-style skill overrides that fallback and requires signal-forms with a zod schema, so reactive forms are a defect here, not a fallback.

- Violation: `ReactiveFormsModule` in a component's `imports`, or a `new FormGroup`/`FormControl`/`FormBuilder`/`FormArray` in the class body. Reported once per component, to match the counter's one-signal-per-component count.
- Good (passes): a signal-form built with `form(model, (path) => validateStandardSchema(path, schema))`. Bad (fails): `imports: [ReactiveFormsModule]` with a `new FormControl(...)` field.

This rule started as a counter-only heuristic and was promoted to a hard gate after the measured run: across three gate-off trials the agent never used the house signal-forms pattern and reached for reactive forms in two of them. Promoting it required making the doc override explicit first (doc-first), so the gate mechanizes an unambiguous house rule and not a preference smuggled in at the gate.

## The MVVM rules (hard-gated, added by the capstone)

The capstone adds a fifth doc source and four more gated kinds: the house-style skill's MVVM section, which says where inside a container the state actually lives. This is a **refinement** of rule 5's world, not a new one, and the reconciliation has to be stated explicitly or the two halves of Part 3 will disagree about where signals belong.

Before the capstone, the house doc said a container component "holds the signals." That sentence is now wrong on its own and has been rewritten: a container **owns** the state, and it owns it through a component-scoped ViewModel. The presentational half of rule 5 is untouched, `src/app/ui/` components still take `input()`/`output()` and inject no data. What moves is the other half: a feature component no longer holds signals or injects data services itself, its ViewModel does. Rule 5 keys on the `ui/` path; rules 8 and 9 below key on the complement of that path, so no file is ever judged by both.

This is the sharpest non-native pattern in the whole series. It is not Angular's documented shape, it is not spartan's, and it is not in the model's priors: the ComponentStore/presenter shape exists in the ecosystem, but nothing in the agent's baseline tells it to reach for one. Parts 4 and 5 produced nulls because the gates were aimed at patterns the model already knew. This one is aimed squarely at the far side of that distance, and it is the single rule most likely to make the capstone fire.

A ViewModel is identified syntactically, by a class name ending in `ViewModel`. That is a naming convention promoted to a decidable marker, exactly as rule 5 promoted the `Service` suffix, and it is stated in the house doc so the agent is told the convention rather than made to guess it.

Rules 8 and 9 apply to EVERY `@Component` outside `src/app/ui/`, not only the routed screens, and the house doc was widened to say so before the rules were written. The narrower reading ("every routed feature screen") is what the pattern is FOR, but it is not decidable: nothing in a component file says whether it is routed, and a rule that cannot be decided cannot be enforced without guessing. The wider reading is also correct on the merits, since an app shell holding theme state in its own class has the same testability problem as a screen holding filter state, and the same fix. Doc-first means the doc moved first; the rule did not quietly outgrow it.

### 7. `vm-not-component-scoped`: a ViewModel with `providedIn`

Docs: the house-style skill, "The ViewModel is component-scoped ... A `providedIn: 'root'` ViewModel is a store wearing a ViewModel's name." A singleton ViewModel leaks one screen's state into the next visit to that screen, which is the whole defect the component-scoped lifetime prevents.

- Violation: a class whose name ends in `ViewModel`, decorated with `@Injectable({ ... })` or `@Service({ ... })` whose metadata object has a `providedIn` property, to any value.
- Good (passes): `@Injectable() export class HeroDetailViewModel {}`. Bad (fails): `@Injectable({ providedIn: 'root' }) export class HeroDetailViewModel {}`.

Decidable from the TS AST: the class name suffix plus the presence of the property key. No type information required.

### 8. `state-outside-vm`: a feature component declaring its own state signal

Docs: the house-style skill, "It declares no `signal()`, `computed()`, or `linkedSignal()` of its own." This is the load-bearing MVVM rule: it is what actually forces the logic out of the component and into the testable class.

- Violation: a `@Component` class whose file is NOT under `src/app/ui/`, declaring a property whose initializer is a call to `signal`, `computed`, `linkedSignal`, or `form` (the last resolved as an import from `@angular/forms/signals`).
- Not a violation: `input()`, `output()`, `model()`, `viewChild()`, `contentChild()`, `inject()`, `toSignal()`. Those are component API or an edge conversion, not screen state, and the house doc says so.
- Good (passes): `protected readonly vm = inject(HeroDetailViewModel);` and nothing else. Bad (fails): `readonly hero = signal<Hero | null>(null);` in a feature component.

The `ui/` complement matters. A presentational component holding a `signal()` is already measured, and only measured, by the `dumb-holds-state` heuristic (kind 16), because a self-contained widget's open/closed toggle is legitimate. A feature component holding one is not ambiguous: the house doc names the ViewModel as the place. So the same syntactic property is a hard gate on one side of the path split and a soft heuristic on the other, and that asymmetry is deliberate rather than an oversight.

### 9. `feature-injects-data`: a feature component injecting a data service directly

Docs: the house-style skill, "it injects no data service: everything a container used to do directly, it now does through the ViewModel." This is rule 5 inverted across the path split: rule 5 says a `ui/` component may not inject data because a container should; rule 9 says a container may not inject data either, because its ViewModel should.

- Violation: a `@Component` class whose file is NOT under `src/app/ui/`, containing an `inject(X)` call where `X` is `HttpClient` or an identifier ending in `Service`, excluding the pure-UI allowlist rule 5 already defines (the framework helpers and any `Hlm*` identifier).
- Not a violation: `inject(HeroDetailViewModel)` (a `ViewModel` suffix is not a `Service` suffix), or `inject(ActivatedRoute)` / `inject(Router)`. Routing is how a screen learns which screen it is, and the house doc permits it in the component.
- Good (passes): the ViewModel calls `inject(HeroService)`; the component calls `inject(HeroDetailViewModel)`. Bad (fails): the component calls `inject(HeroService)`.

The rule fires only inside `@Component` classes. A ViewModel injecting `HeroService` is the correct shape and is never flagged, because a ViewModel carries no `@Component` decorator.

### 10. `vm-not-provided`: a ViewModel injected but not provided

Docs: the house-style skill, "The component lists it in its own `providers: [HeroDetailViewModel]`." This rule exists because nothing else catches the mistake. A component-scoped ViewModel that is injected without being provided is a `NullInjectorError` at runtime, not a build failure, so `ng build` passes and the screen dies when it renders. That is the opposite of Part 4's situation: there the compiler had already built the graph and the gate rode it for free, and here the framework defers the check to a moment the harness would only reach by accident.

- Violation: a `@Component` class containing an `inject(X)` call where `X` ends in `ViewModel`, whose `@Component` metadata has no `providers` array listing `X`.
- Good (passes): `providers: [HeroDetailViewModel]` in the decorator and `inject(HeroDetailViewModel)` in the class. Bad (fails): the `inject` without the `providers` entry.

Decidable from the TS AST: the identifier set in `providers` versus the identifier set injected. `providers: [...someSpread]` is not resolvable statically and is treated as satisfying the rule, because a gate that guesses is worse than a gate with a stated blind spot.

### What the refinement did to Part 3's own clean fixture

The reconciliation is not free, and the bill arrived immediately: `fixtures/part3-clean.ts`, the fixture that DEFINED clean under the original six kinds, is a violation under the refined ten. It is a feature component that injects `HeroService` and holds `signal(...)` state directly, which is precisely the shape rule 5's world blessed and rules 8 and 9 now move into a ViewModel.

That is the refinement working, not a regression, and the fix is emphatically NOT to weaken rules 8 and 9 until the old fixture goes green again. A constitution that cannot invalidate its own past exemplars is not a constitution, it is a description of what the code already does. So the fixture is kept exactly as it was, as a historical record of the pre-capstone shape, and its assertion is rewritten to state what is now true: it is clean of the six original kinds, and it carries exactly the MVVM violations the refinement introduces. The test is stronger for it. Before, it asserted "this file is fine"; now it pins the reconciliation itself, so any future drift in where state is allowed to live fails a test rather than passing quietly.

## The capstone-residue rules (hard-gated, added after the capstone run)

Four more gated kinds, plus two widenings of existing rules. Every one of them comes from drift the capstone measured getting past the full gate set, and none of them was tested by that run. They are the answer to the question the capstone actually asked, which was not "does this constitution work" but "does it catch everything," and the honest answer was no.

### 11. `explicit-standalone`: `standalone` set in `@Component`

Docs: `CLAUDE.md`, verbatim: "Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+."

- Violation: a `@Component({ ... })` whose metadata object has a `standalone` property, to any value.
- Good (passes): a `@Component` with no `standalone` key. Bad (fails): `@Component({ standalone: true })`.

This is the same AST shape as rule 1, `hand-set-change-detection`: the presence of a property key in the decorator's object literal, no type information required. It is the cheapest rule in the entire constitution and it fired 19 times across three gate-on builds. Nobody had written it, which is the whole finding: a rule stated verbatim in the baseline docs, trivially decidable, violated in nearly every component, and invisible because no one thought to mechanize the easy one.

### 12. `legacy-icon-module`: `NgIconsModule` in a component's `imports`

Docs: the house-style skill, "Import `NgIcon`, never `NgIconsModule`," layered on spartan's `rules/icons.md`, which shows only the standalone `NgIcon` import.

- Violation: `NgIconsModule` in a `@Component`'s `imports` array.
- Good (passes): `imports: [NgIcon]`. Bad (fails): `imports: [NgIconsModule]`.

Same AST shape as the `FormsModule` half of rule 3 and the `ReactiveFormsModule` half of rule 6, both gated since Part 3.

This is the rule whose absence was fatal. Bare `NgIconsModule` throws at bootstrap ("No icons have been provided..."), so three of the capstone's six builds compiled cleanly, passed `strictTemplates`, passed every AST gate, and rendered a blank page. `capstone-spec.md` had already stated that the icon rule gated only the decidable template half and left registration doc-only; the drift landed in the ungated half, and the ungated half killed the application. The lesson is not that the limitation was undocumented. It was documented. The lesson is that a documented gap is still a gap.

### 13. `unregistered-icon`: a lucide symbol imported but never registered with `provideIcons`

Docs: the house-style skill, "Register with `provideIcons`, and only `provideIcons`"; spartan's `rules/icons.md`, "Icon names are not global - each icon you reference must be provided to the component (or app) via `provideIcons`."

- Violation: a `@Component` that lists `NgIcon` in its `imports` array and has no `provideIcons(...)` call in its `providers` array.
- Keyed on the component decorator rather than on the file's import list, deliberately. Imports are a file-level fact, so a file holding two components where only one renders icons would false-positive under the looser reading. `NgIcon` in `imports` is the component saying it renders icons, and that is a per-component property.
- Good (passes): `providers: [provideIcons({ lucideUsers })]`. Bad (fails): `providers: [{ provide: 'ICONS', useValue: { lucideUsers } }]`, or no providers at all.

The sealing spec called the registration half permanently doc-only, on the grounds that the template engines cannot see the component class. That reasoning was right about the *template* engines and wrong about decidability: this is a pure TypeScript-AST property, and the shape rules have always been TypeScript rules. One capstone trial invented `{ provide: 'ICONS', useValue: { ... } }`, which typechecks, registers nothing, and left every icon in the application shell rendering blank. That correction is recorded rather than quietly applied, because "we said this could not be gated and we were wrong" is more useful to a reader than a rule that silently appears.

What stays genuinely ungated is the join in the other direction, that every `<ng-icon name="X">` names a registered `X`, because a name can be computed (`[name]="'lucide' + icon()"`) and is then not statically knowable.

### 14. `orphan-ng-submit`: `(ngSubmit)` where no forms module supplies it

Docs: the house-style skill, "Submitting a form": the house pattern has exactly one submit path, `submit(this.form, ...)` from `@angular/forms/signals`, and `(ngSubmit)` is not part of it.

- Violation: an `(ngSubmit)` output binding in any template under `src/`.
- Good (passes): a `<button hlmBtn type="submit">` whose class calls `submit(this.form, ...)`. Bad (fails): `<form (ngSubmit)="onSubmit()">`.

`ngSubmit` is an output of `NgForm` and `FormGroupDirective`, which arrive only with `FormsModule` or `ReactiveFormsModule`. Rules 3 and 6 ban both modules, so in this repo the directive can never be present, and an unmatched output binding on a native `<form>` is not an error: Angular registers a DOM listener for an event named `ngSubmit`, which nothing ever fires.

This one deserves to be read carefully, because **the gate caused it.** The capstone found four `(ngSubmit)` bindings and zero uses of `submit()` from signals. The agent's prior for "how a form submits" survived the ban on the modules that make it work, so the gate removed the mechanism and left the muscle memory, and every primary save flow in those builds was a dead button on a page that looked complete. A constitution that forbids an API without forbidding its usage has not prevented the pattern; it has broken it silently. That is a general lesson about partial bans and it belongs in the writeup next to the displacement result.

### Two widenings the capstone forced

**Rule 2, `component-subscribe`, now covers ViewModels.** Its original scope note exempted services deliberately, on the grounds that `.subscribe` is legitimate there. The MVVM refinement then created a class that is a service by decorator and a component's brain by role, and two capstone trials put `this.route.paramMap.subscribe(...)` in a ViewModel constructor. The gate did not stop the subscribe; it relocated it into the one class the rule exempted. The predicate is now `@Component` classes plus classes whose name ends in `ViewModel`, reusing rule 7's marker. The house doc's own definition of a ViewModel, unit-testable with zero DOM, is precisely the argument against a hand-managed subscription living there.

**Rule 8, `state-outside-vm`, now includes `form()`.** The banned-initializer set was `signal`, `computed`, `linkedSignal`. A signal-form is a reactive state tree and usually the largest piece of state on a screen, and one capstone trial built `form(...)` in the component while its ViewModel shrank to a model signal and a save method: MVVM satisfied in letter, with the state left outside. `form` (resolved as an import from `@angular/forms/signals`) joins the set.

## Counter-only heuristics (measured, never gated)

Two Part 3 signals are not cleanly decidable and so are measured by the counter and reported as low-confidence, never used to block an edit. A heuristic that hard-blocks on a false positive is a bad gate; this is the same call Part 2 made for `nested-flex-grid`.

### 15. `hand-written-form-model` (heuristic)

A form component whose model type is a locally declared `interface` or `type` for the form's shape, instead of `z.infer<typeof schema>`. The house rule is that the model is inferred from the schema. This is a heuristic because deciding that a given interface "is a form model" (rather than any other data shape) is not clean: the counter flags an `interface`/`type` that is used as the type argument of a `signal<...>()` which then feeds a `form(...)` call, and reports it as a smell, not a defect.

### 16. `dumb-holds-state` (heuristic)

A component under `src/app/ui/` that declares writable non-input state (a `signal(...)` or `WritableSignal` field that is not an `input()`/`model()`). A presentational component holding mutable local state may be a legitimate self-contained widget (an open/closed toggle) or a container that leaked into `ui/`. The counter cannot tell which, so it counts and flags it as the lower-confidence smell of the two, not a defect.

## The tally shape (the counter's output contract)

```json
{
  "totals": {
    "hand-set-change-detection": 0,
    "component-subscribe": 0,
    "template-driven-form": 0,
    "restated-validator": 0,
    "presentational-injects-data": 0,
    "reactive-form": 0,
    "vm-not-component-scoped": 0,
    "state-outside-vm": 0,
    "feature-injects-data": 0,
    "vm-not-provided": 0,
    "explicit-standalone": 0,
    "legacy-icon-module": 0,
    "unregistered-icon": 0,
    "orphan-ng-submit": 0,
    "hand-written-form-model": 0,
    "dumb-holds-state": 0,
    "all": 0
  },
  "violations": [
    { "kind": "component-subscribe", "file": "src/app/heroes/hero-detail.ts", "line": 24, "detail": "this.route.params.subscribe" }
  ]
}
```

`totals.all` is the sum of the fourteen gated kinds only; the two heuristics are in `totals` but excluded from `all`, so `all` counts what the gate could have blocked. `violations` is ordered by file, then line, then kind, so the same committed input serializes byte-identically. That ordering is what makes the determinism self-test (same diff in, identical tally out) meaningful. A full audit runs all three counters (Part 1, Part 2, Part 3 kinds) and reports each, because the series is cumulative.

## What each engine parses

- TypeScript (`hand-set-change-detection`, `component-subscribe`, `restated-validator`, the `FormsModule` half of `template-driven-form`, `presentational-injects-data`, `reactive-form`, all four MVVM kinds, `explicit-standalone`, `legacy-icon-module`, `unregistered-icon`, and both heuristics): the gate runs custom typescript-eslint rules over the TypeScript AST (`@typescript-eslint/typescript-estree` node types); the counter walks the TypeScript compiler's own AST via the compiler API (`ts.createSourceFile`, `ts.forEachChild`). Different AST shapes, no shared code.
- Templates (the `ngModel` half of `template-driven-form`, and `orphan-ng-submit`): the gate uses the angular-eslint template parser; the counter uses `@angular/compiler`'s `parseTemplate`, reading `.html` files and inline `template:` strings.

Two engines, one spec, and the spec is the docs. If they ever disagree on a fixture, that disagreement is the finding.
