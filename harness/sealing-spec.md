# The sealing spec (Part 1)

The single written contract that both the gate and the structural counter encode, independently and in different engines. The gate parses templates with angular-eslint; the counter parses them with Angular's own compiler (`@angular/compiler`). Neither shares code with the other. This document is the only place the rules are stated in prose; if the two encodings ever disagree on a fixture, this file is the arbiter, and one of the encodings is wrong.

## The rules are the docs, mechanized

Every rule here comes from a doc in the agent's baseline: SpartanNG's own documentation (the spartan skill, `rules/styling.md` and `rules/composition.md`), Angular's generated `CLAUDE.md`, and this repo's house-style skill (`.claude/skills/house-style`, the grid/flex grammar and no-raw-literals rule that extend spartan where it is silent). The gate enforces exactly what those docs say and permits everything they permit; where two baseline docs pull differently (Angular endorses style bindings, spartan wants appearance in tokens), the rule is drawn so it fights neither. This is not our stricter opinion bolted on top: the whole thesis is that the model drifts even with those docs in its context, so the gate is only an honest test if it blocks what the docs block and nothing more. Each rule below cites the docs line it mechanizes and lists the docs' own good and bad examples, which are the test cases the counter and gate must satisfy.

## The vocabulary, as installed

Read from source, not from memory. The primitive selectors present in `libs/ui` at this substrate commit:

- `button[hlmBtn], a[hlmBtn]` (the button directive)
- `[hlmInput]` (the input directive)
- `[hlmCard], hlm-card` and the card parts (`hlmCardHeader`, `hlmCardFooter`, `hlmCardTitle`, `hlmCardDescription`, `hlmCardContent`, `hlmCardAction`)

The set of primitive attribute names and element names is used by rules 1 and 2 to decide whether an element is a primitive.

## The three rules

Every Part 1 violation is one of exactly three kinds. The gate reports them by `messageId`; the counter tallies them by `kind`. The kind strings are the shared vocabulary and must match on both sides.

### 1. `raw-control`: a native control where a primitive directive exists

Docs: composition.md, "use components, not custom markup," and the primitives are directives on native elements. A native control that a primitive directive already covers, used without the directive, is a violation. For the vocabulary as installed:

- a `<button>` element without `hlmBtn`
- an `<input>` element without `hlmInput`

Good (passes): `<button hlmBtn>Save</button>`, `<input hlmInput />`. Bad (fails): `<button>Save</button>`, `<input />`. A bare `<a>` is fine; the anchor is a real navigation element, and `hlmBtn` on an anchor is opt-in. Composed components you would otherwise hand-roll from a `<div>` (a card, a badge, an alert, a separator) are Part 3's territory (component shape, "use the component"), not Part 1's; Part 1 covers the atomic controls with a direct directive twin.

### 2. `appearance-on-primitive`: an appearance-override class on a primitive

Docs: styling.md, "`class` is for layout only. Use the `class` attribute to position and space components (flex, grid, gap, margins, widths). Do not use it to override a component's own colors, typography, or internal padding, change the copied Helm file or a CSS variable instead." So a class on a primitive is a violation only when it overrides appearance. Layout and spacing classes on a primitive are allowed and idiomatic.

- Banned on a primitive (appearance override): background (`bg-*`), text color and typography (`text-*`, `font-*`, `leading-*`, `tracking-*`, `italic`, `underline`, `uppercase`, ...), border and decoration (`border`, `border-*`, `rounded*`, `shadow*`, `ring*`), and internal padding (`p-*`, `px-*`, `py-*`, `pt-*`, ...).
- Allowed on a primitive (layout, position, spacing): display (`flex`, `grid`, `inline*`, `block`, `hidden`), flex and grid arrangement (`gap-*`, `justify-*`, `items-*`, `self-*`, `col-*`, `row-*`, `order-*`, `basis-*`, `grow`, `shrink`), dimensions (`w-*`, `min-w-*`, `max-w-*`, `h-*`, `size-*`), margins (`m-*`, `mx-*`, `mt-*`, ...), and position (`absolute`, `relative`, `top-*`, `inset-*`, ...). Responsive and state prefixes (`sm:`, `md:`, `hover:`, `dark:`, ...) are stripped before classifying the base utility.

Good (passes, straight from the docs): `<div hlmCardFooter class="justify-between">`, `<hlm-dialog-content class="sm:max-w-[425px]">`, `<button hlmBtn class="w-full">`. Bad (fails): `<button hlmBtn class="bg-blue-600 rounded-none">`, `<input hlmInput class="p-4 text-lg">`. The escape route the seal closes is appearance reaching past the primitive; the way to change a primitive's look is its `variant`/`size` inputs or the owned Helm file in `libs/ui`, which the gate leaves untouched.

### 3. `style-attribute`: a static inline style attribute

Careful here, because the baseline holds a rule that pulls the other way. Angular's own `CLAUDE.md` in the baseline says to use `[style]` bindings over `[ngStyle]`, so the gate must NOT ban style bindings; that would fight a doc the agent is reading. What no baseline doc endorses is a STATIC `style="..."` attribute: a raw inline literal that bypasses the token system, against spartan's "semantic tokens only" and the house "no raw literals" rule. So this rule is narrow.

- Violation: a static `style="..."` attribute (a raw inline literal). Good (passes): `[style.width.%]="pct()"`, a computed style binding, which Angular's baseline doc endorses. Bad (fails): `<div style="color: red; padding: 8px">`.

`[ngStyle]` and `[ngClass]` are also discouraged by the Angular baseline doc, but banning them is a component-shape lint rule for a later Part, not part of the Part 1 seal, so they are out of scope here.

## Where customization goes (why the seal is with the grain, not against it)

Because Helm code is copied into the project, the documented way to customize a component is to edit its file in `libs/ui` (adjust the `cva` variants, change classes, add inputs) or to use its `variant`/`size` inputs, never to reach past it at the call site. The gate ignores `libs/**` entirely, so that customization path is fully open. Rule 2 does not fight the framework; it enforces the framework's own "class is for layout only," and it points appearance changes at the place the docs point them.

## The tally shape (the counter's output contract)

```json
{
  "totals": { "raw-control": 0, "appearance-on-primitive": 0, "style-attribute": 0, "all": 0 },
  "violations": [
    { "kind": "raw-control", "file": "src/app/dashboard/dashboard.ts", "line": 12, "detail": "button without hlmBtn" }
  ]
}
```

`totals.all` is the sum of the three kinds. `violations` is ordered by file, then line, then kind, so the same input always serializes byte-identically. That ordering is what makes the determinism self-test (same committed diff in, identical tally out) meaningful.

## What each engine parses

- The gate loads angular-eslint's template parser and runs three custom rules over the template AST, on `.html` templates and inline `template:` strings.
- The counter loads `@angular/compiler`'s `parseTemplate` and walks the AST, reading `.html` files and extracting inline `template:` strings from `.ts` with the TypeScript compiler API. It shares no rule code, no parser, and no AST types with the gate.

Two engines, one spec, and the spec is the docs. If they ever disagree, that disagreement is the finding.
