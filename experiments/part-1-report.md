# Part 1 measured run: the sealing gate

The proving run for the Part 1 sealing gate, three trials per condition, gate-off versus gate-on, on the Tour of Heroes dashboard task. This is the machinery's first real evidence and its proving ground.

## Setup

- Agent: Claude Code headless (`claude --print`) on `claude-haiku-4-5-20251001` (Haiku 4.5), the same model for the agent under test as the series specifies. CLI 2.1.260.
- Baseline confirmed present in both conditions: both MCP servers attach in headless mode (verified: `mcp__angular-cli__*` and the full `mcp__spartan-ui__*` tool set, including `spartan_components_get` and `spartan_components_list`), plus the spartan skill and Angular's `CLAUDE.md`.
- The one variable: gate-on layers `harness/gate/gate-on.settings.json`, registering the PostToolUse sealing hook. Nothing else moves.
- Drift counted by the independent structural counter (`@angular/compiler` engine), which shares no code with the gate.
- Each trial branches off substrate `db8555f`, builds on its own `run/` branch, and is recorded in `experiments/<condition>/<runId>/`.

## Results

| Trial | raw-control | class-on-primitive | style-attribute | hlmInput | hlm-card | turns | cost | time |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gate-off t1 | 1 | 0 | 0 | no | no | 24 | $0.161 | 100s |
| gate-off t2 | 1 | 0 | 0 | no | no | 23 | $0.205 | 102s |
| gate-off t3 | 1 | 0 | 0 | no | no | 20 | $0.142 | 86s |
| gate-on t1 | 0 | 0 | 0 | yes | no | 39 | $0.324 | 161s |
| gate-on t2 | 0 | 0 | 0 | yes | yes | 42 | $0.263 | 162s |
| gate-on t3 | 0 | 0 | 0 | yes | no | 29 | $0.183 | 103s |

The counted metric separates cleanly: gate-off 1/1/1, gate-on 0/0/0. But that number tells only the input's story, and the input is not the interesting part.

## Finding 1: sealing forces the primitive where a raw equivalent exists

The one rule that fired in this feature is `no-raw-control`, on the search box's `<input>`. Gate-off shipped a raw `<input>` in all three trials (0/3 used `hlmInput`). Gate-on adopted `hlmInput` in all three (3/3), because the PostToolUse hook blocked the edit and the agent fixed it. Where the gate can point at a raw element that a primitive covers, it reliably forces adoption. That is the keystone claim, validated on the one primitive this feature exercises.

## Finding 2: the blind spot, and the gate getting routed around

The dominant drift is not the input. It is that the agent builds the hero cards by hand, a `<div class="hero-card">`, rather than composing from `hlm-card`. That drift survives in almost every trial and the counter barely registers it:

- Gate-off (3/3): zero spartan primitives at all. Cards are `<a>` or `<div>` with inline Tailwind utility classes. The counter flags none of it: `<a>` is a legitimate element, and the classes sit on non-primitive elements (class-on-container is deferred to Part 2).
- Gate-on (2/3): `hlmInput` adopted, but the cards are still hand-rolled `<div>`s. To satisfy the gate the agent did not adopt `hlm-card`; it relocated its styling from inline Tailwind (which the gate would catch) into a component `styles: []` block with semantic classes and design tokens (`var(--border)`, `var(--primary)`). The gate does not inspect component stylesheets, so the counter reports 0. This is the gate being routed around, not obeyed.
- Gate-on (1/3, t2): one trial voluntarily used `hlm-card`. The gate cannot force this, because there is no raw "card" element to flag, so card adoption was luck, not enforcement.

So the honest reading of "1 to 0" is: the gate forces the one primitive it can see a raw equivalent for, and does nothing about wholesale vocabulary avoidance, because a card built from a `<div>` is invisible to all three sealing rules. Of the three rules, only `no-raw-control` ever fired; `class-on-primitive` and `style-attribute` never triggered, because the agent kept classes on containers and never used an inline `style=` attribute. This dashboard feature stresses exactly one of the three rules.

There is a silver lining worth stating fairly: gate-on's output, forced off inline Tailwind, moved toward component stylesheets that use the design tokens. That is more disciplined than gate-off's raw utility spray, even though it is not primitive composition.

## The tradeoff, measured

Gate-on cost more: roughly 1.7x the turns (avg ~37 versus ~22) and about 1.6x the cost and wall-clock, the agent iterating against the hook to fix the input. Enforcement is not free, and here is the number.

## Where the harness stands in for something, and where it flatters

Per the protocol, stated plainly: the counter faithfully measures the Part 1 spec, and the Part 1 spec only seals primitives that are used. It therefore under-counts the real drift, which is that the agent avoids the vocabulary entirely. That under-count flatters both conditions (the baseline looks less bad than it is) and it is the honest boundary of what "sealing" buys at Part 1. It is also the motivation for the rest of the series: layout as a grammar (Part 2) is what would make the `<div class="hero-card">` a nameable violation, and component shape (Part 3) is what would force composition.

## Instrument calibration done during this run (honest record)

Three real bugs were found and fixed while running, not swept under:

- The driver passed the prompt as a positional after `--mcp-config`, a variadic flag, which swallowed the prompt as a config path; the agent never ran and the driver recorded an all-zero tally as if clean. Fixed: prompt on stdin, and the driver now marks a trial VOID (non-zero exit) on an errored or empty-diff run so a null run can never masquerade as zero drift.
- Haiku in print mode sometimes plan-and-quits: it answered with a design and exited `success` without editing files (3 of the first 6 trials). Fixed with an execution-order task prompt (implement by editing files and build; do not reply with only a plan). The same prompt is used in both conditions, so it does not bias the comparison. VOID detection remains part of the protocol as a backstop.

## Caveats

- N = 3 per condition, and the counted signal is a single rule (`no-raw-control`). A feature with buttons and heavier primitive use would exercise the other two rules; this one does not.
- Run branches (`run/<runId>`) are local artifacts on the build machine; the portable record of each change is `diff.patch` inside each trial's folder.
- Substrate for trial gate-off t1 and the rest is `db8555f`; the agent's inputs are identical across all six (the driver script differences do not enter the agent's task).

## The design question this run puts on the table

The gate forces `hlmInput` and does nothing about the hand-rolled `<div>` cards. That is either the honest boundary of Part 1 (seal the primitives, and let Part 2's layout grammar and Part 3's component shape catch the rest) or a gap to close now with a fourth rule, something like "no raw structural element where a block primitive exists" (a `<div>` doing a card's job). Deciding that is the next call, and it is a spec decision, not a code one.

Decision: own the boundary (option a). No fourth rule is added at Part 1. The residue is left for Part 2's layout grammar and Part 3's component shape, and it is recorded as the deliberate boundary in `harness/sealing-spec.md`. This run's div-card residue becomes the motivating example the later Parts point back to.
