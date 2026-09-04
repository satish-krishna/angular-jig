# Experiments

Evidence for the Angular Blueprint series, produced by the run driver (`../harness/driver/run-trial.mjs`). Each Part's claim is proved by running a Haiku coding agent under two conditions, gate-off and gate-on, identical in every variable except the sealing hook, and counting the drift with the independent structural counter.

## How a trial runs

```
node harness/driver/run-trial.mjs --condition gate-off --trial 1
node harness/driver/run-trial.mjs --condition gate-on  --trial 1
```

A trial checks out the substrate (`main`) on a fresh branch `run/<runId>`, runs `claude --print --model haiku` with the fixed task prompt (`../harness/driver/task-prompt.md`), commits the agent's work on that branch, counts drift on `src`, and writes the record here. The run branch is left in place as the diff artifact; the evidence files are written to the starting branch and left uncommitted for review before they land in history.

Gate-on differs from gate-off in exactly one way: it layers `../harness/gate/gate-on.settings.json` via `claude --settings`, registering the PostToolUse sealing hook. The baseline (both MCP servers, the spartan skill, Angular's `CLAUDE.md`) is present in both.

A dry run proves the plumbing without spending tokens (skips the agent, deletes its throwaway branch):

```
node harness/driver/run-trial.mjs --condition gate-off --trial 0 --dry-run
```

## Layout

```
experiments/<condition>/<runId>/
  meta.json            run metadata: substrate sha, branch, model resolved, agent exit, counter totals
  tally.json           the independent counter's drift tally on the agent's src
  diff.patch           git diff substrate..result, the whole change the agent made
  claude-output.json   the raw --output-format json result (real runs only)
```

## The protocol (from the playbook)

- **The proving Part (Part 1) runs three trials per condition** and reports the spread, because a single agent run is a coin flip. Later Parts drop to one trial per condition and cite Part 1's spread.
- **Drift is counted by the counter, never by the gate.** If drift were whatever the gate flags, the gate would reduce it to zero by construction and prove nothing. The counter is a separate engine; that independence is the whole point.
- **The counter self-test** (run twice on the same diff, identical tally) is a different claim from the trials: it proves the measurement does not wander, while the three trials prove the drift reduction is real across the agent's variance.
- **Never assert a reduction that was not run.** The report is the two outcomes and the diff between them: the drift the baseline shipped, what the gate caught and when, and the residue it still let through.

## Before the first real run

Confirm the resolved Haiku model id (it lands in `meta.json` as `model.resolved`) and that both MCP servers actually attach in headless mode. Run one gate-off trial first and read `claude-output.json` and `diff.patch` to confirm the agent built the screen and the plumbing captured it, before committing to three trials per condition.
