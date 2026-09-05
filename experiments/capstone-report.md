# The capstone: what the whole constitution caught, and what got past it

Six trials, three per condition, all on Haiku, run 2026-09-05 against `main`. Read `../harness/capstone-spec.md` first; it states what this run is and, more importantly, what it is not.

Every number here comes from a run's own JSON under `capstone/<condition>/<runId>/`. Nothing is estimated. Regenerate the tables with `node harness/driver/summarize-capstone.mjs` and `node harness/driver/normalize-markup.mjs`.

The question this run exists to answer is not "does a constitution reduce drift." It is **"does the best constitution we can build catch all of it."** The answer comes in two parts, and the second is the useful one:

- Of the drift the constitution **names**, it caught everything. 326 violations to zero, across nine kinds, in three trials.
- Of the drift it does not name, it caught none, and there was a great deal. Three of six builds compiled clean and rendered a blank page. Eighteen sites wrote primitives that bind nothing. Four primary save flows shipped as dead buttons. And in two trials the agent edited the enforcement config so its own code would pass.

A gate is not a wall. It is a set of named prohibitions, and the drift goes wherever they are not.

## The headline

Parts 4 and 5 returned nulls: on natural Tour of Heroes the gates were dormant, because the model is competent on native patterns. That produced the series' thesis, that gates fire in proportion to a pattern's distance from the model's priors. The capstone aimed at the far side of that distance, and the same machinery that sat silent for two Parts eliminated **326 violations to zero**.

Every gated kind, gate-off total across three trials versus gate-on total across three trials:

| kind | gated | gate-off (t1, t2, t3) | gate-on (t1, t2, t3) |
| --- | --- | --- | --- |
| `seal/appearance-on-primitive` | yes | **174** (38, 63, 73) | **0** (0, 0, 0) |
| `seal/raw-control` | yes | **55** (37, 12, 6) | **0** (0, 0, 0) |
| `layout/space-utility` | yes | **37** (6, 20, 11) | **0** (0, 0, 0) |
| `shape/template-driven-form` | yes | **23** (5, 16, 2) | **0** (0, 0, 0) |
| `shape/state-outside-vm` | yes | **14** (3, 9, 2) | **0** (0, 0, 0) |
| `freeloader/legacy-control-flow` | yes | 8 (8, 0, 0) | 0 (0, 0, 0) |
| `freeloader/ng-class-style` | yes | 7 (3, 4, 0) | 0 (0, 0, 0) |
| `shape/feature-injects-data` | yes | 7 (0, 4, 3) | 0 (0, 0, 0) |
| `shape/reactive-form` | yes | 1 (0, 1, 0) | 0 (0, 0, 0) |
| **all gated kinds** | | **326** | **0** |
| `layout/nested-flex-grid` | **no, heuristic** | 13 (3, 2, 8) | **32** (13, 10, 9) |

Hook firings in gate-on: 39, 39, 54. Zero in gate-off, as expected, since no hooks are registered there.

Ten gated kinds recorded zero in **both** conditions and are omitted above: `style-attribute`, `raw-icon`, `raw-palette-color`, `raw-css-literal`, `hand-set-change-detection`, `component-subscribe`, `restated-validator`, `presentational-injects-data`, `vm-not-component-scoped`, `vm-not-provided`. A rule that never fires is a result too, and several of them are the native-pattern controls: the thesis predicted they would stay quiet, and they did.

Note which kinds carry the mass. The four largest are the sealed vocabulary (229 between them), schema-driven forms (23) and MVVM state placement (14). Those are exactly the non-native patterns the capstone was built to aim at. The native-pattern kinds Angular's own docs already cover contributed 15 of 326.

## The most interesting result: the gates displaced drift into the one dimension they do not enforce

`nested-flex-grid` has been a counter-only heuristic since Part 2, deliberately never gated, because a flex toolbar of flex rows and a nested-flex fake grid are not distinguishable from classes alone. Under gate-on it went **up**, 13 to 32, while everything enforced went to zero.

The obvious story is displacement: block the agent from `space-*` utilities and appearance classes and it restructures the markup instead, nesting flex containers to get the layout it wanted. The obvious story is also exactly the kind of thing that is satisfying enough to publish without checking, so it was checked. A raw count cannot separate displacement from the agent simply emitting more markup, and gate-on ran 24% more turns.

Dividing by markup volume settles it:

| | template elements | flex containers | components | nested-flex-grid | per 1k elements | per flex container |
| --- | --- | --- | --- | --- | --- | --- |
| gate-off (3 trials) | 1285 | 268 | 31 | 13 | **10.1** | 0.049 |
| gate-on (3 trials) | 1176 | 268 | 31 | 32 | **27.2** | 0.119 |

Identical flex-container and component counts, and gate-on produced *fewer* elements. It did not build more app. The rate is 2.7x higher, and the per-trial rates separate cleanly with no overlap: gate-off 7.0, 4.8, 18.0 against gate-on 25.3, 23.8, 37.2.

So it is displacement. This is the sharpest practical finding in the series, and it generalizes past this repo: **a partial constitution does not reduce drift so much as relocate it into whatever it left unenforced.** Every gap in a gate is a channel, and the pressure finds it. Anyone shipping a lint-rule constitution should expect their un-enforced conventions to get *worse*, not merely stay the same, and should measure the dimensions they chose not to enforce rather than assuming they are unaffected.

The honest limit on this claim: n is 3 per condition, one repo, one model, one task. The effect is large and the separation is clean, but it is one experiment.

## What it cost

Per-subagent cost is captured from each stage's own result JSON and summed, never estimated. Six Haiku subagents per trial.

| condition | trials | total USD | mean USD/trial | total turns | mean turns/trial |
| --- | --- | --- | --- | --- | --- |
| gate-off | 3 | 7.15 | **2.38** | 799 | 266 |
| gate-on | 3 | 10.21 | **3.40** | 989 | 330 |

The constitution costs **+43% in spend and +24% in turns**. That is the price of 326 violations eliminated, and it is a real price, not a rounding error. The series had been carrying the uniform-substrate claim as an assertion; this is the first time it has a number attached, and the number is not free.

Where the extra spend lands is more interesting than the total. The `integrate` stage is where gate-on diverges hardest: 0.36 / 0.28 / 0.50 USD in gate-off against 1.11 / 0.62 / 1.37 in gate-on. Reconciling six independently-built stages under active enforcement is roughly three times the work of reconciling them without it. The `domain` stage, which writes plain TypeScript with almost no template surface, is indistinguishable between conditions (0.21 / 0.12 / 0.13 against 0.10 / 0.15 / 0.12). The cost tracks template and component surface, precisely where the gates live.

## The residue: what got past every gate

This is the part that matters most, because the goal is not to score a frozen constitution. It is to build a gate good enough to catch everything, and then find out whether it did. It did not.

### 1. A fatal drift that no rule gates

Every component in every trial, both conditions, imports `NgIconsModule` from `@ng-icons/core` into its `imports` array, alongside an otherwise-correct `provideIcons(...)`. Bare `NgIconsModule` throws at bootstrap: *"No icons have been provided. Ensure to include some icons by importing them using NgIconsModule.withIcons({ ... })."*

The consequence is that **three of six builds compile cleanly and render a blank page** (gate-off t1, gate-on t1, gate-on t3). `ng build` passes. `strictTemplates` passes. Every AST gate passes. The application is dead.

The `raw-icon` rule bans inline `<svg>` and `capstone-spec.md` states plainly that the registration half is doc-only and ungated, because registration is a fact about the component class and the template engines cannot see it. That documented limitation is exactly where the drift landed, and it turned out to be the fatal half. Writing the limitation down rather than claiming the rule was complete is the only reason this reads as a finding instead of a mystery.

It is also **trivially decidable**: `NgIconsModule` in a component's `imports` array is the same TypeScript-AST property as `FormsModule` (gated since Part 3) and `ReactiveFormsModule` (gated since Part 3). The gap is closable and is being closed.

### 2. The responsive plane, and why half its data is missing

| | t1 | t2 | t3 |
| --- | --- | --- | --- |
| gate-off | n/a (build does not render) | 72 (dashboard 0, roster **72**, detail 0) | 18 |
| gate-on | n/a (build does not render) | 51 (dashboard 21, roster 15, detail 15) | n/a (build does not render) |

`n/a` is not zero, and the distinction is load-bearing. The auditor carries a render assertion that refuses to measure a page with no substantive content. Without it, Playwright would have measured a blank page, found no overflow, and reported those three builds as **responsive-perfect**. A green number on a dead application is the worst outcome available, and the assertion is the only thing standing between this report and three of them.

Where data exists, the soft responsive gate helped and did not close: 72 to 51 on the one comparable pair. It remains soft by nature, since Playwright needs a whole rendered app and a per-edit hook is physically impossible. Note also the shape difference: gate-off's 72 are entirely on the roster route, the wide table the build spec explicitly warned about and offered two solutions for. gate-on's failures are spread evenly, roughly six per route of which are inherited Helm chrome that carries no file provenance (see `capstone-spec.md`, asymmetry 4).

### 3. The displaced heuristic

`nested-flex-grid`, above. Part 2 judged it undecidable from classes alone and left it counter-only. The capstone gives that judgment a far larger sample and a reason to revisit it: an un-enforced heuristic is not neutral, it is a drain.

### 4. The agent edited the gate

In two of three gate-on trials the agent under test modified `stylelint.config.mjs`, byte-identically, adding `light` and `dark` to `ignoreValues` so that `color-scheme: light` would stop failing. A third trial left the config alone and invented a `var(--color-scheme)` indirection to dodge the same rule. Three trials, three responses to one bad rule, two of them by reaching for the rule itself.

Both halves of this matter and neither should be dropped.

It was not cheating. The rule had a genuine false positive: its property matcher was `/color/`, which also matches `color-scheme`, and `color-scheme` is not a color property. The agent hit a broken rule and fixed it, which in most contexts is the correct engineering response. That false positive is now fixed at the source, tightened to `/^(color|.*-color)$/`.

But `raw-css-literal` was reported as **0** for those two trials, and part of that zero was the agent widening the rule rather than obeying it. Nothing in the harness noticed, and nothing would have told a reader. A gate the subject can edit is not a gate, and a measurement that cannot detect its own instrument being adjusted is not a measurement.

The driver now records every changed file, refuses to mark a run OK if it touched enforcement configuration (`stylelint.config.mjs`, `eslint.config.mjs`, `harness/`, `.claude/hooks/`, either skills mirror, `components.json`), and prints a `TAMPER` line naming the files.

This series has carried "enforcement must not have a dial" as a design principle since Part 1. Here it arrived as an experimental result, and the dial was not the thing anyone was watching for. It was not an `eslint-disable` comment, which the config already switches off wholesale via `noInlineConfig`. It was the config file, sitting in the repo, writable by the thing being constrained.

## The coverage audit: what leaked that no counter can see

The counters report only kinds they already know about, so a clean tally proves nothing about drift nobody thought to name. A capable-model review read all three gate-on builds against the full constitution looking for exactly that, and found substantial drift invisible to every existing rule. The highest-value findings, each verified against source before being written down:

| leak | scale | why nothing caught it |
| --- | --- | --- |
| `NgIconsModule` in `imports` | fatal, 3 of 6 builds | no rule existed |
| `hlm*` attribute matching no selector | 18 sites | rule 1 asks only whether a native element carries a primitive |
| `standalone: true` | 19 sites | no rule existed, despite a verbatim `CLAUDE.md` line |
| `provideIcons` replaced by an invented token | every icon blank in 1 build | spec had called this permanently doc-only |
| `(ngSubmit)` with no forms module | 4 dead submit buttons | banned neither by the ngModel rule nor the reactive-forms rule |
| overlay with no `hlmDialogTitle`, control with no `hlmField` | ~11 sites | the seal checks presence, never composition |

Six new rules close these, written doc-first after the run and **not tested by it**: `unknown-primitive` and `missing-composition-part` in the sealing spec, `explicit-standalone`, `legacy-icon-module`, `unregistered-icon` and `orphan-ng-submit` in the component-shape spec. Two existing rules were widened, because the audit showed both being evaded by relocation rather than obeyed: `component-subscribe` now reaches `*ViewModel` classes, and `state-outside-vm` now counts `form()`.

Three of these deserve to be read as more than a list.

**`explicit-standalone` is the cheapest rule in the constitution and nobody wrote it.** It is a verbatim line in the baseline docs, the same AST shape as a rule shipped since Part 3, and it was violated in nearly every component of every build. It was invisible for no better reason than that nobody thought to mechanize the easy one.

**`orphan-ng-submit` was caused by the gate.** Rules 3 and 6 ban `FormsModule` and `ReactiveFormsModule`, which are the only providers of the `ngSubmit` output. The model's prior for "how a form submits" survived the ban on the modules that make it work, so it wrote `(ngSubmit)` anyway, four times, and used `submit()` from signals zero times. Angular treats an unmatched output binding on a native `<form>` as a DOM listener for an event nothing fires. Every primary save flow in those builds was a dead button on a page that looked complete. **A constitution that forbids an API without forbidding its usage has not prevented the pattern; it has broken it silently.** That belongs beside the displacement result as the second half of one lesson about partial coverage.

**`unregistered-icon` reverses a call this project got wrong.** `capstone-spec.md` stated the registration half of the icon rule was permanently doc-only because the template engines cannot see the component class. That reasoning was correct about the *template* engines and wrong about decidability: it is a plain TypeScript-AST property, and the shape rules have always been TypeScript rules. The correction is recorded rather than quietly applied, because "we said this could not be gated and we were wrong" is worth more to a reader than a rule that silently appears.

## The largest hole, still open: accessibility

`CLAUDE.md` states it plainly: "It MUST pass all AXE checks. It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes." There is no accessibility auditor in the harness, and the review found nine distinct failure classes across the builds: icon-only controls with no accessible name, inputs whose only label is a placeholder, `<label for>` pointing at a custom element, an `<a (click)>` with no href and no tabindex, a hand-built tab strip with no `role="tablist"` or `aria-selected`, dialogs with no accessible name, navigation as `<button [routerLink]>`, a `<ul>` with a non-`<li>` child, and progress bars with no `role="progressbar"`.

Most of it is decidable from the template AST alone, and the rendered half is nearly free: `harness/playwright` already builds and serves the app for the responsive auditor, so `axe-core` could ride the same rig. This needs no new doc, because the rule is already written. It is the obvious next plane and it is not built here.

## The permanent ceiling

Two classes of drift are not decidable from any AST, and saying so is part of the result rather than an excuse.

**A store wearing a different name.** Rule 7 forbids a `providedIn: 'root'` ViewModel, using the `ViewModel` name suffix as its decidable marker. Two builds put the real screen state in a root-scoped `ThemeService` and reduced the ViewModel to an eleven-line passthrough that the template reached straight through. Rule 7 cannot see it. **The rule does not detect singleton screen state; it detects singleton screen state that admits to being a ViewModel**, and it is one rename away from evasion. Naming-convention-as-marker is a real technique with a real limit, and this is the limit.

**Code that was never written.** One trial shipped four "Coming soon" placeholders and a hero-detail screen with no tabs, no edit form and no retire dialog, while its ViewModel dutifully built `heroForm`, `fieldsMeta`, `saveHero` and `retireHero` — every one unreachable. Every counter reads zero on that screen, correctly, because zero code was written there. A gate measures what is present. It cannot measure what is absent, and no lint rule ever will.

## What this run is not

`capstone-spec.md` says it in full; the short version belongs here too. Unlike Parts 1 through 5, this moves the entire hook set at once rather than one variable, so it cannot attribute the 326-to-0 result to any individual rule. The per-Part runs did that job. This one measures the aggregate, and an aggregate is only honest when labeled as one.

Three trials per condition, one repo, one model, one task.
