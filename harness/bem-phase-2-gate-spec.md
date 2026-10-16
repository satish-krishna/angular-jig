# Series 2, phase 2: the applied-appearance gate

Status: design, 2026-10-16. Builds on `harness/bem-house-style-spec.md` (the series 2 house style and its counter) and on the two gate-off pilots recorded in `experiments/schematic-arm/s2/pilot-readout.md`.

## Why

Two gate-off pilots under the BEM house style followed every new rule: the `bem` family counted 0 both times. Both drifted on one old rule, `appearance-on-primitive`, through `@apply`: 13 violations on the first pilot, 11 on the second. The second ran after the skill was changed to state the remedy outright (a primitive's look changes only through a variant on the primitive), and it still added no variant anywhere. In the four series 1 runs, where the same utilities would have sat beside the primitive in the template, this rule never fired.

So phase 2 builds one gate, aimed at the one drift observed. The BEM-syntax gates outlined in the series 2 spec are dropped: they would police rules the model has followed without enforcement in both pilots.

## Scope

This spec covers the gate arm: the gate, its rule doc, its registration, and the 3 gate-off plus 3 gate-on trials that measure it. The schematic arm (triad and BEM emitters, goldens, the stripped subject branch, the mod's schematic config) follows in its own spec and plan, and runs on a later substrate sha than these six trials; that difference is recorded, not hidden.

## The gate

### What it enforces

The series 1 rule `no-appearance-on-primitive`, unchanged in meaning, judged where the utilities now live. An element that is a primitive (a primitive element name, or a native element carrying a primitive attribute directive, exactly as the existing rule defines it) must not receive an appearance utility through any class it carries. Appearance is the existing rule's classifier: `bg-*`, `text-*` except alignment, `font-*`, `leading-*`, `tracking-*`, `border*`, `rounded*`, `shadow*`, `ring*`, and `p*-*` padding, after stripping variant prefixes. A class reaches the element's utilities through the component's own stylesheet: every `@apply` in a rule whose styled element carries that class, including under `&:hover`-style nesting and `@media`.

Out of scope for the gate (the counter still counts them): utilities applied from a global stylesheet, and `:host` rules (the host is the component itself, not a primitive). Both pilots' violations were all in component stylesheets.

### Independent of the counter

The gate shares no code with the counter, as every gate and counter pair in this repo does. The counter expands templates with `harness/counter/bem/`; the gate resolves applied utilities with its own code under `harness/gate/`, written from this spec, not from the counter's source. A defect in one cannot blind both, which matters here: the counter's expansion needed six rounds of review to stop scoring confident zeros.

### Gate-on only

The check is a new eslint rule, `seal/no-applied-appearance-on-primitive`, that lives in a self-contained config built by a new hook, `.claude/hooks/check-applied-appearance.mjs`, following the `check-layout.mjs` pattern. It is not added to the repo's `eslint.config.mjs`. If it were, a gate-off run that calls `npm run lint` would receive the check, and the baseline would quietly become a weak gate.

### When it fires

PostToolUse on `Write|Edit|MultiEdit`:

- a component template under `src/app` (`*.html`): lint that template against its sibling stylesheet;
- a component stylesheet under `src/app` (`*.css`): lint the sibling template, because a stylesheet edit changes what lands on the template's primitives.

On a violation it exits 2 with a corrective message naming the element, the class, the utility and the stylesheet line, followed by the rule doc's `## Agent guidance` section spliced in by `rule-docs.mjs`, the same way every other gate-on hook does. It fails closed on an unparseable payload or stylesheet.

### Rule doc

`harness/rules/no-applied-appearance-on-primitive.md`, in the existing rule-doc format. Its agent guidance states the remedy the skill already states: add a variant to the primitive in its owned copy under `libs/ui`, select it with the primitive's `variant` input, and keep the app stylesheet to layout. Because the skill and the hook give the same remedy, the arms differ only in enforcement, not in information.

## Registration

A new settings file on the launching branch, `harness/gate/s2-gate-on.settings.json`: everything `capstone-gate-on.settings.json` registers, plus the new hook in the PostToolUse list. The series 1 settings file is not edited. Gate-off keeps `capstone-gate-off.settings.json` unchanged (the enforcement guard only). The mod's `arm.config.json` points `gateSettings` at the new file for series 2.

## Substrate

The gate's files go on `substrate/schematic-arm-2` (the hook, the rule, the rule doc, and their tests), because hooks run from the subject's working tree. In gate-off they are present and unregistered, exactly as every series 1 hook was. All six trials run on the substrate sha that carries the gate; the second pilot (`dd3f29e`) is not counted, because the subject can read `harness/` and `.claude/hooks/` and an unregistered file is not the same as no file.

## Trials and what they decide

Three gate-off and three gate-on trials, claude-haiku-5-5, same stages, same counter (`research/schematic-arm` as launched).

Recorded per trial, from the existing meta: expanded `appearance-on-primitive`, every other family total, cost, turns, guard blocks, hook firings, and the files changed outside `src/`.

The gate works if gate-on averages at most 1 expanded `appearance-on-primitive` per trial while gate-off averages at least 5. It does not work if gate-on averages more than half of gate-off. Anything between is reported as a partial effect with its numbers. Cost and turns are reported for both arms; a gate that holds the line at a large turn cost is a finding, not a failure.

## Testing the gate

- Unit tests for the rule on paired fixtures: a primitive whose BEM class applies `px-2`, `rounded-md`, `font-semibold`, a hover-only `bg-*`, and an `@media`-wrapped padding each fire; layout-only `@apply` (`w-full sm:w-64`, `ms-auto`, `grid`) on a primitive does not; appearance on a non-primitive element does not.
- The two pilots as end-to-end fixtures: run the gate's rule over both pilots' committed `impl/src/app` trees. It must fire on every one of the 13 and the 11 counted violations, and on nothing the counter did not count. Agreement between two independent engines on 24 real violations is the gate's acceptance test.
- A hook test in the existing `harness/gate/` style: a `.css` edit that adds appearance to a primitive's class exits 2; the same edit with layout utilities exits 0.

## Out of scope

- The schematic arm (own spec).
- BEM-syntax gates (`template-utility-class`, `foreign-block` and the rest): not built, because neither pilot violated them.
- Any measurement of `libs/ui` (owner ruling, 2026-10-16).
- Changing the counter on `research/schematic-arm` between the six trials.
