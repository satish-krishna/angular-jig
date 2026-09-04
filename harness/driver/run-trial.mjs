#!/usr/bin/env node
// The run driver (Part 1, plan item 4).
//
// Runs ONE coding trial: check out the substrate on a fresh branch, run Claude
// Code headless on Haiku with the fixed task prompt under one condition
// (gate-off or gate-on), commit the result, count the drift with the
// independent counter, and write the tally, the diff, the raw agent output, and
// a metadata record into experiments/<condition>/<runId>/.
//
// The ONLY thing that differs between conditions is the gate hook: gate-on layers
// harness/gate/gate-on.settings.json via `claude --settings`, which registers the
// PostToolUse sealing hook. The baseline (both MCP servers, the spartan skill,
// Angular's CLAUDE.md) is present in both. Substrate is `main`, because the
// counter and gate must exist on the branch to run; the hook stays dormant in
// gate-off since its settings are not layered.
//
// Usage:
//   node harness/driver/run-trial.mjs --condition gate-off --trial 1
//   node harness/driver/run-trial.mjs --condition gate-on  --trial 1
//   node harness/driver/run-trial.mjs --condition gate-off --trial 0 --dry-run
//
// --dry-run skips the agent call entirely and proves the plumbing (branch,
// counter, records, branch restore) without spending tokens.

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tally } from '../counter/counter.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..');
const SUBSTRATE = 'main';
const MODEL = 'haiku';
const GATE_ON_SETTINGS = 'harness/gate/gate-on.settings.json';

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', ...opts }).trim();
}

function parseArgs(argv) {
  const out = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--condition') out.condition = argv[++i];
    else if (a === '--trial') out.trial = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else throw new Error(`unknown arg: ${a}`);
  }
  if (out.condition !== 'gate-off' && out.condition !== 'gate-on') {
    throw new Error("--condition must be 'gate-off' or 'gate-on'");
  }
  if (out.trial === undefined) throw new Error('--trial <n> is required');
  return out;
}

function stamp() {
  return new Date().toISOString().replaceAll(/[:.]/g, '-').replace('T', '_').slice(0, 19);
}

function runAgent(condition) {
  const prompt = readFileSync(join(here, 'task-prompt.md'), 'utf8');
  const args = [
    '--print',
    '--model',
    MODEL,
    '--output-format',
    'json',
    '--permission-mode',
    'bypassPermissions',
    '--mcp-config',
    '.mcp.json',
  ];
  if (condition === 'gate-on') args.push('--settings', GATE_ON_SETTINGS);
  args.push(prompt);

  // Capture stdout even on a non-zero exit; the JSON result is the artifact.
  let stdout = '';
  let exitCode = 0;
  try {
    stdout = execFileSync('claude', args, {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'inherit'],
    });
  } catch (err) {
    stdout = err.stdout ?? '';
    exitCode = err.status ?? 1;
  }
  return { stdout, exitCode, argsUsed: args.slice(0, -1) };
}

function main() {
  const { condition, trial, dryRun } = parseArgs(process.argv.slice(2));

  const startBranch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const dirty = git(['status', '--porcelain']);
  if (dirty) {
    throw new Error(
      `working tree is not clean; commit or stash before a trial.\n${dirty}`,
    );
  }

  const substrateSha = git(['rev-parse', SUBSTRATE]);
  const runId = `${condition}-t${trial}-${stamp()}${dryRun ? '-dry' : ''}`;
  const branch = `run/${runId}`;
  const outDir = join(ROOT, 'experiments', condition, runId);

  let agent = { stdout: '', exitCode: 0, argsUsed: [], skipped: true };
  let modelUsed = null;
  let tallyResult;
  let diff = '';
  let resultSha = substrateSha;

  try {
    git(['checkout', '-b', branch, substrateSha]);

    if (!dryRun) {
      agent = { ...runAgent(condition), skipped: false };
      try {
        const parsed = JSON.parse(agent.stdout);
        modelUsed =
          parsed.model ??
          (parsed.modelUsage ? Object.keys(parsed.modelUsage)[0] : null);
      } catch {
        modelUsed = null;
      }
    }

    // Commit whatever the agent produced (allow-empty so a dry run still records).
    git(['add', '-A']);
    git(['commit', '--allow-empty', '-m', `run(${condition}): ${runId}`]);
    resultSha = git(['rev-parse', 'HEAD']);

    // Count drift with the independent engine, on the run branch's working tree
    // where the agent's edits live, then capture the diff. Both are held in
    // memory across the branch switch below.
    tallyResult = tally([join(ROOT, 'src')], { root: ROOT });
    diff = git(['diff', `${substrateSha}..HEAD`]);
  } finally {
    // Always return to where we started, even if the trial threw.
    try {
      git(['checkout', '--force', startBranch]);
    } catch (e) {
      process.stderr.write(
        `[run-trial] WARNING: could not restore branch ${startBranch}: ${e.message}\n`,
      );
    }
  }

  // Write the evidence onto the starting branch, so a branch switch never
  // disturbs it. Left uncommitted on purpose: the author reviews a run before
  // it lands in history. The run branch stays as the diff artifact (a dry run
  // deletes its throwaway branch).
  if (!tallyResult) return;
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'tally.json'), JSON.stringify(tallyResult, null, 2) + '\n');
  writeFileSync(join(outDir, 'diff.patch'), diff + '\n');
  if (!dryRun) writeFileSync(join(outDir, 'claude-output.json'), agent.stdout || '{}');

  const meta = {
    runId,
    condition,
    trial: Number(trial),
    dryRun,
    substrate: { ref: SUBSTRATE, sha: substrateSha },
    branch: dryRun ? null : branch,
    resultSha,
    model: { alias: MODEL, resolved: modelUsed },
    gateSettings: condition === 'gate-on' ? GATE_ON_SETTINGS : null,
    agent: { skipped: agent.skipped, exitCode: agent.exitCode, argsUsed: agent.argsUsed },
    counterTotals: tallyResult.totals,
    startedFromBranch: startBranch,
    finishedAt: new Date().toISOString(),
  };
  writeFileSync(join(outDir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');

  if (dryRun) git(['branch', '-D', branch]);

  process.stdout.write(
    `\n[run-trial] ${runId}\n` +
      `  branch:  ${dryRun ? '(deleted, dry run)' : branch}\n` +
      `  totals:  ${JSON.stringify(tallyResult.totals)}\n` +
      `  output:  experiments/${condition}/${runId}/\n`,
  );
}

main();
