# The layout-grammar spec (Part 2)

The written contract for Part 2, layout as a grammar. Like the sealing spec, it is encoded twice, independently: by the gate (angular-eslint for templates, a small deterministic CSS pass for stylesheets) and by the counter (Angular's own compiler for templates, the same CSS pass logic reimplemented separately). This file is the arbiter if the two disagree. Read `sealing-spec.md` first; Part 2 builds on the sealed vocabulary, it does not replace it.

## Why this exists, and what the Part 1 run forced

Part 1 sealed the primitives and left one residue it could not name: a screen that avoids the vocabulary by hand-rolling a card out of a `<div>`. Part 2's job is to make layout a decidable grammar, which names part of that residue and the other drift Part 1 never looked at: literal values (a hardcoded hex or pixel where a token belongs) and presentational classes smeared onto raw containers.

The Part 1 measured run also forced a scope decision. Under the gate, the agent did not stop hand-rolling; it moved its custom styling out of the template, where Part 1's rules could see it, and into the component stylesheet, where they could not. So Part 2 must lint the stylesheets too, inline `styles: []` and `styleUrl` files alike, or it leaves the agent's proven escape route unmeasured. The counter and the gate both grow a CSS pass here.

## The measurement model (decided): cumulative baseline

Each Part isolates its own gate by holding every earlier gate constant. By Part 2 the Part 1 sealing hook is part of the baseline: it is on in both conditions. The single variable Part 2 moves is the layout rules.

- gate-off (Part 2): sealing hook registered, layout rules absent.
- gate-on (Part 2): sealing hook plus layout rules registered.

This matches the series shape, each Part a phase built on the one before, and it isolates the layout grammar's own contribution rather than re-measuring sealing. Concretely, the driver layers two settings fragments: the sealing hook in both conditions, and the layout hook only in gate-on. The baseline (skills, MCP, Angular's `CLAUDE.md`) is unchanged.

## The three rules

Part 2 adds three violation kinds to the counter's vocabulary. Two are cleanly decidable; the third is a stated heuristic, and the spec says so rather than pretending otherwise.

### 1. `literal-value`: a hardcoded visual literal where a token belongs

A literal color or length written directly instead of through a design token. Decidable forms:

- A hex color (`#fff`, `#ffffff`, `#rrggbbaa`), or an `rgb(`, `rgba(`, `hsl(`, `hsla(` function, anywhere in a template class attribute, an inline style (already banned by Part 1, so this mostly surfaces in stylesheets), or a component stylesheet.
- A Tailwind arbitrary value in square brackets that encodes a literal: `bg-[#0af]`, `text-[14px]`, `w-[327px]`, `p-[7px]`, `gap-[13px]`, `top-[42px]`. The `[...]` arbitrary syntax is the literal escape hatch around the token scale, so any bracketed value carrying a `#` or a raw length unit counts.
- In a stylesheet (inline `styles: []` or a `styleUrl` file): a hex color, or a raw length in `px`, that is not part of a `var(--token)` reference. A value expressed as `var(--primary)` or `var(--spacing-4)` is a token and is fine; a literal `#3b82f6` or `16px` is not.

The whole point is that Tailwind's named scale (`p-4`, `gap-2`, `bg-primary`) is the token vocabulary and is allowed; the bracketed arbitrary value and the raw stylesheet literal are the ways around it, and those are what this rule names.

### 2. `presentation-on-raw`: appearance classes on a non-primitive element

A raw element (an element carrying no primitive from the sealing spec) that wears presentational utility classes is a container pretending to be a styled component. Layout is allowed on containers; appearance is not.

- Flagged (appearance): `bg-*`, `border`, `border-*`, `rounded`, `rounded-*`, `shadow`, `shadow-*`, `ring`, `ring-*`, and text-color utilities (`text-<color>`), on any element that is not a primitive.
- Not flagged (the allowed grammar): layout and spacing utilities, `flex`, `grid`, `gap-*`, `p-*`, `m-*`, `w-*`, `h-*`, `items-*`, `justify-*`, `col-*`, `row-*`, `hidden`, `block`. Containers are for arranging; that is what a container is for.

This names the naive hand-rolled card, the `<div class="bg-blue-50 border rounded-lg shadow">` that Part 1's gate-off shipped in every trial. It is the half of the div-card residue that Part 2 can decide.

### 3. `nested-flex-grid` (heuristic, stated): a two-dimensional layout built from nested flex

Grid is for regions, flex is for a single inline run. A two-dimensional arrangement built by nesting flex containers is the layout smell Part 2 wants to name, but unlike the first two rules this one is not cleanly decidable from classes alone, and the spec will not pretend it is. The heuristic: a `flex` container whose direct element children are themselves `flex` containers, which is the common shape of a nested-flex grid. It will have false positives (a legitimate toolbar of flex rows) and false negatives (a grid faked another way), so it is reported as a lower-confidence kind, counted separately, and never used as the headline number. If the measured run shows the heuristic is more noise than signal, it is cut, and that cut is a finding.

## The honest limit Part 2 does NOT close

The Part 1 gate-on agent hid its card's appearance in a component stylesheet under a semantic class (`.hero-card { background: ...; border: ...; }`) on a plain `<div class="hero-card">`. Rule 1 catches any literal colors or pixels in that stylesheet, and pushes the agent toward tokens. But naming the div itself as an impostor requires proving that `.hero-card` is presentational, which means correlating the class to its CSS rules and deciding intent. That is a composition property, not a layout one, and it is Part 3's job (component shape: a thing that looks like a component must be one). Part 2 closes the inline-Tailwind half of the div-card and hands the stylesheet-hidden half to Part 3. Part 1's prose, which promised Part 2 would name the div-card, is corrected to promise Parts 2 and 3 together.

## The tally shape

Same contract as the sealing counter, extended with the new kinds. One JSON object:

```json
{
  "totals": { "literal-value": 0, "presentation-on-raw": 0, "nested-flex-grid": 0, "all": 0 },
  "violations": [
    { "kind": "literal-value", "file": "src/app/dashboard/dashboard.ts", "line": 34, "detail": "arbitrary value w-[327px]" }
  ]
}
```

Part 2's counter reports its own three kinds. The Part 1 counter keeps reporting its three. A full audit of a screen runs both and reports both sets, because the series is cumulative and a Part 2 screen is still bound by the Part 1 seal. `nested-flex-grid` is listed in `totals` but flagged in prose as the heuristic it is.

## What each engine parses

- Templates: the gate uses angular-eslint's parser and new custom rules; the counter uses `@angular/compiler`, walking class attributes and bound classes. Same split as Part 1, no shared code.
- Stylesheets: both engines run a small deterministic text pass over inline `styles: []` (extracted from the `.ts` with the TypeScript compiler API, as the counter already does for templates) and over `styleUrl` `.css` files, scanning for hex colors and raw `px` lengths outside `var(...)`. The pass is simple enough to reimplement twice without sharing code; the independence rule from Part 1 still holds.
