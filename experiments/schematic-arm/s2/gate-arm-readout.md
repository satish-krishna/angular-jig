# Series 2 gate-arm readout

Status: complete, 2026-10-16. Spec: `harness/bem-phase-2-gate-spec.md`. Six counted trials, claude-haiku-5-5, interleaved gate-off 1, gate-on 1, gate-off 2, gate-on 2, gate-off 3, gate-on 3. All six ran on substrate `substrate/schematic-arm-2` at `2f1ea45` and stages at `e617dca`, measured with the counters on `research/schematic-arm` in expanded mode. All six are valid: build ok, boot ok on every route with 0 failures, no void reasons, no measurement errors, no tampering.

## Verdict

**Partial effect.** The gate took expanded `appearance-on-primitive` from a gate-off mean of 4.33 to a gate-on mean of 0. The spec's "works" bar needs gate-on at most 1 (met) and gate-off at least 5 (missed: 4.33). Its "does not work" bar is gate-on above half of gate-off, 2.17 (not met). By the falsifier as written, the result is a partial effect, and it is reported as one. The only clause that failed is the baseline's: the drift the gate polices is real but varies from 1 to 7 per counted run (11 and 13 in the two pilots, which are not counted).

Every gate-on violation was resolved, but none by the remedy the skill and the rule doc both name. See "How the gate's firings were resolved" below: the count of 0 overstates what the gate delivered.

## Per trial

| run | arm | appearance-on-primitive | bem foreign-block | bem template-utility-class | layout / shape / freeloader | cost | turns | wall | guard blocks | gate firings (elements) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gate-off-t1-2026-10-16_18-52-50 | off | 7 | 45 | 62 | 0 / 0 / 0 | $1.15 | 226 | 25 min | 6 | n/a |
| gate-on-t1-2026-10-16_19-25-51 | on | 0 | 52 | 0 | 0 / 0 / 0 | $1.16 | 259 | 42 min | 8 | 6 |
| gate-off-t2-2026-10-16_20-13-33 | off | 1 | 43 | 0 | 0 / 0 / 0 | $1.17 | 224 | 22 min | 7 | n/a |
| gate-on-t2-2026-10-16_20-48-54 | on | 0 | 30 | 0 | 0 / 0 / 0 | $1.17 | 252 | 26 min | 9 | 3 |
| gate-off-t3-2026-10-16_21-26-13 | off | 5 | 158 | 0 | 0 / 0 / 0 | $1.12 | 213 | 26 min | 5 | n/a |
| gate-on-t3-2026-10-16_22-08-24 | on | 0 | 35 | 0 | 0 / 0 / 0 | $1.24 | 257 | 30 min | 6 | 6 |

| arm | appearance-on-primitive mean | cost mean | turns mean | wall mean |
| --- | --- | --- | --- | --- |
| gate-off | 4.33 | $1.15 | 221 | 24 min |
| gate-on | 0 | $1.19 | 256 | 33 min |

Gate-on cost 4 percent more and took 16 percent more turns. Part of that is the stage-6 responsive suffix (below), which only gate-on receives; three pairs cannot separate it from the gate's own retries.

Files changed outside `src/`: the two control files (`.claude/settings.json`, `tsconfig.json`) in every run; `libs/ui/badge` in five of six runs (success and warning variants, both arms); `libs/ui/sidebar/.../hlm-sidebar-menu-button.ts` in gate-on t3 (`h-8` to `min-h-8` in the base sizes, made in stage 6 to fix a responsive clip, not in response to the gate).

## Gate-off drift

The 13 gate-off violations sit in the same few places in every run: `py-8` on empty-state table cells, `font-semibold` or `font-medium` on table cells, `px-2`/`p-2` on the sidebar header, `text-sm`/`text-base` on card parts. How many a run gets depends mostly on which primitives it chooses to compose: gate-off t2 built its roster without `hlmTd` cells, and scored 1.

## How the gate's firings were resolved

The hook fired on 15 distinct elements across the three gate-on runs. Each was traced from the firing message to the final file.

| resolution | count | examples |
| --- | --- | --- |
| appearance removed; the primitive's default accepted | 7 | `.heroes__power` and `.heroes__empty` deleted from bare `hlmTd` cells (t2); `pt-4` dropped from `.hero-detail__panel` on `hlmTabsContent` (t1, t3); `.stat-tile__label` removed from `hlmCardDescription` (t3) |
| class moved onto a new wrapper inside the primitive | 6 | `.app__brand` moved from the `hlmSidebarHeader` div to an inner div (t1); `.roster__power` and `.dashboard__power` moved from `hlmTd` to an inner span (t1, t3) |
| primitive directive removed, styling kept | 2 | `<p hlmCardDescription class="stat-tile__label">` became a plain `<p>` with `text-sm font-medium text-muted-foreground` (t2); `hlmCardFooter` dropped from `.roster__footer` (t1) |
| variant added to the primitive in `libs/ui` | 0 | |

The gate checks that no primitive receives appearance from the app, and the agent met that check in three ways, two of which the house style does not want. A wrapper with its own padding inside a primitive is the same drift one element lower, where the rule cannot see it; some wrappers are legitimate (a bold span inside a cell is content styling, not a restyled cell). Dropping the primitive directive is worse than the violation it replaced: the app now imitates the primitive's look instead of using its API, and the counter scores it as clean.

The skill and the rule doc both name the remedy (add a variant on the primitive in `libs/ui`). In 15 firings it was never used. The badge variants that appeared were written before any firing and appeared equally in gate-off.

## Ungated drift: BEM block names

`foreign-block` fired in all six runs, in both arms: a component's BEM block named after the screen's role rather than the file stem (`.roster` in `heroes`, `.detail` in `hero-detail`, `.shell` and `.app-brand` in `app`). The counter counts each class, so a run's foreign-block total measures how many classes one naming decision touched, not how many decisions went wrong: gate-off t3's 158 is three decisions. Gate-off t1 also has 62 raw Tailwind utilities in `app.html`, written by stage 1 (which did not open the house-style skill in this run or in either pilot) and left in place by stage 6. Neither kind is gated in this phase, and the difference between arms on them is not attributed to the gate. Both are what the schematic arm targets: a generator names the block from the file and starts the template empty.

## Conditions to record

- **Stage-6 responsive suffix, gate-on only.** Gate-on's stage 6 is told to make `check:boot` and `check:responsive` pass; gate-off's is not. This is the series 1 setup and was kept for comparability. It adds turns to gate-on and is the source of the gate-on t3 sidebar edit.
- **Stage-1 prompt fixed before the counted trials.** The first gate-off attempt (`gate-off-t1-2026-10-16_17-21-01`) was void: the stage-1 prompt listed six routes without missions while the boot check audits `/missions`, and only gate-on is told to make the boot check pass. The prompt was fixed (`e617dca`, one line) and that run kept as a pre-series discard. Stage text now differs from series 1 by that line.
- **No stage asks for a full missions screen.** Some runs build it out and some leave less, so screens per run vary, and that variance passes directly into violation counts.
- **Shell writes bypass the hook.** Gate-on t1 stage 1 rewrote `app.html` and `app.css` with a Python heredoc, which no PostToolUse hook on the file tools sees. The counter scores the final files, so nothing escaped measurement, but the gate is only as strong as the agent's choice of tool.
- **No probe residue.** No `zz-*probe` path exists under `src/` in any run.
- **Hook loading confirmed.** The applied-appearance hook fired in all three gate-on runs, so the `$CLAUDE_PROJECT_DIR` registration loads in the subject's own session.

## What this means for the thesis

"Gates police the fill" holds for the count: with the gate, no appearance utility reached a primitive in three runs. It does not yet hold for the intent behind the rule: the agent never reached for the primitive's API, and in 2 of 15 cases it escaped the rule by removing the primitive. A gate that judges what lands on a primitive also needs to judge what stops being one: a follow-up check that flags a primitive directive removed from an element that keeps appearance classes would close the hole this series found. That is a design change for a later phase, not a change to these results.
