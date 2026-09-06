# Safety-gate evidence for the rule migration

## What this document is, and what it is not

This document records the test-suite outputs saved during Task 0 (repairing the baseline) and Task 1 (migrating all 26 gate rules to TypeScript), as quoted verbatim by their implementers in `task-0-report.md` and `task-1b-report.md`. It is not a fresh test run. The suite has legitimately grown since those tasks — Task 2 added the per-rule docs and a URL test, Task 3 added the hooks and their fixes — so running `npm run test:harness` today correctly reports 143 tests across 15 suites. That number is real, but it is not the migration's evidence: it includes tests the migration never touched. The migration's evidence is that the count held steady across the migration itself, and grew only where later tasks deliberately added coverage.

## The timeline

| Point | Tests | Suites | What it shows |
|---|---|---|---|
| Before Task 0 | 103 passed | 1 failed + 12 passed | A suite silently loaded zero tests; four assertions were invisible |
| After Task 0 | 107 | 13 | The true baseline the migration is measured against |
| After Task 1 (all 26 rules migrated) | 107 | 13 | **The safety gate held** |
| After Task 2 (docs + URL test) | 134 | 14 | +27 new tests |
| After Task 3 (hooks + fixes) | 143 | 15 | +9 new tests |

The row that matters for this document is the middle one: 107 in, 107 out, across a migration that touched all 26 rule files. Nothing was added or removed from the suite by the migration itself; the count only moves at the tasks that were explicitly about adding coverage (2 and 3), not at the task that was explicitly about not changing behavior (1).

## The red baseline (before Task 0)

From `task-0-report.md`, Step 1 ("Before Output (Red Baseline)"):

```
 Test Files  1 failed | 12 passed (13)
      Tests  103 passed (103)
   Start at  09:33:21
   Duration  12.13s (transform 1.02s, setup 0ms, import 15.13s, tests 23.16s, environment 2ms)
```

The failing suite was `harness/gate/check-boot.test.mjs`, which loaded zero tests under vitest because `check-boot.mjs` began with a `#!/usr/bin/env node` shebang — a V8 syntax error once vitest wraps the module in a function. `node --check` passes on the same file, which is why the failure went unnoticed until Task 0 looked for it. Four test assertions were silently absent from every run before this point. See `docs/findings/2026-09-06-prompt-corrections.md`, item 8, for the full account.

## The repaired baseline (after Task 0)

From `task-0-report.md`, Step 4 ("After Output (Green Baseline)"):

```
 Test Files  13 passed (13)
      Tests  107 passed (107)
   Start at  09:33:46
   Duration  12.67s (transform 995ms, setup 0ms, import 16.55s, tests 30.67s, environment 2ms)
```

One line deleted (the shebang) restored the four missing assertions and turned the suite fully green. This is the true baseline: 107 tests across 13 suites. Every later comparison in this document is against this number, not the red 103.

## The post-migration gate (after Task 1)

From `task-1b-report.md`, Step 13 ("the full safety gate"):

```
$ npm run test:harness

> angular-jig@0.0.0 test:harness
> vitest run --config harness/vitest.config.mjs


 RUN  v4.1.11 D:/Repos/angular-jig


 Test Files  13 passed (13)
      Tests  107 passed (107)
   Start at  10:07:33
   Duration  12.82s (transform 1.30s, setup 0ms, import 24.77s, tests 29.95s, environment 2ms)
```

107 passed, across the same 13 suites, after all 26 rule files (15 `shape` rules plus the 11 already migrated in earlier steps) were rewritten from `.mjs` to `.ts` with `createRule`, typed `Options`/`MessageIds`, and explicit visitor-parameter types. Test count did not move. Test file count did not move.

`task-1b-report.md`, Step 13 also records the rest of the four-command safety gate passing cleanly in the same run: `npm run typecheck:harness` (`tsc -p tsconfig.harness.json --noEmit`, exit 0, no output), `npm run lint` (`eslint src`, exit 0, silent — note this only exercises the 6 rules registered in `eslint.config.mjs`; see `docs/findings/2026-09-06-prompt-corrections.md`, item 5, on why the vitest suites, not `npm run lint`, are the real migration check for the other 20), and `npm run build` (`ng build`, completing with the same three lazy chunks — `hero-detail`, `dashboard`, `heroes` — as before).

## Why "the safety gate held" is stronger than a passing number

A test count that does not move across a refactor is consistent with the refactor being a no-op with respect to behavior — but it is also consistent with tests having been quietly loosened to keep passing. This migration's evidence rules that out by a stronger method than the pass count alone: **every `countByMessageId` assertion passed unchanged, and no expectation was edited.**

Both reviewers of the migration verified this the same way: by reading the diff for each rule file and observing that every rule's `meta`/`messages` block — the messageId names, the message strings, the schema, the visitor logic — appears as **unchanged context** in the diff, never as a `+`/`-` pair. `task-1b-report.md`'s own no-behavior-change confirmation states this plainly: every change to a migrated rule file is one of an added `import`, an added `export type`/`export const RULE_NAME`, the `export default { ... }` -> `createRule<Options, MessageIds>({ ... })` wrapper plus `defaultOptions: []`, a visitor-parameter type annotation, or a type-narrowing addition (a predicate function, or an extra `.type === 'Identifier'` guard) that is a no-op at runtime. No message string changed. No messageId changed. No exported name changed.

That is stronger evidence than a passing test for a specific reason: a test suite only checks what its assertions happen to check, and a test can be made to pass by editing the expectation to match new (wrong) behavior instead of fixing the behavior to match the old (correct) expectation — a change that a test run alone cannot distinguish from a genuine fix. A diff, by contrast, cannot be doctored silently in the same way: an altered message string, a renamed messageId, or a loosened assertion shows up as a `-` line paired with a `+` line, visible to anyone who reads the diff, regardless of whether the test run itself still shows green. Verifying that the `meta`/`messages` blocks and the test expectations appear as unchanged context — not as a diff hunk — is evidence about the mechanism (nothing here was touched) rather than evidence only about the outcome (the suite still reports success). Both were checked here, and they agree.

## Confirmation: no expectation was edited

No evidence of an edited expectation was found while assembling this document. `task-1b-report.md`'s self-review section states explicitly that "no logic, message string, messageId, or exported name changed" and that this was confirmed diff-by-diff for all 15 rule files covered in that report (the remaining 11 rules were migrated in earlier steps of Task 1 and are covered by the same discipline, per the same report's scope note). This document would be the place to confess loudly if that were not so; it is not.
