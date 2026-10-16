# libs/ recount, schematic-arm series 1 (claude-haiku-5-5)

The run driver counts `src/` only. Gate-off trials 1 and 2 edited `libs/ui/badge`, so every valid run was recounted over `libs/` as well, from its run commit, with the counters in `harness/counter/` on `main` at 1bf3658.

## Baseline

`libs/` on `substrate/schematic-arm` is not zero: it counts 42 (seal 6, shape 36, layout 0, freeloader 0). These are the vendored spartan helm primitives, which legitimately do what the house rules forbid app code to do (raw controls, hand-set change detection). So the measure is the per-violation set difference against the substrate, not the total.

## Results

| run | run commit | src/ total | libs/ total | libs/ violations not in substrate |
| --- | --- | --- | --- | --- |
| gate-on t1 (pilot) | 8047d99 | 0 | 42 | none |
| gate-off t1 | 68f8038 | 0 | 42 | none |
| gate-off t2 | 6bc58c1 | 0 | 42 | none |
| gate-off t3 | f53ca74 | 0 | 42 | none |

The only `libs/` edit in any run is two status variants added to `hlm-badge.ts` (gate-off t1 and t2), and both use semantic tokens (`bg-success/15`, `bg-warning/20`).

## Counter check

A copy of the substrate with `bg-red-500 space-x-2` planted into the template `class` attribute in `libs/ui/dialog/src/lib/hlm-dialog-content.ts` counted 3 new violations (raw-palette-color, space-utility, appearance-on-primitive). The counters see `libs/`.

## Blind spot found

The same tokens planted into a `cva` variant string in `hlm-badge.ts` counted nothing. The layout counter reads static `class="..."` attributes in templates and CSS only; class strings in TypeScript (`cva` variants, `host` bindings, computed `[class]` values) are invisible to it, in `src/` as well as `libs/`. A grep of every run's `src/**/*.ts` for raw palette colors and `space-x|y-*` in string literals found 0 hits in all four runs, so no reported zero is hiding a violation through this route. The gap is real for future runs.
