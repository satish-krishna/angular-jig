# The layout-grammar spec (Part 2)

The written contract for Part 2, encoded twice and independently: by the gate (angular-eslint for templates, stylelint for stylesheets) and by the counter (Angular's own compiler for templates, a separate scan for stylesheets). This file is the arbiter if the two disagree. Read `sealing-spec.md` first; Part 2 builds on the sealed vocabulary.

## The rules are the docs, mechanized

Same principle as Part 1: every rule comes from a doc in the agent's baseline, and the gate enforces exactly what those docs say. Two sources feed Part 2:

- **SpartanNG's styling docs** (the spartan skill): semantic colors only, and `gap-*` not `space-*`.
- **The house-style skill** (`.claude/skills/house-style`): the layout grammar (grid for regions, flex for inline runs, no nested flex faking a grid) and the no-raw-literals rule for hand-written CSS. These extend spartan where it is silent; they do not contradict it. They are written as a skill in the agent's baseline precisely so the gate mechanizes a doc the agent can read, not a rule smuggled in at the gate.

Two rules from the first cut of this spec were deleted because they fought the docs, not extended them: `presentation-on-raw` flagged `<div class="bg-card border-border border">`, which the spartan styling docs give as the good pattern, and the blanket arbitrary-bracket ban flagged `sm:max-w-[425px]`, which the spartan composition docs use. Neither survives. The hand-rolled-div-card that avoids the vocabulary is a composition problem, Part 3 ("use the component"), not a layout one.

## The measurement model (decided): cumulative baseline

By Part 2 the Part 1 sealing hook is baseline: on in both conditions. The single variable Part 2 moves is the layout rules. gate-off is sealing only; gate-on is sealing plus the layout gate. The baseline (spartan skill and MCP, Angular's `CLAUDE.md`, and now the house-style skill) is identical in both conditions and present in both.

## The rules

### 1. `raw-palette-color`: a raw palette or hex color instead of a semantic token

Docs: styling.md, "Semantic colors only. Never use raw Tailwind palette values (`bg-blue-500`, `text-gray-700`) on spartan components. Use the semantic tokens." A color class that names a raw palette value, or a hex, is a violation; a semantic token is fine.

- Violation: `bg-<palette>-<n>` / `text-<palette>-<n>` / `border-<palette>-<n>` (for example `bg-blue-500`, `text-gray-700`, `border-gray-200`), and any arbitrary color bracket (`bg-[#0af]`, `text-[#333]`).
- Allowed: the semantic tokens (`bg-card`, `bg-primary`, `text-muted-foreground`, `border-border`), and non-color arbitrary values (`sm:max-w-[425px]`), which spartan uses.

Good (from the docs): `<div class="bg-card text-card-foreground border-border border">`. Bad (from the docs): `<div class="border-gray-200 bg-white text-black">`, `<div class="bg-blue-600 text-white">`.

### 2. `space-utility`: `space-x-*` / `space-y-*` instead of `gap-*`

Docs: styling.md, "Spacing: `gap-*`, not `space-*`. Use `flex`/`grid` with `gap-*` for spacing between items. Avoid `space-x-*` / `space-y-*`."

- Violation: any `space-x-*` or `space-y-*` class. Good: `<div class="flex flex-col gap-4">`. Bad: `<div class="space-y-4">`.

### 3. `raw-css-literal`: a raw color or length in a hand-written stylesheet

Docs: the house-style skill, "No raw literals in hand-written CSS." In an inline `styles: []` block or a `styleUrl` file, a color or length must be a token (`var(--...)`), never a raw hex, `rgb()`/`hsl()`, or `px`. This is scoped to hand-written CSS, where spartan is silent (it assumes Tailwind utilities); it does not touch spartan's blessed template brackets.

- Violation: `background: #3b82f6`, `padding: 16px`, `color: rgb(0 0 0)`. Good: `background: var(--card)`, `padding: var(--spacing-4)`, `border: 1px solid var(--border)` where the color is a token (a bare structural `1px` border width is the edge case; see below).
- The gate enforces this with stylelint's `declaration-strict-value` (colors and spacing must resolve to a `var()`), a genuinely different engine from the counter's scan.

### 4. `nested-flex-grid` (house, heuristic, counter-only)

Docs: the house-style skill, "grid for regions, flex for inline runs, do not nest flex to fake a grid." This is a real house rule now, but it is not cleanly decidable from classes alone (a legitimate flex toolbar of flex rows looks the same as a nested-flex grid). So it is measured by the counter as a lower-confidence signal and NOT enforced by the gate: a heuristic that hard-blocks an edit on a false positive is a bad gate. The heuristic: a `flex` container with two or more direct `flex` children. If the run shows it is more noise than signal, it is cut, and that cut is a finding.

## The tally shape

```json
{
  "totals": { "raw-palette-color": 0, "space-utility": 0, "raw-css-literal": 0, "nested-flex-grid": 0, "all": 0 },
  "violations": [ { "kind": "raw-palette-color", "file": "src/app/dashboard/dashboard.ts", "line": 18, "detail": "bg-blue-500" } ]
}
```

A full audit runs both counters (Part 1 kinds and Part 2 kinds) and reports both, because the series is cumulative. `nested-flex-grid` is in `totals` but flagged as the heuristic it is.

## What each engine parses

- Templates: the gate uses angular-eslint; the counter uses `@angular/compiler`. No shared code.
- Stylesheets: the gate uses stylelint (a postcss AST); the counter uses its own text scan. Genuinely different engines, so their agreement is a real cross-check, not a tautology.
