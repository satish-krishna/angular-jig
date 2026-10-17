# Series 5 schematic readout

Status: complete, 2026-10-17. Spec: `harness/schematic-spec.md`, amended by `harness/schematic-spec-s3-addendum.md` (Decisions A to G; the bar is Decision D, the prescribed generator is Decision G). Plan: `harness/schematic-g-plan.md`. Three measured trials, claude-haiku-5-5, on substrate `substrate/schematic-arm-4` at `a745bb3` and stages at `e617dca`, with the schematic stage prompts, gate settings and config frozen after the clean discovery trial. All three are valid: build ok, boot ok on every route with 0 failures, no void reasons, no tampering, and every prompt, config and gate-settings sha256 matches the discovery trial. The control is series 3 round 1's three gate-on trials (`experiments/schematic-arm/s3/round-1-readout.md`).

## Verdict

**Footnote. Bar 1 (cost) fails by $0.02; bars 2 and 3 hold.** The schematic arm's mean cost was $1.01 against a bar of $0.99 (80 percent of gate-on's $1.24); it came in at 81 percent. Three trials with a spread of $0.31 cannot tell $1.01 from $0.99, and that is the reason the bar was fixed before any result: a line that moves when a result lands two cents on the wrong side is not a line. The same spread leaves the $0.23 gap between the arms uncertain too: the cheapest gate-on run ($1.12) cost less than the most expensive schematic run ($1.14). Under Decision D, any failed bar makes the schematic a footnote to a gates article, and this readout says which one failed.

| bar | gate-on round 1 | schematic series 5 | result |
| --- | --- | --- | --- |
| 1. mean cost, stage 0 included, at most $0.99 | $1.35, $1.12, $1.25, mean $1.24 | $1.05, $0.83, $1.14, mean $1.01 | fail |
| 2. mean `appearance-in-app-css` at most 0, mean `foreign-block` at most 8 | 0 and 8 | 0 and 0 | pass |
| 3. entity, form and manage all generated from the approved spec in at least 2 of 3 trials | n/a | 3 of 3 | pass |

Bar 2 passes, but the gap on `foreign-block` is not the generator's. Gate-on's mean of 8 is one run: gate-on t2 scored 24, all on `.app-shell` in `app.css`, and t1 and t3 scored 0. `app.css` is the shell, which the generator never writes. Three schematic runs at 0 against two of three gate-on runs at 0 is no evidence of a drift difference.

Bar 3 measures compliance, not discovery, because the stage prompts prescribe the command (Decision G5). It shows the routing works when the prompts name the generator: every stage that was told to run it ran it, with the approved spec, and nothing generator-owned was written by hand.

What the series does show is where the cost goes. Stages 2, 4 and 5, where the mod's prompts run the generator, fell from a gate-on mean of $0.37 to $0.19; the saving belongs to prompt and generator together, since Decision G changed both. Stage 6, which runs the mod's prompt over the generated files, fell by $0.17. The shell and dashboard stages, which the generator does not reach, are 47 percent of the schematic arm's cost, and the dashboard stage got more expensive (see "Cost by stage").

The owner's response to this result is Decision H in the addendum: token cost no longer separates the arms, and the question that matters for enterprise use is uniformity. That is a new hypothesis with its own bar, computed on these same six trials and labeled exploratory (H4); it does not change this verdict. Only the confirmatory series in H5 would test it on fresh evidence.

## Per trial

| run | role | cost | turns | wall | `appearance-in-app-css` | `foreign-block` | other counter families | guard blocks | responsive | review | preserved shape | generated share |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| schematic-t1-2026-10-17_19-01-38 | discovery, excluded | $1.05 | 267 | 36 min | 0 | 0 | 0 | 15 | 18 | 0.66 min, 0 edits | 96.2% | 35.4% |
| schematic-t1-2026-10-17_19-59-48 | measured 1 | $1.05 | 233 | 30 min | 0 | 0 | 0 | 12 | 18 | 0.46 min, 0 edits | 96.8% | 40.7% |
| schematic-t2-2026-10-17_20-39-40 | measured 2 | $0.83 | 177 | 21 min | 0 | 0 | 0 | 3 | 18 | 2.51 min, 2 edits | 95.0% | 40.4% |
| schematic-t3-2026-10-17_21-13-27 | measured 3 | $1.14 | 234 | 29 min | 0 | 0 | 0 | 9 | 0 | 4.06 min, 4 edits | 95.9% | 40.0% |

The discovery trial shares the `schematic-t1` label with measured trial 1 and is excluded by run ID. "Other counter families" is the sum of every remaining kind in the seal, layout, shape, freeloader and bem families. "Responsive" is the sum over the dashboard, roster and detail screens; every 18 is the same finding, 6 per screen: the sidebar menu link at 1280px, 34px of content in a 32px box. Measured trial 3 fixed it by editing the base classes of `hlm-sidebar-menu-button.ts`, the same edit gate-on t3 made in round 1. "Preserved shape" is the share of generated lines still matching the generator's output at the end of the run (Decision G5). "Generated share" is the generated files' final line count over all app lines, an upper bound.

| arm | cost mean | turns mean | wall mean | guard blocks mean | app lines mean |
| --- | --- | --- | --- | --- | --- |
| gate-on (round 1) | $1.24 | 265 | 29 min | 5.7 | 2332 |
| schematic (measured) | $1.01 | 215 | 27 min | 8.0 | 2697 |

The schematic apps are 16 percent larger. The generated slice carries a view-model spec (150 to 166 lines) and a service spec (about 60), roughly 210 of the 365-line gap; no gate-on run wrote a spec for its roster view model. The rest of the gap is not broken down.

## Cost by stage

Means over three trials per arm.

| stage | gate-on cost | gate-on turns | schematic cost | schematic turns | prompt in the schematic arm |
| --- | --- | --- | --- | --- | --- |
| 0 spec | n/a | n/a | $0.02 | 9 | mod |
| 1 shell | $0.29 | 47 | $0.26 | 46 | capstone |
| 2 domain | $0.02 | 15 | $0.01 | 10 | mod, `--kinds entity` |
| 3 dashboard | $0.08 | 46 | $0.21 | 38 | capstone |
| 4 roster | $0.10 | 28 | $0.07 | 31 | mod, `--kinds form,manage` |
| 5 detail | $0.25 | 34 | $0.12 | 26 | mod, `--kinds form` (no change) |
| 6 integrate | $0.50 | 96 | $0.33 | 56 | mod, edit generated files in place |

The generated stages (2, 4 and 5) fell by $0.18 together. Stage 6 fell by $0.17, with 40 fewer turns. Stage 3 rose by $0.12 on fewer turns, so each turn cost more. The prompt is the same capstone prompt in both arms; the code it builds on, the substrate (`a745bb3` against `abb95f9`) and the gate settings are not. The cause is not established, and token counts alone do not account for it: cache reads rose 1.4 to 1.8 times while cost rose 2.5 times, and measured 2 spent $0.23 in 22 turns with no Write. Stage 1 is the same prompt on a nearly identical substrate and differs by noise.

Measured trial 3's stage 4 took 52 turns: after running the generator it rebuilt the generated roster against the build spec's roster diagram, adding an avatar cell to the name column and moving the Recruit link onto the filter row. The generator's manage screen does not match the build spec's roster layout, and the agent closed the gap by hand, in place, as the prompt allows. Preserved shape stayed at 95.9 percent because the measure counts surviving generated lines, so added code never lowers it; about 8 of the 34 lines lost from the view model are the generator's create-dialog path, which `createRoute` leaves without a caller (see "Preserved shape").

## The schematic measurements

**Reached.** In all three measured trials and the discovery trial: stage 2 ran `ng g slice --spec specs/hero.json --kinds entity` and created 5 files; stage 4 ran `--kinds form,manage` and created 8, replacing the marked placeholder and keeping the `roster` route; stage 5 ran `--kinds form` and created nothing, because the form already existed and every file was byte-identical. `reached.via` is `created` for every kind in every trial. `specDrift.offSpecRuns`, `otherSpecsWritten` and `approvedSpecChanged` are empty or false in all four.

**The routing gate.** `route-to-generator` fired 0 times in all four trials. The agent never tried to write a generator-owned file by hand, so the gate had nothing to deny. That is the intended outcome, and it means the gate is unexercised by live trials; its evidence is its 21 unit tests.

**Preserved shape.** 95.0 to 96.8 percent across the measured trials. The changed lines are concentrated in `heroes.view-model.ts`, which lost 26 to 34 of its 124 to 132 lines in every run; `heroes.html` lost 3 to 10 and the view-model spec 2 to 6. Because the measure counts surviving generated lines, it sees removals and rewrites, never additions.

**A generator defect every trial hit.** With `manage.createRoute` set, which every approved spec did (`/recruit`), the generator still emits a create-dialog path: `startCreate`, the dialog and an unwired `cancel`. Nothing can reach it, because the create action is a link. In all four trials the agent removed `startCreate`, and the discovery trial, measured 1 and measured 3 named it in stage 4 as an orphaned member. The removal is a small part of the view model's lost lines (about 4 of 26 in measured 1, about 8 of 34 in measured 3); the rest is not broken down. In measured trial 2, stage 6 said why it edited instead of regenerating: the generator's badge vocabulary has no `success` or `warning`, so the spec cannot say "Active is green, Injured is amber".

**`libs/ui/badge`.** All three measured trials added `success` and `warning` variants to `hlm-badge.ts`. In round 1, all three gate-off runs and gate-on t1 did the same. The vocabulary gap belongs to the primitive library, and the generator inherits it.

## The spec review record

| run | proposed fields | kept out of the form | approve refusals | edits | what the reviewer changed |
| --- | --- | --- | --- | --- | --- |
| discovery | 7 | clearance | 0 | 0 | nothing |
| measured 1 | 10 | status, clearance, missions, successRate | 0 | 0 | nothing |
| measured 2 | 10 | status, clearance, missions, successRate | 1 | 2 | defaults for `missions` (0) and `successRate` (75), which stage 0 left off fields kept out of the form; the approve validator refused the spec until they were added |
| measured 3 | 8 | none | 1 (operator's record) | 4 | defaults for `powerClass`, `power` and `clearance`, and per-class badge variants on the class column; the validator refused the reviewer's first edit, a string default on the number field `power` |

Measured 2's refusal is recorded in its `state.json` (`spec.parses: false` with both errors). Measured 3's is not in any evidence file: the mod does not log approve refusals, and the cell comes from the operator's terminal output (`fields.3.default: Invalid input: expected number, received string`) in the session that ran the trial.

Stage 0 produced one invalid spec in three measured trials, and the validator caught it before stage 1. Measured trial 3's proposed spec was valid; its four edits were the reviewer's choices.

Stage 0 tried to validate its own spec in three of four trials and was stopped. In the discovery trial and measured 3 it ran `parseSpec` from `schematics/slice/spec-schema.cjs` through `node -e`, and in measured 1 it listed `schematics/slice`. `protect-enforcement` lets a read-only command on a protected path through only when the command is on its allowlist: `node -e` is not, and measured 1's listing was refused because `2>&1;` is not recognized as harmless redirection. Read-only `ls`, `wc` and `grep` on `schematics/` did run in measured 3. Each stage 0 that was blocked reported that it could not validate. Measured 2, the run whose spec was invalid, did not try. These stage 0 blocks are part of the schematic arm's guard-block mean (8.0 against 5.7), and gate-on has no stage 0 to produce them.

The spec also changed what the app models. In measured 1 and 2 the hero spec carries `missions` and `successRate`, and the app has no Mission or Threat entity at all: the Missions and Threats screens are view models computed from hero fields. Only measured 3 hand-wrote `mission/` and `threat/` domain folders. Every gate-on run wrote Mission and Threat models and services.

The spec varied from run to run, as specs written from prose by a model do: the class field was `heroClass` in measured 1 and `powerClass` in the others; three runs added `active`, two added `missions` and `successRate`; status variants swapped `Injured` and `Reserve` between runs; and measured 3's reviewer gave the class column per-class colors the other runs did not have. Any cross-run comparison of the generated code has to separate this spec variance from the generator's own (Decision H).

## Discovery

Two discovery trials. t0 (`schematic-t1-2026-10-17_15-39-25`, series 4, evidence at `e02dbde`) found the routing gap that Decision G closed, at $1.96. The discovery trial in this series (`schematic-t1-2026-10-17_19-01-38`, evidence at `f4fae49`) was clean on its first run: all three kinds from the approved spec, no spec copy, no moved generated file, no generator-owned file written by hand. The loop rule then froze the prompts, skill, generator and hook, and the three measured trials ran unchanged.

## Gate firings and files outside `src/`

Blocks for `protect-enforcement` and `route-to-generator`; messages for the others (one firing can carry several messages, as in round 1's `check-app-css` column).

| run | `protect-enforcement` | `check-app-css` | `check-applied-appearance` | `seal-templates` | `check-src-after-bash` | `route-to-generator` |
| --- | --- | --- | --- | --- | --- | --- |
| measured 1 | 12 | 9 | 4 | 1 | 0 | 0 |
| measured 2 | 3 | 7 | 0 | 0 | 3 | 0 |
| measured 3 | 9 | 6 | 6 | 2 | 12 | 0 |

The `protect-enforcement` blocks were shell commands or edits naming `tsconfig.json`, `package.json`, `components.json`, `harness/`, `.claude/skills/` or `schematics/`, the same pattern as round 1 plus the stage 0 blocks above. `check-src-after-bash` reported 3 messages in measured 2 and 12 in measured 3, against 0 in every round 1 gate-on run; measured 3's include `ps-9`, `text-muted-foreground` and `font-medium` on the roster search and `border`, `rounded-lg` and padding on `.dashboard__row`. Every final counter is 0, so each was resolved, but unlike round 1 these firings were not traced to their resolutions. Files changed outside `src/` and `specs/`: the two control files (`.claude/settings.json`, `tsconfig.json`) in every run, `libs/ui/badge` in all three measured runs, and `libs/ui/sidebar` in measured 3.

## Post-series list

Recorded, not applied: the system stays frozen as it ran until Decision H decides what runs next.

1. **Let stage 0 validate its spec.** It tried in three of four trials and `protect-enforcement` blocked it. Either expose the parser as an npm script and add it to `protect-enforcement`'s allowlist (which names its npm scripts explicitly), or have the mod run it after stage 0 and hand the errors back before review.
2. **`createRoute` emits dead code.** When `createRoute` is set, omit the create dialog, `startCreate` and their spec tests, and wire `cancel` to the dialog's `closed` output.
3. **`success` and `warning` badge variants.** In the primitive library and in the generator's badge vocabulary, so a status column can say what every run hand-wrote.
4. **Roster fidelity.** The manage screen should match the build spec's roster diagram (avatar cell, create action on the filter row), or the spec should be able to ask for it.
5. **Stage 3 cost.** Find out why the same dashboard prompt cost 2.5 times as much in the schematic arm.
6. **Log approve refusals.** The mod should write each refusal and its errors to the evidence folder.
7. **Generator version in the header.** Needed for catalog ownership (Decision H6): an app has to know which generator version wrote each generated TypeScript file.

## Conditions to record

- **`check:wiring` unrunnable in both arms.** `harness/counter/check-wiring.mjs` is missing from the checkout the subject sees, although the project instructions list it. Every schematic trial and every round 1 gate-on trial reported it missing, so it is a constant across arms.
- **The discovery trial shares the `schematic-t1` label** with measured trial 1 and is excluded by run ID.

## Decision

The series 5 verdict is a footnote, per Decision D, with bar 1 named as the failed bar. The owner decided on 2026-10-17 to keep that verdict as pre-registered and to test a different hypothesis, uniformity, under Decision H. The units, distance and bar are in the addendum; the detailed normalization rules (`harness/uniformity-metric-spec.md`) and the owner's confirmation of the 0.20 threshold are still to come, and both are settled before any uniformity number is computed.
