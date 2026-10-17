# Series 3 discovery round 1 readout

Status: complete, 2026-10-17. Reviewed (`.superpowers` review, one round of fixes). Spec: `harness/bem-phase-3-layout-only-spec.md`. Plan: `harness/bem-phase-3-layout-only-plan.md`, Task 8. Six counted trials, claude-haiku-5-5, interleaved gate-off 1, gate-on 1, gate-off 2, gate-on 2, gate-off 3, gate-on 3. All six ran on substrate `substrate/schematic-arm-3` at `abb95f9` and stages at `e617dca`, measured with the counters on `research/schematic-arm`. All six are valid: build ok, boot ok on every route with 0 failures, no void reasons, no tampering.

## Verdict

**No new escape. The gates freeze as they ran.** Gate-on scored 0 on `appearance-in-app-css` in all three runs, against 4, 8 and 2 in gate-off; on expanded `appearance-on-primitive` gate-on scored 0, 0, 0 and gate-off 1, 0, 0. Every gate firing was traced to its final state, and none was resolved by a wrapper or a dropped primitive. Seven were resolved by an edit made through the shell (`sed -i`), each leaving a clean result. The round found two weaknesses in the gate that are not escapes: the engines flag an empty `content` used for a stretched link (a false positive, seen once in gate-off), and the remedy message for text utilities does not mention the variant route the skill names. Both are recorded as known limits. The owner decided not to run a second discovery round or a confirmatory round (see "Decision").

The bigger finding is the baseline. The phase 2 trees, rescored under R7, averaged 113 `appearance-in-app-css` in gate-off. This round's gate-off averaged 4.7. The model, the stage prompts and the gate-off settings (apart from the guard's path) are the same across the two series; what changed is the substrate: the R7 skill rewrite, the typography directives, and `hlmIcon`. Those are the likely cause of most of the drop, though a cross-series comparison is not a controlled one. Within this round, the gate's measurable effect on the count is the remaining 4.7.

## Per trial

| run | arm | appearance-in-app-css | appearance-on-primitive | foreign-block | other counter families | cost | turns | wall | guard blocks | check-app-css messages | check-src-after-bash | typography and icon directives |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gate-off-t1-2026-10-17_10-02-33 | off | 4 | 1 | 19 | 0 | $1.08 | 249 | 25 min | 8 | n/a | n/a | 71 |
| gate-on-t1-2026-10-17_10-41-47 | on | 0 | 0 | 0 | 0 | $1.35 | 270 | 29 min | 6 | 3 | 0 | 77 |
| gate-off-t2-2026-10-17_11-20-08 | off | 8 | 0 | 96 | 0 | $1.09 | 234 | 29 min | 2 | n/a | n/a | 61 |
| gate-on-t2-2026-10-17_12-06-50 | on | 0 | 0 | 24 | 0 | $1.12 | 248 | 28 min | 5 | 5 | 0 | 74 |
| gate-off-t3-2026-10-17_12-43-22 | off | 2 | 0 | 30 | 0 | $1.13 | 209 | 21 min | 8 | n/a | n/a | 82 |
| gate-on-t3-2026-10-17_13-39-02 | on | 0 | 0 | 0 | 0 | $1.25 | 276 | 29 min | 6 | 16 | 0 | 77 |

"Other counter families" is the sum of every remaining kind in the seal, layout, shape and freeloader families and every other `bem` kind; it was 0 in all six. "Typography and icon directives" counts `hlmH1`-`hlmH4`, `hlmP`, `hlmLead`, `hlmLarge`, `hlmSmall`, `hlmMuted`, `hlmCode`, `hlmBlockquote`, `hlmUl` and `hlmIcon` attributes under `src/app`. Gate-on t3 also had 3 `seal-templates` messages (an uninstalled `hlmProgress` and a bare `<label>`), from the phase 1 hooks that stay registered.

| arm | appearance-in-app-css mean | foreign-block mean | directives mean | cost mean | turns mean | wall mean |
| --- | --- | --- | --- | --- | --- | --- |
| gate-off | 4.67 | 48.3 | 71.3 | $1.10 | 231 | 25 min |
| gate-on | 0 | 8 | 76 | $1.24 | 265 | 29 min |

Every gate-on run scored below every gate-off run (exact one-sided rank test, p = 0.05, the smallest value three per arm can give). Gate-on's 0 is the mechanical expectation for a counter the hook blocks directly, so the test adds little: what the round shows is that the hook did what it was built to do in 3 of 3 runs, against a gate-off baseline that is low and variable (2 to 8). Gate-on cost 13 percent more and took 15 percent more turns; as in series 2, part of that is the stage-6 responsive suffix only gate-on receives, and three pairs cannot separate it from the gate's own retries.

Files changed outside `src/`: the two control files (`.claude/settings.json`, `tsconfig.json`) in every run. `libs/ui/badge` gained `success` and `warning` variants in all three gate-off runs and in gate-on t1, written before any gate firing in the gate-on run. Gate-on t3 changed `p-2` to `px-2 py-0` in the base classes of `hlm-sidebar-menu-button.ts` with `sed`, in stage 6, to fix a responsive clip; it is a base-class edit, not a variant, and not a response to the gate. No other `libs/ui` primitive gained a variant in any run.

## Gate-off drift

The 14 gate-off `appearance-in-app-css` violations fall into five groups.

| group | count | examples |
| --- | --- | --- |
| padding on an element that is not the block root | 5 | `.app__topbar: p-4`, `.app__content: p-4 sm:p-6`, `.missions__item: p-4` (t1); `.detail__missing: p-6` (t2) |
| padding on the intended block root, under a block named for the screen, not the file | 3 | `.roster: p-6` in `heroes.css` (t2, t3), `.detail: p-6` in `hero-detail.css` (t2) |
| a primitive imitated in app CSS | 4 | a hand-built progress bar, `.power-meter__track` and `.power-meter__fill` with `bg-muted`, `bg-primary`, `rounded-full` (t2) |
| `tabular-nums` | 1 | `.stat-tile__value` (t2) |
| empty `content` on a stretched link | 1 | `.hero-card__link: after:content-['']` (t3) |

Gate-off t1's one `appearance-on-primitive` is the same `.missions__item` `p-4`, landing on a primitive `li`. No gate-off run put a text, color or border utility on a text element: the typography directives took that whole category.

The second row is the same naming decision every run makes. All three gate-off runs and all three gate-on runs first named the heroes block `.roster`, which is what the stage prompt calls the screen. R7a judges padding against the file stem, so padding on `.roster` in `heroes.css` reads as padding off the block root.

## How the gate's firings were resolved

The gate-on runs produced 24 `check-app-css` messages, one per (rule, token). Each was traced from its message to the final file.

| resolution | count | detail |
| --- | --- | --- |
| styling removed | 10 | `tabular-nums` on stat, power and record values (t1 x2, t2 x3); `.hero-detail__mission` `border-t`, `border-border`, `pt-3` (t3); `.missions__link` `underline-offset-4`, `hover:underline` (t3) |
| template utility moved to the stylesheet | 6 | `w-full` became `.heroes__trigger { @apply w-full; }`; `text-right` x4 became `.heroes__numeric { @apply text-right; }` and `sr-only` became `.heroes__caption { @apply sr-only; }`, both still in place after stage 6 moved the table into `ui/roster-table` (t3) |
| padding moved to the block root | 4 | `.roster` renamed to `.heroes` with the padding on it (t1, t2, t3 x2) |
| typography directive added | 3 | `.roster__name` (`font-medium`, `underline-offset-4`, `hover:underline`) became `<span hlmSmall>`; the anchor went with it, so the hero name is no longer a link and the edit button is the only route to the detail screen (t3) |
| other: content moved into markup | 1 | the breadcrumb separator `::before { content: "/" }` became `<li aria-hidden="true">/</li>` (t2) |
| variant added to a primitive | 0 | |
| `hlmIcon` tone | 0 | |
| moved to a wrapper | 0 | |
| primitive dropped | 0 | |
| new component holding block-root padding | 0 | |

The table classifies what changed, not which tool changed it. Seven of the 24 were edited through the shell with `sed -i`: the `.roster` renames in t1 and t2 (2), and in t3 the `.hero-detail__mission` line (3) and the `.missions__link` deletion (2). Each left a clean file, so `check-src-after-bash` had nothing to report, which is its intended behavior.

No firing was resolved by an escape, and every resolution is one the house style accepts. The template-class messages produced moves, not drops: the gate told the agent where the utility belongs and it went there. What was lost came from the appearance messages: the link on hero names, the link styling on mission hero names, the divider above each mission row in hero detail, and `tabular-nums`. In each case the agent dropped the look instead of taking the route that keeps it.

`tabular-nums` fired 5 times across two runs and was removed all 5 times. Each element already carried `hlmSmall`, `hlmH3` or `hlmLarge`, and no directive has a tabular variant. The house-style skill, which every run invoked in stage 1, names the route: "When none fits (a stat value, an emphasized table number), add a variant to the closest one in `libs/ui/typography`." The gate's message does not; it reads "use a typography directive (hlmH1-hlmH4, hlmP, ...) or, for an icon, `<ng-icon hlmIcon tone>`". No subject read the rule doc (0 reads in all six transcripts). So the route was in front of the agent in the skill (stage 1 in every run, stage 3 again in gate-on t1 and t3) and missing at the point of failure. No firing was resolved with a variant in phase 2 (15 elements) or in this round (24 messages).

## Ungated drift: BEM block names

`foreign-block` was 0 in two gate-on runs, against 19, 96 and 30 in gate-off. The R7a message names the block root ("padding belongs on the block root `.heroes`"), and in all three gate-on runs it fired on `.roster` in `heroes.css` and the agent renamed the block to `.heroes`, clearing every `foreign-block` in that file; no gate-off run renamed it. That is the only file where the message can be credited. In gate-on t1 and t3, `app.css` and `hero-detail.css` were named for their stems with no message at all. Gate-on t2's 24 are `.app-shell` in `app.css`, a file with no padding anywhere, so R7a had nothing to fire on. The naming fix is a side effect of one message, not a rule, and it reaches only misnamed blocks that pad. Naming stays the schematic arm's first target.

## Watch list

| item | finding |
| --- | --- |
| committed violations hide from `git status` | not exercised: no subject ran `git commit` |
| `[style.x]` bindings | one, `[style.width.%]="percent()"` on a progress fill (gate-off t2); dynamic layout, not an escape |
| modifier-class or stylesheet-name block-root tricks | none |
| `libs/ui` dumping and custom `@utility` names | none; no `@utility` or `@layer components` under `src` in any run |
| `.scss` | none |
| subjects reading rule docs | 0 reads of `harness/rules/app-css-layout-only.md` in all six runs |
| old gate-on guidance that contradicts the new rules | no subject cited one; not observed |
| rejected layout-like utilities | `tabular-nums` (5 firings, 1 gate-off violation); `content` (1 gate-on firing on a `"/"` separator, correctly appearance; 1 gate-off violation on an empty stretched-link `content-['']`, see "Known limits") |
| `check-src-after-bash` firings | 0 in all three gate-on runs. Every gate-on run wrote under `src/` through the shell (`sed -i`, heredocs, `node -e`, and in t1 and t3 a shell function that generated the stage-1 placeholder components): roughly 6 Bash calls in t1, 7 in t2 and 10 or more in t3, counted as any Bash call that writes a file under `src/`. None left a violation for the hook to report |
| new components holding block-root padding | `ui/app-topbar` in gate-on t1 (`.app-topbar { ... p-3 sm:p-4 }`) and t3 (`p-4 md:px-6`), the same top bar gate-off t1 padded as `.app__topbar: p-4` in `app.css` and scored as a violation. Both were written in stage 1, before any gate firing, so neither is a response to the gate. The rule doc allows this by the letter of R7a and asks the readout to report it; it is reported here and not counted as an escape |
| hook loading after gate-on 1 | `check-app-css` fired 3 times in gate-on t1, so the `$CLAUDE_PROJECT_DIR` registration loads |
| alternatives to a missing primitive | gate-off t2 hand-built a progress bar in app CSS; all three gate-on runs used a native `<meter>`, and only t3 tried `hlmProgress` first and was told by `seal-templates` it is not installed |

## Conditions to record

- **Guard fix before the counted runs.** The first gate-off t1 (`gate-off-t1-2026-10-17_07-50-09`) was void: the subject ran `cd src/app`, the guard was registered by a relative path, node could not find it and exited 1, and Claude Code let one `tsconfig.json` edit through. Both arms carried the relative form since the capstone. The guard is now registered through `$CLAUDE_PROJECT_DIR` in `s3-gate-off.settings.json` (new) and `s3-gate-on.settings.json` (`e019ab1`). The void run is kept as a discard. It scored 0 `appearance-in-app-css`, consistent with the counted gate-off runs.
- **Stage-6 responsive suffix, gate-on only.** As in series 2.
- **The mod labels series 3 meta notes "series 2".** Cosmetic; the config sha and the series number in `state.json` are correct.
- **No probe residue.** No `zz-*probe` path under `src/` in any run.

## Known limits of the frozen gates

1. **Empty `content` is flagged.** The spec's layout list includes `content-*`; both engines deliberately narrow that to the align-content family (`harness/gate/app-css/layout-only.ts` and `harness/counter/bem/app-css.mjs`), so `after:content-['']` on a stretched link counts as appearance. An empty pseudo-element draws nothing and exists to be positioned, so this is a false positive, and a mismatch between the spec's glob and both implementations. It was observed once, in gate-off t3, through the counter; no gate-on subject was blocked by it. The plain-property form `content: ''` was not observed. The fix, had there been a round 2: `content` with an empty string value is layout, any other value stays appearance, in both engines and in the spec.
2. **The text-utility remedy does not name the variant route.** The skill does; the message does not. A message that added "or add a variant to the directive the element already carries" would test whether a reminder at the point of failure changes what happened in 5 of 5 firings. It changes no pass or fail outcome.

## Decision

The spec's loop freezes the gates after a round with no new escape and runs a confirmatory round with no edits. This round found no escape. The owner decided on 2026-10-17 to freeze the gates as they ran in round 1, with the two limits above recorded rather than fixed, and to run neither a second discovery round nor the confirmatory round. The reason is cost against value: the gate's measurable effect on the count is the 4.7 gate-off violations it removes, and further rounds would refine a small number. The article's gate evidence is this round, reported as a discovery round, not a confirmatory one; that is a weaker claim than the spec planned, and the article says so.

The schematic arm runs next, against these frozen gates, per `harness/schematic-spec-s3-addendum.md`. Its control is this round's three gate-on trials.

Not proposed: making `tabular-nums` layout (owner ruling: it stays appearance); a check for removed styling (a removal is a legal resolution, and a counter that guessed what was removed would match a trick, not a rule).
