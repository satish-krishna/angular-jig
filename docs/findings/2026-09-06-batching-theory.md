# The batching theory does not explain this harness's long correction episodes

## The negative result, stated plainly

The originating brief carried an architectural claim — call it the batching theory — that a coding agent's tool calls surface gate failures one at a time, forcing the agent into a serial "queue walk": fix one violation, get rejected on the next, fix that one, and so on. The brief's prescribed fix was to batch violations into a single report so the agent could clear them together. This repo's own hook design already does exactly that (every hook returns every violation in the edited file on every firing, mean 2.94 per firing, max 28), which put the theory in a position to be tested rather than assumed.

It does not survive the test. Across every correction episode this harness has logged, **89% clear on the first rejection**, only **16% of within-streak transitions show the queue-walk signature** (count falling by exactly one), and **74% show no progress at all** — count flat or rising between consecutive rejections on the same file. The batching property the brief prescribes is already present in this harness, and it is not what is costing the harness its long episodes. Something else is.

## Method

Source: every `hook-firings.jsonl` under `experiments/` — 16 logs, 179 firing records in total, confirmed by direct count (`find experiments -name hook-firings.jsonl -exec cat {} \; | wc -l` returns 179). An *episode* is a maximal run of consecutive firings, in timestamp order within one trial, on the same `(hook, file)` pair — the run breaks the moment a different hook or a different file fires next, even momentarily. Violation identity strips the leading `path:line:col` so the same violation reported at a drifted line, after an unrelated edit shifts it, still compares equal; without that, a violation shifting one line down would look like one violation clearing and a new one appearing, overstating progress.

The script that computes this, `harness/driver/analyze-streaks.mjs`, is a straight port of the working analysis script used to produce these numbers (`--json` added so the figures can be regenerated rather than trusted; the analysis itself is unchanged). Running it against this repo's `experiments/` directory reproduces every aggregate figure in this document.

## Episode depth, n = 141 episodes

| depth | episodes | share |
|---|---|---|
| 1 | 125 | 89% |
| 2 | 9 | 6% |
| 3 | 4 | 3% |
| 4 | 1 | 1% |
| 5 | 1 | 1% |
| 15 | 1 | 1% |

## The batching test, across all 38 within-episode transitions

| `count` movement | transitions | share |
|---|---|---|
| fell by exactly 1 — the queue-walk signature | 6 | 16% |
| fell by more than 1 — a batch fix | 4 | 11% |
| flat or rose — no progress at all | 28 | 74% |

**Verdict: `count` does not step down one at a time. It mostly does not move.** The batching theory's mechanism — that failures surface one at a time and force a serial walk that shrinks by one each round — predicts a distribution dominated by the "fell by exactly 1" row. The data shows the opposite: three quarters of within-episode transitions show no forward progress by this measure at all. We already have the batching property the brief prescribes (mean 2.94, max 28 violations reported per firing); it is not what is costing this harness its long episodes.

## What the long episodes actually are

The deepest single episode in the table above is depth 15: `seal-templates` on `hero-detail.ts`, capstone gate-on trial 2. That fragment is part of a longer run of 19 consecutive `seal-templates` rejections against the same file, over roughly four minutes. The episode-boundary rule used for the table above breaks a streak the instant a *different* hook fires against the same file, and in this run `component-shape` and `check-layout` each fired against `hero-detail.ts` at a few points during that window — which is why the table's strict count is 15, not 19, even though the underlying sequence of same-hook rejections the agent actually experienced was 19 rejections long. From the agent's point of view there is no such distinction: it does not know or care which hook rejected which edit, only that the edit was rejected again. Read as the agent experienced it — one continuous correction sequence against this file — it is 19 steps. The table below walks that full 19-step sequence, hand-verified against the raw `hook-firings.jsonl` messages (line numbers, timestamps, and violation counts all confirmed against the logged records):

```
 1 n=5  15:47:42  79,80,81,82 <button> | 270 <textarea>
 2 n=4  15:48:47  74,75,76,77 <button>
 3 n=4  15:49:15  72,73,74,75 <button>
 4 n=4  15:49:17  72,73,74,75 <button>
 5 n=4  15:49:19  72,73,74,75 <button>
 6 n=4  15:49:33  72,73,74,75 <button>
 7 n=4  15:49:35  72,73,74,75 <button>
 8 n=4  15:49:38  72,73,74,75 <button>
 9 n=4  15:49:40  72,73,74,75 <button>
10 n=4  15:49:42  72,73,74,75 <button>
11 n=4  15:49:44  72,73,74,75 <button>
12 n=4  15:49:46  72,73,74,75 <button>
13 n=4  15:50:16  71,72,73,74 <button>
14-18   ... identical, 71,72,73,74
19 n=4  15:51:21  66,67,68,69 <button>
```

Firings 3 through 12: **ten consecutive rejections, two seconds apart, naming the same four buttons at the same four line numbers.** The hook only fires on `PostToolUse`, so the agent was actively editing the file between these firings — and the reported lines did not move, which means those edits were below line 75 or line-count-neutral. Between firings 12 and 13 the file shortened by one line above the buttons; between 18 and 19, by five.

**The agent was working somewhere else in the file and being blocked, every two seconds, by four violations its edit never touched.**

That is not a queue our message design created. It is a different defect: **the hook gates the whole file on every edit, so pre-existing violations anywhere in the file block unrelated work indefinitely.** The batching fix the brief prescribes would make this *worse*, not better — more violations per rejection means more noise per rejection, and the violations blocking the agent are precisely the ones it is not currently working on.

The four buttons, incidentally, were a hand-rolled tab strip, eventually resolved as `<button hlmBtn variant="ghost">` — which satisfies the rule and is the same hand-built tab strip with no `role="tablist"` that the capstone accessibility review lists as a failure class. The gate spent nineteen rejections steering the agent toward a compliant version of the wrong thing.

**Recommendation (out of scope for this branch, offered as a follow-up):** report all violations, but block only on violations whose line range intersects the edit. Report the rest as context. That keeps the batching property this harness already has, removes the whole-file wedge, and is a change to the instrument itself — it changes what the gate blocks on — so it needs its own A/B rather than a quiet commit alongside unrelated work.

## Sub-question 1: should the agent write its own Playwright script per feature?

**No.** `check-boot.mjs` already clicks every visible enabled button on every route and captures `pageerror` and `console.error`; `responsive-auditor.mjs` already sweeps breakpoints. What a per-feature script would add is *semantic* assertions — "after clicking Retire, the hero leaves the roster" — and that is a test, not a gate. The distinction this repo already draws holds: a gate encodes a property that is true of all correct programs, and an agent that writes its own gate grades its own homework. The measured evidence favors this conclusion too: an agent that never opened the docs it was handed (see `docs/decisions/2026-09-06-where-guidance-lives.md` for the capstone's zero-MCP-invocations measurement) is not an agent whose self-authored acceptance criteria should be load-bearing.

The gap is real, but it is not Playwright-shaped. It is accessibility — nine distinct failure classes across the gate-on builds, nothing checking any of them, and most of it decidable from the template AST that six of these rules already walk. That is the largest unbuilt thing in this repo, and it is worth more engineering effort than any loop.

## Sub-question 2: does a tighter build-fix-check loop change "gates belong at the earliest point a property becomes decidable"?

**It relocates the same check; the conclusion stands.** A browser cannot run per-edit — `check-boot.mjs` shells out to `ng build` first — so a rendering property is not decidable at edit time no matter how the loop around it is packaged. The principle already predicts the split this repo has: AST properties gate the edit, rendering properties gate the build. The capstone's own finding sharpens this rather than softening it — its three fatal defects were dependency-injection failures that *no* static rule could reach, which is the principle working as designed, not failing. A faster inner loop for the build-time tier is a scheduling improvement. It is not an architectural one.

## Honesty notes

**The originating brief's premise numbers are not in this repo.** "52% of correction episodes cleared on the first rejection" and "the worst took nine consecutive rejections" appear nowhere in `experiments/`, nowhere in `harness/`, and nowhere in any prior report — a repo-wide search turns up neither figure outside the plan document that quotes the brief itself. There was no episode-analysis code in this repo before this branch. The measured figures, from the analysis above, are **89%** at depth 1 and a worst case of **19** consecutive same-hook rejections against one file (15 by the strict cross-hook episode boundary used for the depth table; see "What the long episodes actually are" above for why the two numbers differ and what each one measures).

**The line-intersection recommendation above is not implemented on this branch.** This document reports the finding and names the fix as a follow-up; it does not change `harness/gate/*`, any rule, or any hook. Changing what a gate blocks on changes the instrument this whole repo uses to measure agent behavior, and a change to the instrument needs its own A/B trial rather than landing quietly alongside a rules migration.

## Reproducing these numbers

```
node harness/driver/analyze-streaks.mjs          # human-readable report
node harness/driver/analyze-streaks.mjs --json   # machine-readable, for programmatic checks
```

Both were run against this repo's `experiments/` directory while writing this document and reproduce every aggregate figure above (episode counts, depth shares, transition counts and shares, firing counts, mean and max violations per firing).
