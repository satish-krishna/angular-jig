# The measurement harness

The rig that proves each Part's claim by running a Haiku coding agent under two conditions, gate-off and gate-on, and counting the drift with machinery that is independent of the gate. This directory is the machinery; per-run evidence lands in `../experiments/`.

Part 1 (the closed set) is built here: the sealing gate and the independent structural counter, both encoding one written spec.

## The single spec

`sealing-spec.md` is the contract. Two engines encode it, on purpose, sharing no code:

- The **gate** parses templates with angular-eslint and reports violations as lint errors (`gate/`).
- The **counter** parses templates with Angular's own compiler (`@angular/compiler`) and tallies violations as JSON (`counter/`).

If the two ever disagree on the same input, that disagreement is a finding, not a rounding error: one encoding is wrong and the spec arbitrates. The gate test asserts the two agree on the shared dirty fixture, so a drift between them fails the suite.

Why two engines: the experiment's sharpest objection is circularity. If drift is whatever the gate flags, the gate reduces it to zero by construction and proves nothing. So drift is counted by an audit the gate does not touch. That independence is load-bearing. Do not let the counter import gate code or vice versa.

## The counter

`counter/counter.mjs` is a standalone ES module. It reads `.html` templates directly and extracts inline `template:` strings from `.ts` components with the TypeScript compiler API, walks the Angular AST, and emits the tally shape defined in the spec.

```
node harness/counter/counter.mjs --root . src        # tally the app, repo-relative paths
node harness/counter/counter.mjs <file-or-dir>...     # tally specific files or dirs
npm run count                                          # the src tally, the shortcut
```

The tally is deterministic: violations are ordered by file, then line, then kind, so the same input always serializes byte-identically. The self-test (`counter/counter.test.mjs`) runs the counter twice over the same input and asserts identical output. That proves the measurement does not wander, which is separate from proving the drift reduction is real (the agent trials do that).

## The gate

`gate/index.mjs` is an eslint plugin, `seal`, with three custom template rules, one per spec kind:

- `seal/no-raw-control` -> `raw-control`
- `seal/no-class-on-primitive` -> `class-on-primitive`
- `seal/no-style-attribute` -> `style-attribute`

`../eslint.config.mjs` wires them to `.html` files and to inline templates in `.ts` components (via angular-eslint's processor). It sets `noInlineConfig: true`, so `eslint-disable` comments have no effect: a rule with a suppression dial is not a rule. There is no escape hatch, by design.

```
npm run lint         # run the gate over the app (src)
```

The intentionally-dirty fixtures under `counter/fixtures/` are outside this scope on purpose, so the substrate stays green; the gate tests lint them by explicit path.

## The edit-time hook, and the gate-off / gate-on toggle

`../.claude/hooks/seal-templates.mjs` is a PostToolUse hook. When the agent edits a template-bearing file under `src/`, it runs the gate on that file and, on any violation, exits 2 with a corrective message the agent sees and acts on.

The hook is committed but NOT registered in `../.claude/settings.json`. That is deliberate. Registering it is the single variable the experiment moves:

- **gate-off** (the baseline): the substrate as committed. The hook script is present but dormant.
- **gate-on**: the run driver adds the hook by passing `gate/gate-on.settings.json` via `claude -p --settings harness/gate/gate-on.settings.json`.

Everything else (the spartan skill, both MCP servers, Angular's `CLAUDE.md`) is identical in both conditions. Only the hook registration differs.

## Corrective messages hand back the fix

A gate rejection is the highest-salience teaching moment the agent gets, so it does not just name the violation, it shows the documented right pattern. Part 3's `gate-on-guided` A/B measured this: with the same rules and only the exit-2 message changed from a prose reminder to the signal-forms worked example, the agent's use of the house forms pattern went from 0 of 3 to 3 of 3 (see `../experiments/part3/detail-form/gate-on-guided`). So the convention, and the default for any new hook (Parts 4-6 included):

- The exit-2 message ends with the documented good/bad shape, or a short worked example, drawn from the docs the gate mechanizes, never new guidance invented at the gate.
- Shared worked examples live in a module beside the hooks (for example `../.claude/hooks/shape-guidance.mjs`), imported by every hook that needs them, so the message and the doc never drift.
- Tailor the example to what fired: the forms worked example is appended only when a forms rule trips, while a subscribe or change-detection violation carries its own one-line fix from the rule message.

Hooks also record their firings for the run record: when `HOOK_LOG` is set (the driver sets it per run), each hook appends a JSON line via `../.claude/hooks/_hook-log.mjs`, and the driver folds the file into `../experiments/.../hook-firings.jsonl` with a count in `meta.json`. Off-harness, during an ordinary edit, `HOOK_LOG` is unset and logging is a no-op. This is what makes "the gate fired, and what it said" a recorded fact rather than an inference.

## Running the harness self-tests

```
npm run test:harness
```

This runs the counter tests and the gate tests under a vitest config (`vitest.config.mjs`) separate from the Angular app's test target, so harness machinery never mixes into `ng test`.

## What is deferred, on purpose

- **Layout `<div>` abuse** is not counted at Part 1. It only becomes decidable once Part 2 defines the layout grammar, so the counter and gate flag class strings on primitives but not on plain containers. See the deferral section in `sealing-spec.md`.
- **The run driver** is built: `driver/run-trial.mjs` checks out the substrate on a fresh branch, runs the Haiku agent under one condition, commits, counts with all three counters, and writes the run record (including `hook-firings.jsonl`) to `../experiments/`.
- **Plane 2 (Playwright responsive checks)** and **Plane 3 (the Haiku aesthetic reviewer)** arrive with Parts 5 and 6.
