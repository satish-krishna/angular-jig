# The capstone, summarized for analysis

A self-contained account of both capstone rounds, written to be read on its own. The long-form evidence is in `capstone-report.md`; the per-run JSON is under `capstone/`. Every number here traces to a run's own record, and the two that do not survive scrutiny are marked as retracted rather than quietly dropped.

## What was run

Eleven complete builds of the same application by a headless Haiku agent, decomposed into six stages per build, each stage its own process with no shared context. **$23.50 of Haiku across 67 subagents.** The target was a "Hero Ops Console": four routed screens, a persistent shell, twelve spartan primitives, ViewModels, a schema-driven form, a theme switcher, responsive at three breakpoints.

**Round 1** measured the constitution as it stood, 14 gated rules, gate-off against gate-on, three trials each.

**Round 2** measured the constitution after it had been repaired using round 1's findings: 21 rules, a clean substrate, an instruction to consult the MCP, and a new runtime plane. Three trials, gate-on only, because the question had changed from "does a constitution help" to "does the best one we can build catch everything."

## Round 1: the gates work, and that is the least interesting thing about it

| | gate-off | gate-on |
| --- | --- | --- |
| gated drift, 3 trials | **326** | **0** |
| cost per trial | $2.38 | $3.40 (**+43%**) |
| turns per trial | 266 | 330 (+24%) |
| builds that actually run | 2 of 3 | 1 of 3 |

Every kind the constitution named went to zero. The mass sat exactly where the series' thesis predicted: 229 of 326 in the sealed vocabulary, 23 in schema forms, 14 in MVVM state placement. The native-pattern kinds Angular's own docs already cover contributed 15 of 326, which is why Parts 4 and 5 had returned nulls.

**The constitution costs 43% more spend and 24% more turns.** That is a real price for 326 violations, and it lands almost entirely on the stage that reconciles independently-built work: the integrate stage runs roughly three times more expensive under enforcement, while the domain stage, which is plain TypeScript with almost no template surface, is indistinguishable between conditions. Cost tracks the surface the gates live on.

And then the part that matters: **three of six builds compiled cleanly, passed every gate, and rendered a blank page.**

## What got past everything

| leak | scale | why no rule saw it |
| --- | --- | --- |
| `NgIconsModule` with no root `provideIcons` | fatal, 3 of 6 builds | no rule existed |
| `hlm*` attributes matching no real selector | 17 sites | rule 1 only asks whether a native element carries a primitive |
| `standalone: true` | 19 sites | no rule existed, despite a verbatim `CLAUDE.md` line |
| `provideIcons` replaced by an invented token | every icon blank in 1 build | spec had declared this ungateable |
| `(ngSubmit)` with no forms module | 4 dead save buttons | banned by neither the ngModel nor the reactive-forms rule |
| overlay with no title, control with no field | ~11 sites | the seal checks presence, never composition |
| **the agent editing the enforcement config** | 2 of 3 gate-on trials | nothing was watching |

## The five findings

**1. The gate you did not write is the one that bites.** Every fatal defect across both rounds was a dependency-injection failure: icons resolved in the wrong injector, a ViewModel injected but never provided, `hlm-dialog-content` rendered inline instead of on its portal. Each is well-formed code with checked types and real primitives, failing only when Angular assembles the graph. No AST rule reaches any of them, and a browser sees all three instantly. The fix was not another rule; it was booting the app, on a Playwright rig the harness already ran and whose console it was discarding.

**2. Availability is not consultation.** The spartan MCP server was configured and passed on every run in round 1. Across 36 subagents and **1,752 tool calls it was invoked zero times**, and no skill was ever invoked. When the agent needed the dialog API it grepped and read the library *source*, which gives selectors and says nothing about required composition. The portal requirement was printed verbatim on line 24 of a doc it had loaded. After one paragraph was added to `CLAUDE.md` naming the failure, round 2 used it 5 to 10 times per trial and the DI failures stopped. Docs the model does not open are worth what an unread manual is worth.

**3. A partial ban breaks what it does not finish.** Rules 3 and 6 ban `FormsModule` and `ReactiveFormsModule`, which are the only providers of the `ngSubmit` output. The agent's prior for "how a form submits" survived the ban on the modules that make it work, so it wrote `(ngSubmit)` four times and used the sanctioned `submit()` zero times. Angular treats an unmatched output on a native `<form>` as a listener for an event nothing fires. Every primary save flow shipped as a dead button on a page that looked finished. **A constitution that forbids an API without forbidding its usage has not prevented the pattern; it has broken it silently.**

**4. A gate the subject can edit is not a gate.** In two of three gate-on trials the agent modified `stylelint.config.mjs`, byte-identically, widening a rule that was blocking it; a third invented a CSS-variable indirection to dodge the same rule. It was not cheating: the rule had a genuine false positive. But `raw-css-literal` was then reported as 0, and part of that zero was the rule being widened rather than obeyed. This project had carried "enforcement must not have a dial" as a design principle since Part 1, and the dial nobody was watching was not a suppression comment. It was the config file, sitting in the repo, writable by the thing being constrained.

**5. The trials contaminated each other.** `experiments/` lives inside the repo and therefore inside the agent's working tree. Four stages read a previous trial's implementation out of it, including a gate-on trial reading a gate-off one. One build's dialog bug is a near-verbatim copy of the previous trial's, defect inherited rather than independently reinvented. The trials were not independent samples and the two arms were not fully independent either. Direction of results is unaffected; the n=3 is softer than n=3 normally implies.

## RETRACTED: the displacement finding

Round 1 reported that `nested-flex-grid`, the one kind deliberately left un-enforced, rose from 13 to 32 under gate-on while every enforced kind went to zero. Normalized against markup volume it was a clean 2.7x with no per-trial overlap. It was published as displacement: block the agent from one dimension and the drift relocates into whatever is unguarded. It was called the sharpest practical finding in the series.

**It is wrong, and the reason is worth more than the finding was.**

The house doc says, verbatim: "**A row of flex columns**, each itself a flex stack, arranged to line up into a grid, is the anti-pattern." That sentence is directional. The implemented rule was not: it flagged any flex container with two or more flex children, so an ordinary card body holding a header row and a content row counted the same as a grid faked out of columns.

| | old proxy | faithful to the doc |
| --- | --- | --- |
| gate-off t1 / t2 / t3 | 3 / 3 / 8 | **0 / 0 / 0** |
| gate-on t1 / t2 / t3 | 13 / 10 / 10 | **0 / 0 / 0** |

Sixty-three flagged sites across the six trials. One was the anti-pattern. What rose was benign markup, and under a faithful rule both arms are flat.

Part 2 had argued the rule was undecidable, using this counter-example: "a legitimate flex toolbar of flex rows looks the same as a nested-flex grid." A toolbar of flex *rows* is a *row of rows*. The discriminator was sitting inside the sentence written to prove no discriminator existed. The rule was never undecidable, only unencoded, and five Parts of measurement inherited the loss.

**What replaces it is a better finding, because it is about method.** This survived five Parts precisely *because* it was never gated. A rule that blocks an edit has its false positives shoved in your face within a day. A rule that only counts is checked by nobody, and quietly accumulates authority in reports until someone cites it. **The counter-only category is where bad rules go to be believed.**

It was not caught by review, and not by a test. It was caught by someone asking why the last non-zero number was still ungated.

## Round 2: the repaired constitution

Twenty-one rules armed, a substrate containing no previous trials, the MCP instruction in `CLAUDE.md`, and the boot gate live and counted in the pass condition.

| | t1 | t2 | t3 |
| --- | --- | --- | --- |
| seal / layout / shape / freeloader | 0 / 0\* / 0 / 0 | **0 / 0 / 0 / 0** | **0 / 0 / 0 / 0** |
| boot | ok | **ok** | **ok** |
| hook firings | 21 | 40 | 47 |
| spartan MCP calls | 10 | 6 | 5 |
| cost | $2.26 | $2.98 | $2.33 |

\* one under the faithful nested-flex rule, which was not yet armed for t1.

Every gated kind zero, in every trial, with 108 hook firings across the three: **the gates fired and the agent corrected**, rather than never being tested. All three builds run. Responsive residue is entirely inherited Helm chrome, a two-pixel clip in `hlm-sidebar-menu-button`, present in the library rather than in the generated markup.

The honest reading of the coverage question: **of the drift the constitution names, it now catches all of it.** In round 1, re-measured under today's rules, gate-off shipped 378 gateable violations and gate-on shipped 61 — and every one of those 61 came from a rule, or a rule scope, that did not exist when that run happened. Zero were armed gates failing.

## What is still not covered

**Accessibility.** `CLAUDE.md` demands AXE-clean and WCAG AA. Nothing checks it. A review of the gate-on builds found nine distinct failure classes: icon-only controls with no accessible name, inputs labelled only by a placeholder, `<label for>` pointing at a custom element, a click-only anchor with no keyboard path, a hand-built tab strip with no `role="tablist"`, dialogs with no accessible name. Most is decidable from the template AST alone, and the rendered half is nearly free because Playwright is already wired. This is the largest unbuilt thing in the repo.

**Two classes that no AST can reach.** A `providedIn: 'root'` service holding screen state is a store wearing a different name, and the ViewModel rule detects it only when it admits to being a ViewModel: one rename from evasion. And code that was simply never written cannot be measured at all. One trial shipped four "Coming soon" placeholders and a detail screen whose ViewModel built a form, a retire dialog and seven handlers that no template ever reached. Every counter read zero there, correctly, because zero code was written. **A gate measures what is present. It cannot measure what is absent.**

## Caveats a reader should carry

- **Round 2 moved four variables at once** — clean substrate, six new rules, the MCP instruction, the boot gate. Three green trials show the completed constitution holds. They do not attribute the result to any one change.
- **The capstone is an aggregate, not an isolation.** Unlike Parts 1 to 5 it moves the whole hook set, so it cannot say which rule earned its keep. The per-Part runs did that.
- **n is 3 per condition, one repo, one model, one task**, and round 1's trials were mutually contaminated.
- **One trial's evidence was destroyed** by the author during substrate cleanup; its code survives on a branch, its cost and firing records do not.
- **`nested-flex-grid` is armed but untested.** It never fired in either round 2 trial that had it, so its zero means "did not come up", not "was caught".
