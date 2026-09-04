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

## Why these are written down

The whole point of this repo is that a written convention is not a guardrail: the model reads good docs and drifts anyway. These conventions exist so the drift has something concrete to be measured and gated against. They are here to be mechanized, not merely remembered.
