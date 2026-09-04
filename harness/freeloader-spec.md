# The freeloader spec (Part 4)

The written contract for Part 4, Plane 1: the freeloader gate. Unlike Parts 1-3, Part 4 does not invent much new vocabulary. It stacks two freeloaders, each enforced at the boundary where it naturally lives, and each measured by its own auditor.

- **Freeloader 1, `strictTemplates`.** The graph Angular already builds. Turning it on makes the compiler's template type-checker fail the build on a binding that does not typecheck. It is a whole-program compiler check, so it cannot be a per-file edit-time hook; it is enforced at the build, when the agent runs its own `ng build` to finish the task. Its auditor is the compiler itself: compile the produced code with `strictTemplates` on and count the template type diagnostics. This is the first time the series gets to use a compiler error as proof, because for once the property is already in a graph.
- **Freeloader 2, the vocabulary hook.** Two house rules the type-checker has no opinion on, both straight from Angular's `CLAUDE.md`, both decidable from the template AST, so they stay an edit-time hook (exit 2), deliberately: the edit-time boundary keeps the agent's context fresh and lands the fix immediately, which the Part 3 corrective-message A/B showed is where a fix actually takes. Its auditor is the independent AST counter, as in Parts 1-2.

Read `sealing-spec.md`, `layout-grammar-spec.md`, and `component-shape-spec.md` first. Part 4 keeps the edit-time hook model on purpose; it does NOT consolidate the per-Part hooks into a single commit-boundary gate.

## The rules are the docs, mechanized

Both vocabulary rules come straight from Angular's generated `CLAUDE.md`, which is in the agent's baseline in both conditions:

- "Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`."
- "Do NOT use `ngClass`, use `class` bindings instead." "Do NOT use `ngStyle`, use `style` bindings instead."

No doc-first work is needed: these are the framework's own rules, mechanized. `strictTemplates` is likewise Angular's own compiler option, off by default in this substrate (verified: `tsconfig.json` sets no `strictTemplates`), turned on as Part 4's measured move.

## The measurement model (cumulative baseline)

By Part 4 the Part 1, 2, and 3 hooks are baseline: on in both conditions. Part 4 moves two things together, as one gate:

- **gate-off:** Parts 1-3 hooks on; `strictTemplates` off; the vocabulary hook absent.
- **gate-on:** Parts 1-3 hooks on; `strictTemplates` on (so the agent's own build fails on a template type error and it must fix it); the vocabulary hook present.

The report has two halves, one per freeloader: the strict-template diagnostic count (compiler) and the vocabulary drift (AST counter).

## The vocabulary rules (edit-time hook)

Two kinds, both template-AST decidable. The gate reports them by `messageId`, the counter tallies them by `kind`, and the strings match on both sides.

### 1. `legacy-control-flow`: a structural directive where native control flow exists

Docs: `CLAUDE.md`, native control flow over the structural directives. A `*ngIf`, `*ngFor`, or `*ngSwitch` in a template is a violation; `@if`/`@for`/`@switch` pass.

- Violation: an element carrying `*ngIf`, `*ngFor`, or `*ngSwitch` (the microsyntax attributes). Good (passes): `@if (x) { ... }`, `@for (h of heroes(); track h.id) { ... }`. Bad (fails): `<div *ngIf="x">`, `<li *ngFor="let h of heroes">`.

### 2. `ng-class-style`: an `ngClass` or `ngStyle` binding

Docs: `CLAUDE.md`, `class`/`style` bindings over `ngClass`/`ngStyle`. Any `ngClass` or `ngStyle`, as a bound input `[ngClass]`/`[ngStyle]` or a bare attribute, is a violation; a `[class.x]`/`[style.x]`/`[class]`/`[style]` binding passes.

- Violation: `[ngClass]="..."`, `ngClass`, `[ngStyle]="..."`, `ngStyle`. Good (passes): `[class.active]="isActive()"`, `[style.width.px]="w()"`. Bad (fails): `<div [ngClass]="{ active: isActive() }">`, `<div [ngStyle]="{ width: w }">`.

## The strictTemplates freeloader (build-time, compiler-audited)

Not a lint rule and not an AST kind. It is measured by compiling the produced code with `strictTemplates` on and counting the template type diagnostics Angular reports (a binding to a property that does not exist, a control bound with the wrong shape, a mis-typed `@Input`). `harness/counter/strict-template-check.mjs` performs this: it layers a `strictTemplates: true` compiler option over the app tsconfig, runs the build, and returns `{ errors, passed }`. gate-off output (built loosely) may carry latent errors; gate-on output should carry zero, because the agent's own strict build already failed on them and forced the fix. The compiler is a legitimate independent auditor here precisely because it is the graph that already exists, not something the gate computes.

## The tally shape (the vocabulary counter's output contract)

```json
{
  "totals": { "legacy-control-flow": 0, "ng-class-style": 0, "all": 0 },
  "violations": [
    { "kind": "legacy-control-flow", "file": "src/app/heroes/heroes.ts", "line": 8, "detail": "*ngFor" }
  ]
}
```

`totals.all` is the sum of the two vocabulary kinds. The strict-template count is reported separately (`strict-tally.json`), because its auditor is the compiler, not this counter. `violations` is ordered by file, then line, then kind, so the same input serializes byte-identically.

## What each engine parses

- Vocabulary rules: the gate uses the angular-eslint template parser; the counter uses `@angular/compiler`'s `parseTemplate`, on `.html` files and inline `template:` strings. No shared code, as in Parts 1-2.
- `strictTemplates`: the Angular compiler, run in strict mode over the produced code. Its diagnostics are the audit.

Two engines for the vocabulary, the compiler for the freeloader, one spec. If the vocabulary gate and counter ever disagree on a fixture, that disagreement is the finding.
