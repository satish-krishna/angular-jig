# The capstone: what the whole constitution caught, and what got past it

Six trials, three per condition, all on Haiku, run 2026-09-05 against `main`. Read `../harness/capstone-spec.md` first; it states what this run is and, more importantly, what it is not.

Every number here comes from a run's own JSON under `capstone/<condition>/<runId>/`. Nothing is estimated. Regenerate the tables with `node harness/driver/summarize-capstone.mjs` and `node harness/driver/normalize-markup.mjs`.

The question this run exists to answer is not "does a constitution reduce drift." It is **"does the best constitution we can build catch all of it."** The answer comes in two parts, and the second is the useful one:

- Of the drift the constitution **names**, it caught everything. 326 violations to zero, across nine kinds, in three trials.
- Of the drift it does not name, it caught none, and there was a great deal. Three of six builds compiled clean and rendered a blank page. Seventeen sites wrote primitives that bind nothing. Four primary save flows shipped as dead buttons. And in two trials the agent edited the enforcement config so its own code would pass.

A gate is not a wall. It is a set of named prohibitions, and the drift goes wherever they are not.

There is a third part, added after the fact and less comfortable than either: **one of the things the constitution named, it was not actually measuring.** `nested-flex-grid` counted for five Parts and reported a result that has now been retracted, because the code never encoded the sentence the doc wrote. A rule that only counts is checked by nobody. See the retraction.

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
| `layout/nested-flex-grid` | see retraction | ~~13~~ (3, 2, 8) | ~~32~~ (13, 10, 9) |

The `nested-flex-grid` row is **retracted**. Those numbers come from a proxy that did not encode the rule it claimed to measure; under a faithful rule both conditions are 0 in every trial. It is left struck through rather than deleted, because the retraction is the more useful finding. See below.

Hook firings in gate-on: 39, 39, 54. Zero in gate-off, because no hooks were registered there during the run. Note for anyone re-running: the enforcement guard added afterwards (see below) IS registered in both conditions and logs to the same file, so a future gate-off run will report a non-zero count, and a future gate-on count mixes constitution firings with guard firings.

Ten gated kinds recorded zero in **both** conditions and are omitted above: `style-attribute`, `raw-icon`, `raw-palette-color`, `raw-css-literal`, `hand-set-change-detection`, `component-subscribe`, `restated-validator`, `presentational-injects-data`, `vm-not-component-scoped`, `vm-not-provided`. A rule that never fires is a result too, and several are the native-pattern controls the thesis predicted would stay quiet.

**Two of those zeros need a caveat, and it cuts against the headline.** `component-subscribe` and `state-outside-vm` read zero *as the rules stood during the run*. Both were widened afterwards, precisely because the coverage audit found them being evaded by relocation, and re-running today's counter over the same gate-on builds gives `component-subscribe` **2** and `state-outside-vm` **2**. So the `state-outside-vm` row above is 14 → 0 under the constitution that ran, and 14 → 2 under the constitution as it now stands. The run-time numbers are the honest record of what the gates caught on the day; presenting them as settled null results would not be, because this branch already knows the answer changed.

Note which kinds carry the mass. The four largest are the sealed vocabulary (229 between them), schema-driven forms (23) and MVVM state placement (14). Those are exactly the non-native patterns the capstone was built to aim at. The native-pattern kinds Angular's own docs already cover contributed 15 of 326.

## RETRACTED: the displacement finding

This section originally reported the sharpest claim in the series, and it was wrong. It is kept, marked, because a retraction that deletes the claim also deletes the lesson.

**What it said.** `nested-flex-grid` has been a counter-only heuristic since Part 2, deliberately never gated. Under gate-on it went UP, 13 to 32, while every enforced kind went to zero. Normalizing by markup volume showed gate-on emitted FEWER template elements with identical flex-container and component counts, so the rate was 2.7x with clean per-trial separation. I concluded displacement: block the agent from `space-*` and appearance classes and it restructures into nested flex instead. I generalized it, too, that a partial constitution relocates drift into whatever it leaves unenforced.

**Why it is wrong.** The heuristic was never a faithful encoding of the rule it claimed to measure. The house doc says, verbatim: "**A row of flex columns**, each itself a flex stack, arranged to line up into a grid, is the anti-pattern." That sentence is DIRECTIONAL. The implementation was not: it flagged any flex container with two or more flex children, so a `flex flex-col` card body holding a header row and a content row counted the same as a grid faked out of columns.

Re-measured with a rule that says what the doc says, a flex ROW with two or more `flex-col` children:

| | old proxy | faithful rule |
| --- | --- | --- |
| gate-off t1 / t2 / t3 | 3 / 3 / 8 | **0 / 0 / 0** |
| gate-on t1 / t2 / t3 | 13 / 10 / 10 | **0 / 0 / 0** |

Sixty-three flagged sites across the six trials. Zero were the anti-pattern. The rise from 13 to 32 was a rise in ordinary card markup, and both arms are flat on the thing the rule was supposed to detect. **There is no displacement result here.** The normalization was sound and the arithmetic was right; the signal underneath was noise, and a correct method applied to a bad proxy produces a confident wrong answer rather than an obviously wrong one.

**What the mistake actually was.** Part 2 called the anti-pattern "not cleanly decidable from classes alone (a legitimate flex toolbar of flex rows looks the same as a nested-flex grid)" and settled for a loose proxy. Read that counter-example again: a toolbar of flex ROWS is a ROW of ROWS. The discriminator was sitting inside the sentence used to argue no discriminator existed. The rule was never undecidable, only unencoded, and five Parts of measurement inherited the loss without anyone re-reading the doc.

It survived that long because it was never gated. A rule that blocks an edit gets its false positives shoved in your face within a day; a rule that only counts is checked by nobody, and quietly accumulates authority in reports. **The counter-only category is where bad rules go to be believed.** That is the finding that replaces the retracted one, and it is worth more, because it is about the method rather than about one repo's flex containers.

`nested-flex-grid` is now encoded faithfully and, being decidable, is hard-gated. Part 2 wrote its own escape clause, "If the run shows it is more noise than signal, it is cut, and that cut is a finding." The run showed it. This is the cut.

**How it was caught.** Not by review and not by a test. Someone asked why the last non-zero number was still ungated, which forced a look at the nine flagged sites in a single build, and eight of them were plainly fine on sight. No amount of internal consistency would have surfaced it, because the proxy agreed with itself perfectly.

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

Four of the six trials import `NgIconsModule` from `@ng-icons/core` into component `imports` arrays; the per-trial file counts are 7, 9, 0, 8, 0, 6. Its constructor throws when the injected icon map is empty: *"No icons have been provided. Ensure to include some icons by importing them using NgIconsModule.withIcons({ ... })."*

**Three of six builds compile cleanly and render a blank page** (gate-off t1, gate-on t1, gate-on t3). `ng build` passes. `strictTemplates` passes. Every AST gate passes. The application is dead.

The mechanism is worth stating precisely, because the obvious reading is wrong and this report carried the wrong one until review caught it. `NgIconsModule` is an NgModule, so it is instantiated in the **environment** injector, and a component-level `provideIcons` does not satisfy it. What separates the live builds from the dead ones is therefore a **root-level** `provideIcons` in `app.config.ts`, and that correlation is perfect: all three builds with one rendered, all three without one are blank.

| trial | `NgIconsModule` files | root `provideIcons` | outcome |
| --- | --- | --- | --- |
| gate-off t1 | 7 | no | blank |
| gate-off t2 | 9 | yes | renders |
| gate-off t3 | 0 | yes | renders |
| gate-on t1 | 8 | no | blank |
| gate-on t2 | 0 | yes | renders |
| gate-on t3 | 6 | no | blank |

gate-off t2 is the row that kills the simpler story: nine files importing the legacy module, and it renders fine. What is fatal is importing `NgIconsModule` *without* a root-level registration. Note also that the two variables are perfectly confounded in this sample — there is no build with neither — so with n=6 the data cannot separate "the legacy module needs root registration" from "no root registration is fatal on its own." The framework source resolves it (the module constructor is what throws), but the run alone does not.

The `raw-icon` rule bans inline `<svg>` and `capstone-spec.md` states plainly that the registration half is doc-only and ungated, because registration is a fact about the component class and the template engines cannot see it. That documented limitation is exactly where the drift landed, and it turned out to be the fatal half. Writing the limitation down rather than claiming the rule was complete is the only reason this reads as a finding instead of a mystery.

It is also **trivially decidable**: `NgIconsModule` in a component's `imports` array is the same TypeScript-AST property as `FormsModule` (gated since Part 3) and `ReactiveFormsModule` (gated since Part 3). The gap is closable and is being closed.

### 2. The responsive plane, and why half its data is missing

| | t1 | t2 | t3 |
| --- | --- | --- | --- |
| gate-off | n/a (build does not render) | 72 (dashboard 0, roster **72**, detail 0) | 18 |
| gate-on | n/a (build does not render) | 51 (dashboard 21, roster 15, detail 15) | n/a (build does not render) |

`n/a` is not zero, and the distinction is load-bearing. The auditor carries a render assertion that refuses to measure a page with no substantive content. Without it, Playwright would have measured a blank page, found no overflow, and reported those three builds as **responsive-perfect**. A green number on a dead application is the worst outcome available, and the assertion is the only thing standing between this report and three of them.

Where data exists, the soft responsive gate helped and did not close: 72 to 51 on the one comparable pair. That comparison is weaker than it looks, and the reason was found in review rather than by design. `npm run check:responsive`, the command the gate-on agent was told to run, defaults to ONE route (`detail/11`) anchored on the routed component host, while the auditor measures three routes anchored on `body`. gate-off's 72 violations were entirely on `roster`, a route the soft gate never visits. So the agent was graded on more than it was asked to check, and the gap between the gate and the audit is a disclosure this report owes the reader rather than a subtlety. It remains soft by nature, since Playwright needs a whole rendered app and a per-edit hook is physically impossible. Note also the shape difference: gate-off's 72 are entirely on the roster route, the wide table the build spec explicitly warned about and offered two solutions for. gate-on's failures are spread evenly, roughly six per route of which are inherited Helm chrome that carries no file provenance (see `capstone-spec.md`, asymmetry 4).

### 3. The heuristic that was measuring nothing

`nested-flex-grid` reported residue in every gate-on trial and none of it was real. It is now encoded to match the doc, is decidable, is hard-gated, and reports 0 across every trial of both conditions. The residue was in the rule, not in the builds. See the retraction above.

### 4. The agent edited the gate

In two of three gate-on trials the agent under test modified `stylelint.config.mjs`, byte-identically, adding `light` and `dark` to `ignoreValues` so that `color-scheme: light` would stop failing. A third trial left the config alone and invented a `var(--color-scheme)` indirection to dodge the same rule. Three trials, three responses to one bad rule, two of them by reaching for the rule itself.

Both halves of this matter and neither should be dropped.

It was not cheating. The rule had a genuine false positive: its property matcher was `/color/`, which also matches `color-scheme`, and `color-scheme` is not a color property. The agent hit a broken rule and fixed it, which in most contexts is the correct engineering response. That false positive is now fixed at the source, tightened to `/^(color|.*-color)$/`.

But `raw-css-literal` was reported as **0** for those two trials, and part of that zero was the agent widening the rule rather than obeying it. Nothing in the harness noticed, and nothing would have told a reader. A gate the subject can edit is not a gate, and a measurement that cannot detect its own instrument being adjusted is not a measurement.

Two mechanisms now close it, and the pairing is the point. `.claude/hooks/protect-enforcement.mjs` is a **PreToolUse** hook that denies the edit before it happens; it matches Bash and PowerShell as well as the file-editing tools, because a guard watching only `Write`/`Edit` is walked around with `sed -i`, a shell redirect, `cp`, or `git checkout` of another revision, and a guard with a known bypass is decoration. The driver keeps a post-hoc check that records every changed file and voids any run touching enforcement paths. Prevention plus detection: detection alone is a smoke alarm, and prevention alone cannot prove it worked.

The guard is registered in **both** conditions, unlike every other hook here, because it is an experimental control rather than a house rule. gate-off's premise is that no house conventions are enforced, not that the harness is editable, and arming it in only one arm would leave the baseline free to tamper.

This series has carried "enforcement must not have a dial" as a design principle since Part 1. Here it arrived as an experimental result, and the dial was not the thing anyone was watching for. It was not an `eslint-disable` comment, which the config already switches off wholesale via `noInlineConfig`. It was the config file, sitting in the repo, writable by the thing being constrained.

## The coverage audit: what leaked that no counter can see

The counters report only kinds they already know about, so a clean tally proves nothing about drift nobody thought to name. A capable-model review read all three gate-on builds against the full constitution looking for exactly that, and found substantial drift invisible to every existing rule. The highest-value findings, each verified against source before being written down:

| leak | scale | why nothing caught it |
| --- | --- | --- |
| `NgIconsModule` in `imports` | fatal, 3 of 6 builds | no rule existed |
| `hlm*` attribute matching no selector | 17 sites | rule 1 asks only whether a native element carries a primitive |
| `standalone: true` | 19 sites | no rule existed, despite a verbatim `CLAUDE.md` line |
| `provideIcons` replaced by an invented token | every icon blank in 1 build | spec had called this permanently doc-only |
| `(ngSubmit)` with no forms module | 4 dead submit buttons | banned neither by the ngModel rule nor the reactive-forms rule |
| overlay with no `hlmDialogTitle`, control with no `hlmField` | ~11 sites | the seal checks presence, never composition |

Six new rules close these, written doc-first after the run and **not tested by it**: `unknown-primitive` and `missing-composition-part` in the sealing spec, `explicit-standalone`, `legacy-icon-module`, `unregistered-icon` and `orphan-ng-submit` in the component-shape spec. Two existing rules were widened, because the audit showed both being evaded by relocation rather than obeyed: `component-subscribe` now reaches `*ViewModel` classes, and `state-outside-vm` now counts `form()`.

Three of these deserve to be read as more than a list.

**`explicit-standalone` is the cheapest rule in the constitution and nobody wrote it.** It is a verbatim line in the baseline docs, the same AST shape as a rule shipped since Part 3, and it was violated in nearly every component of every build. It was invisible for no better reason than that nobody thought to mechanize the easy one.

**`orphan-ng-submit` was caused by the gate.** Rules 3 and 6 ban `FormsModule` and `ReactiveFormsModule`, which are the only providers of the `ngSubmit` output. The model's prior for "how a form submits" survived the ban on the modules that make it work, so it wrote `(ngSubmit)` anyway, four times, and used `submit()` from signals zero times. Angular treats an unmatched output binding on a native `<form>` as a DOM listener for an event nothing fires. Every primary save flow in those builds was a dead button on a page that looked complete. **A constitution that forbids an API without forbidding its usage has not prevented the pattern; it has broken it silently.** With the displacement result retracted, this is now the load-bearing finding about partial coverage, and it is a sturdier one because it rests on four dead submit buttons in the shipped code rather than on a counter.

**`unregistered-icon` reverses a call this project got wrong.** `capstone-spec.md` stated the registration half of the icon rule was permanently doc-only because the template engines cannot see the component class. That reasoning was correct about the *template* engines and wrong about decidability: it is a plain TypeScript-AST property, and the shape rules have always been TypeScript rules. The correction is recorded rather than quietly applied, because "we said this could not be gated and we were wrong" is worth more to a reader than a rule that silently appears.

## The fatal defects are all the same kind, and no lint rule can catch any of them

Test-driving the one gate-on build that renders surfaced a third runtime failure within a minute, and putting it beside the other two turns three separate bugs into one pattern.

| defect | build passes? | fails at | catchable by AST? |
| --- | --- | --- | --- |
| `NgIconsModule` with no root `provideIcons` | yes | bootstrap | partly (the import is; the missing root registration is not) |
| A ViewModel injected but not provided | yes | first render | yes, `vm-not-provided` |
| `hlm-dialog-content` rendered inline instead of on `*hlmDialogPortal` | yes | dialog construction | **no** |

The third is new. Spartan's dialog instantiates its content through a service that supplies `BrnDialogRef`; render the content inline and that provider does not exist, so the screen throws `NG0201` the moment the dialog is constructed. `ng build` is perfectly happy. `strictTemplates` is happy. Every gate passes. **`hlmDialogPortal` appears zero times across all six builds** — not one trial used the documented pattern, which is printed verbatim in the spartan composition doc the agent had loaded.

`missing-composition-part` did flag that exact dialog, for missing `hlmDialogTitle`. It caught the wrong defect in the right element, which is the most instructive kind of near-miss: a containment rule can see that a required *part* is absent, and cannot see that a present part is in the wrong structural *position*.

**All three are dependency-injection failures**, and that is the pattern worth taking away. They share a shape no static rule reaches: the code is well-formed, the types check, the primitives are real and correctly named, and the graph only fails when Angular actually assembles it. Three of the four genuinely fatal defects this capstone produced are in this family.

The thing that would catch all three is not another rule. It is booting the app and listening for a thrown error, and **the harness already boots the app** — `harness/playwright/serve-and-visit.mjs` renders every build for the responsive audit and currently discards the browser console. A page-error listener on that existing rig would have caught all three at zero marginal cost. That is the highest-value unbuilt thing in this repo, and it is a smaller job than any of the AST rules already written.

## The agent never opened the docs

The spartan MCP server and the spartan and house-style skills were present in every run, in both conditions, passed on the command line as `--mcp-config .mcp.json`. Reading the session transcripts for all 36 subagents:

| tool | calls |
| --- | --- |
| Read, Edit, Bash, Write, PowerShell, Glob, Grep | 1,746 |
| Angular CLI MCP (`list_projects`, `run_target`) | 3 |
| **spartan MCP** | **0** |
| **Skill invocations of any kind** | **0** |

Across six complete builds and 1,752 tool calls, the spartan MCP was invoked **zero times** and no skill was ever explicitly invoked. What the agent did instead is visible in the same transcripts: when it needed the dialog API it ran `Grep "hlm-dialog|HlmDialog"` and read `libs/ui/dialog/src/index.ts` and `hlm-dialog.ts`. That is the Helm **source**, which states the selectors and says nothing about required composition. The portal requirement lives in the doc, and the doc was never opened.

This reframes the series' baseline claim. "The model reads good docs and drifts anyway" turns out to understate it: the model had good docs, a live MCP server built to answer exactly this question, and a skill that shows the correct dialog markup on line 24 — and reached for `grep` and the library source instead. **Availability is not consultation**, and a constitution distributed as documentation is only as good as the agent's inclination to go looking. Every gate in this repo exists downstream of that fact, which is an argument for mechanization rather than against it.

## The trials contaminated each other

`experiments/` lives inside the repo, so it is inside the agent's working tree, and four stages read a previous trial's implementation out of it:

| stage | read |
| --- | --- |
| gate-off t2, stage 4 | gate-off **t1**'s `roster.ts` and `roster.viewmodel.ts` |
| gate-on t1, stage 5 | a **Part 5** trial's `hero-detail.ts` |
| gate-on t2, stage 3 | gate-off **t2**'s `ui/hero-card.ts` |
| gate-on t2, stage 5 | gate-on **t1**'s `hero-detail.ts` and `hero-detail.html` |

The last row is where the dialog bug came from: t2's retire dialog is a near-verbatim copy of t1's, down to `<h2 class="font-semibold">Retire Hero?</h2>` and the description paragraph's classes. The defect was not independently reinvented, it was inherited.

Two consequences, and neither is small.

**The trials are not independent.** Three trials per condition was supposed to average over the agent's variance; where one trial copies another, that variance is shared, and the per-trial spread understates the true variance. This does not invalidate the direction of any result — gate-on's 326-to-0 does not turn around — but it means the n=3 is softer than n=3 usually implies.

**The conditions are not fully independent either.** gate-on t2 read gate-off t2's `hero-card.ts`. That is a gate-on build seeded from an ungated one, which is the single worst leak available in a two-arm comparison, and the arms are supposed to share nothing but the substrate.

The fix is mechanical and now in place: `experiments/` is added to the enforcement guard's protected set, so the agent under test cannot read a previous run's output, and the driver's post-hoc check treats a run touching it the same way it treats a run editing a config. It should have been there from the start; the reason it was not is that the guard was written to stop the agent editing the *rules*, and nobody thought about it reading the *answers*.

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
