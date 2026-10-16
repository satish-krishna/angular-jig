# Series 2 gate-off pilot readout

Run `gate-off-t1-2026-10-16_13-40-31`, run commit `61689a2`, claude-haiku-5-5, substrate `substrate/schematic-arm-2`, measured with the counters on `research/schematic-arm` at `8eb1da8` in expanded mode. Valid: no void reasons, no measurement errors, build ok, boot ok with 0 failures. Cost $1.26 over 228 turns, 27 minutes. Guard blocks: 6.

## Totals

| family | total |
| --- | --- |
| bem | 0 |
| seal (expanded) | 13 |
| layout (expanded) | 0 |
| shape | 0 |
| freeloader | 0 |

Responsive: 6 element clips per audited route (dashboard, roster, detail/11), the same count every series 1 run showed in both arms, so a property of the shell, not of this run.

## What Haiku did with the new rules

It followed every series 2 rule. All 20 components are triads, every template class is a BEM name of the component's own block, every stylesheet starts with `@reference`, there is no Sass-style nesting, no inline template or styles, and no utility class in TypeScript. 158 `@apply` lines carry the styling. The `bem` family is zero.

## Where the drift is

All 13 violations are one series 1 rule, `appearance-on-primitive`, which the template text could no longer show:

| file | line | utility applied to a primitive |
| --- | --- | --- |
| src/app/app.html | 3, 34 | `px-2` on `hlmSidebarHeader`/sidebar `div` |
| src/app/app.html | 62 | `ps-9` on `hlmInput` |
| src/app/heroes/heroes.html | 11 | `ps-9` on `hlmInput` |
| src/app/dashboard/dashboard.html | 44 | `rounded-md` on a primitive `div` |
| src/app/heroes/heroes.html | 45 | `rounded-md` on a primitive `div` |
| src/app/missions/missions.html | 39 | `rounded-md` on a primitive `div` |
| src/app/hero-detail/hero-detail.html | 67, 100, 122, 141 | `pt-2` on a primitive `div` |
| src/app/heroes/heroes.html | 99 | `py-6` on `hlmTableCell` |
| src/app/missions/missions.html | 71 | `py-6` on `hlmTableCell` |

Example: `<div hlmSidebarHeader class="app__brand">` with `.app__brand { @apply flex items-center gap-2 px-2 py-3 font-semibold text-sidebar-foreground; }`. The counter reports the first appearance utility per element, so `py-3`, `font-semibold` and `text-sidebar-foreground` on the same element are inside the one violation.

None of the four series 1 runs had a single `appearance-on-primitive`. With utilities written beside the primitive in the template, the model kept padding, radius and typography off it; with the same utilities behind a BEM name in another file, it put them on in 13 places. All 13 stand as violations (owner ruling, 2026-10-16): even the ones with a design reason (`ps-9` to make room for a search icon, `py-6` on an empty-state cell) belong on the primitive as a variant in `libs/ui`, selected with its `variant` input, not in the app's stylesheet.

## Substrate change after the pilot

The house-style skill told the model that a primitive's color and typography come from its `variant`/`size` inputs, but not what to do when no variant fits. The remedy (edit the owned copy in `libs/ui` and add a variant) was only in `harness/rules/no-appearance-on-primitive.md`, which reaches the subject only through the gate-on hooks. Left as is, phase 2's gate-on arm would get the remedy and gate-off would not, so the arms would differ in information as well as enforcement. The skill now states it (`substrate/schematic-arm-2` at `dd3f29e`, both skill copies). This pilot ran on `88bff10`, before that change, and is a pre-series run: it decided whether phase 2 is built, and it is not one of phase 2's trials.

## Decision

Drift present. Phase 2 (gates and schematic) proceeds.

The drift is not where the series 2 design expected it. The new BEM rules were followed without enforcement; what broke is an old rule, because the indirection hid the evidence from the model. The gate phase 2 most needs is the expanded appearance-on-primitive check (judging `@apply` contents against the primitive they land on), not a BEM-syntax gate.

## Limits of this readout

One trial. Cost is 30 percent above the series 1 gate-off mean ($0.97, 190 turns) for the same six stages; one trial cannot separate the house style from run-to-run variance.
