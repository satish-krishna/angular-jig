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
import { mkdirSync, writeFileSync, readFileSync, existsSync, unlinkSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { tally } from '../counter/counter.mjs';
import { layoutTally } from '../counter/layout-counter.mjs';
import { tally as shapeTally } from '../counter/component-shape-counter.mjs';
import { tally as freeloaderTally } from '../counter/freeloader-counter.mjs';
import { strictTemplateCheck, setStrictTemplatesOption } from '../counter/strict-template-check.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..');
const SUBSTRATE = 'main';
const MODEL = 'haiku';

// Which settings each Part layers per condition. The cumulative model: by Part 2
// the Part 1 sealing hook is baseline (on in both conditions), and the Part being
// measured adds its own hook only in gate-on. Each file fully lists its hooks, so
// this never depends on settings-merge behavior.
const SETTINGS = {
  1: { 'gate-off': null, 'gate-on': 'harness/gate/gate-on.settings.json' },
  2: {
    'gate-off': 'harness/gate/part2-gate-off.settings.json',
    'gate-on': 'harness/gate/part2-gate-on.settings.json',
  },
  3: {
    'gate-off': 'harness/gate/part3-gate-off.settings.json',
    'gate-on': 'harness/gate/part3-gate-on.settings.json',
    'gate-on-guided': 'harness/gate/part3-gate-on-guided.settings.json',
  },
  4: {
    'gate-off': 'harness/gate/part4-gate-off.settings.json',
    'gate-on': 'harness/gate/part4-gate-on.settings.json',
  },
  5: {
    'gate-off': 'harness/gate/part5-gate-off.settings.json',
    'gate-on': 'harness/gate/part5-gate-on.settings.json',
  },
};

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', ...opts }).trim();
}

// Like git(), but does not trim: for reading file contents verbatim.
function gitRaw(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function parseArgs(argv) {
  const out = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--condition') out.condition = argv[++i];
    else if (a === '--trial') out.trial = argv[++i];
    else if (a === '--part') out.part = argv[++i];
    else if (a === '--task') out.task = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else throw new Error(`unknown arg: ${a}`);
  }
  if (!['gate-off', 'gate-on', 'gate-on-guided'].includes(out.condition)) {
    throw new Error("--condition must be 'gate-off', 'gate-on', or 'gate-on-guided'");
  }
  if (out.trial === undefined) throw new Error('--trial <n> is required');
  out.part = out.part ? Number(out.part) : 1;
  out.task = out.task ?? 'dashboard';
  if (!SETTINGS[out.part]) {
    throw new Error(`--part must be one of: ${Object.keys(SETTINGS).join(', ')}`);
  }
  return out;
}

function stamp() {
  return new Date().toISOString().replaceAll(/[:.]/g, '-').replace('T', '_').slice(0, 19);
}

function runAgent(settingsPath, promptFile, logPath) {
  const prompt = readFileSync(join(here, promptFile), 'utf8');
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
  if (settingsPath) args.push('--settings', settingsPath);

  // The prompt goes on stdin, NOT as a trailing positional: --mcp-config is a
  // variadic flag and would otherwise swallow the prompt as another config path.
  let stdout = '';
  let exitCode = 0;
  try {
    stdout = execFileSync('claude', args, {
      cwd: ROOT,
      input: prompt,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'inherit'],
      env: { ...process.env, HOOK_LOG: logPath },
    });
  } catch (err) {
    stdout = err.stdout ?? '';
    exitCode = err.status ?? 1;
  }
  return { stdout, exitCode, argsUsed: args };
}

// Best-effort: an agent that runs `ng serve` instead of `ng build` leaves a
// detached dev server that survives the trial, because a branch checkout does not
// reap child processes. Kill any Angular dev server for THIS repo. Scoped to an
// `ng.js ... serve` command line that references ROOT, so it never touches
// unrelated node (a tsserver, another project's server). Wrapped so it can never
// fail a trial.
function killStrayDevServers() {
  try {
    if (process.platform === 'win32') {
      const ps =
        `Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ` +
        `Where-Object { $_.CommandLine -like '*ng.js*' -and $_.CommandLine -like '*serve*' -and $_.CommandLine -like '*${ROOT}*' } | ` +
        `ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`;
      execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', ps], { stdio: 'ignore' });
    } else {
      execFileSync('pkill', ['-f', `${ROOT}.*ng.*serve`], { stdio: 'ignore' });
    }
  } catch {
    // best-effort cleanup; never fail a trial over it
  }
}

function main() {
  const { condition, trial, dryRun, part, task } = parseArgs(process.argv.slice(2));
  const settingsPath = SETTINGS[part][condition];
  let promptFile = task === 'dashboard' ? 'task-prompt.md' : `task-prompt-${task}.md`;
  // Part 5 soft gate: the single variable is the prompt. gate-on runs the
  // responsive-instructed variant; gate-off runs the plain detail-form prompt.
  if (part === 5) {
    if (task !== 'detail-form') throw new Error('Part 5 measures the detail-form slice; pass --task detail-form');
    if (condition === 'gate-on') promptFile = 'task-prompt-detail-form-responsive.md';
  }

  const startBranch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  // The driver's own experiment output accumulates in experiments/ and must not
  // block the next trial; everything else must be committed first.
  const dirty = git(['status', '--porcelain'])
    .split('\n')
    .filter((l) => l.trim() && !l.slice(3).startsWith('experiments/'))
    .join('\n');
  if (dirty) {
    throw new Error(
      `working tree is not clean outside experiments/; commit or stash before a trial.\n${dirty}`,
    );
  }

  const substrateSha = git(['rev-parse', SUBSTRATE]);
  const runId = `${task}-${condition}-t${trial}-${stamp()}${dryRun ? '-dry' : ''}`;
  const branch = `run/p${part}-${runId}`;
  const outRel = join('experiments', `part${part}`, task, condition, runId);
  const outDir = join(ROOT, outRel);
  const logPath = join(tmpdir(), `hook-firings-${runId}.jsonl`);

  let agent = { stdout: '', exitCode: 0, argsUsed: [], skipped: true };
  let hookFirings = '';
  let modelUsed = null;
  let tallyResult;
  let layoutResult;
  let shapeResult;
  let freeloaderResult;
  let strictResult = null;
  let responsiveResult = null;
  let responsiveOutTmp = null;
  let diff = '';
  let resultSha = substrateSha;

  try {
    git(['checkout', '-b', branch, substrateSha]);

    // Part 4 gate-on: put the tree into strictTemplates before the agent builds,
    // so its own `ng build` fails on a template type error and it must fix it.
    if (part === 4 && condition === 'gate-on' && !dryRun) setStrictTemplatesOption(true);
    // Part 5 keeps Part 4's strictTemplates freeloader on in both conditions
    // (cumulative baseline), so the single variable stays the responsive prompt.
    if (part === 5 && !dryRun) setStrictTemplatesOption(true);

    if (!dryRun) {
      writeFileSync(logPath, '');
      agent = { ...runAgent(settingsPath, promptFile, logPath), skipped: false };
      if (existsSync(logPath)) hookFirings = readFileSync(logPath, 'utf8');
      try {
        const parsed = JSON.parse(agent.stdout);
        modelUsed =
          parsed.model ??
          (parsed.modelUsage ? Object.keys(parsed.modelUsage)[0] : null);
        agent.isError = parsed.is_error ?? null;
        agent.subtype = parsed.subtype ?? null;
        agent.numTurns = parsed.num_turns ?? null;
        agent.costUsd = parsed.total_cost_usd ?? null;
        agent.durationMs = parsed.duration_ms ?? null;
      } catch {
        modelUsed = null;
        agent.parseError = true;
      }
    }

    // Commit whatever the agent produced (allow-empty so a dry run still
    // records). Exclude experiments/ so prior trials' records, which ride along
    // as untracked files on the working tree, never leak into a run commit.
    git(['add', '-A', '--', ':(exclude)experiments']);
    git(['commit', '--allow-empty', '-m', `run(${condition}): ${runId}`]);
    resultSha = git(['rev-parse', 'HEAD']);

    // Count drift with the independent engine, on the run branch's working tree
    // where the agent's edits live, then capture the diff. Both are held in
    // memory across the branch switch below.
    tallyResult = tally([join(ROOT, 'src')], { root: ROOT });
    layoutResult = layoutTally([join(ROOT, 'src')], { root: ROOT });
    shapeResult = shapeTally([join(ROOT, 'src')], { root: ROOT });
    freeloaderResult = freeloaderTally([join(ROOT, 'src')], { root: ROOT });
    // The strictTemplates freeloader is audited by the compiler, and only for
    // Part 4 (it runs a build, so it is not free). Restores tsconfig afterward.
    if (part === 4 && !dryRun) strictResult = strictTemplateCheck({ restore: true });
    diff = git(['diff', `${substrateSha}..HEAD`]);

    // Part 5, Plane 2: measure responsive drift with the independent Playwright
    // auditor, on the run branch's built tree. Written to a temp dir, folded into
    // the evidence folder below (mirrors how hook-firings is staged in tmp).
    if (part === 5 && !dryRun) {
      execFileSync('npm run build', { cwd: ROOT, stdio: 'inherit', shell: true });
      responsiveOutTmp = join(tmpdir(), `responsive-${runId}`);
      execFileSync('node', [
        'harness/counter/responsive-auditor.mjs',
        '--dist', 'dist/angular-jig/browser',
        '--route', 'detail/11',
        '--out', responsiveOutTmp,
      ], { cwd: ROOT, stdio: 'inherit' });
      responsiveResult = JSON.parse(readFileSync(join(responsiveOutTmp, 'responsive-tally.json'), 'utf8'));
    }
  } finally {
    // Reap any dev server the agent spawned (it should not, per the task prompt),
    // then always return to where we started, even if the trial threw.
    killStrayDevServers();
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
  writeFileSync(join(outDir, 'layout-tally.json'), JSON.stringify(layoutResult, null, 2) + '\n');
  writeFileSync(join(outDir, 'shape-tally.json'), JSON.stringify(shapeResult, null, 2) + '\n');
  writeFileSync(join(outDir, 'freeloader-tally.json'), JSON.stringify(freeloaderResult, null, 2) + '\n');
  if (strictResult) writeFileSync(join(outDir, 'strict-tally.json'), JSON.stringify(strictResult, null, 2) + '\n');
  if (responsiveResult) {
    writeFileSync(join(outDir, 'responsive-tally.json'), JSON.stringify(responsiveResult, null, 2) + '\n');
    if (responsiveOutTmp && existsSync(responsiveOutTmp)) {
      cpSync(responsiveOutTmp, join(outDir, 'responsive'), { recursive: true });
    }
  }
  writeFileSync(join(outDir, 'diff.patch'), diff + '\n');
  if (!dryRun) writeFileSync(join(outDir, 'claude-output.json'), agent.stdout || '{}');
  if (!dryRun && hookFirings.trim()) writeFileSync(join(outDir, 'hook-firings.jsonl'), hookFirings);
  try {
    if (existsSync(logPath)) unlinkSync(logPath);
  } catch {
    // temp log cleanup is best-effort
  }

  // A real trial that changed nothing, errored, or produced no parseable result
  // is void, not zero-drift. Never let a null run masquerade as clean evidence.
  const agentOk =
    dryRun ||
    (agent.exitCode === 0 &&
      agent.isError !== true &&
      agent.subtype === 'success' &&
      !agent.parseError &&
      diff.trim() !== '');

  const meta = {
    runId,
    part,
    task,
    promptFile,
    condition,
    trial: Number(trial),
    dryRun,
    ok: agentOk,
    substrate: { ref: SUBSTRATE, sha: substrateSha },
    branch: dryRun ? null : branch,
    resultSha,
    model: { alias: MODEL, resolved: modelUsed },
    gateSettings: settingsPath,
    agent: {
      skipped: agent.skipped,
      exitCode: agent.exitCode,
      isError: agent.isError ?? null,
      subtype: agent.subtype ?? null,
      numTurns: agent.numTurns ?? null,
      costUsd: agent.costUsd ?? null,
      durationMs: agent.durationMs ?? null,
      parseError: agent.parseError ?? false,
      argsUsed: agent.argsUsed,
    },
    diffEmpty: diff.trim() === '',
    hookFirings: hookFirings.trim() ? hookFirings.trim().split('\n').length : 0,
    counterTotals: {
      seal: tallyResult.totals,
      layout: layoutResult.totals,
      shape: shapeResult.totals,
      freeloader: freeloaderResult.totals,
    },
    strictTemplates: strictResult,
    responsive: responsiveResult ? responsiveResult.totals : null,
    startedFromBranch: startBranch,
    finishedAt: new Date().toISOString(),
  };
  writeFileSync(join(outDir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');

  // Save the actual built files so a reader can open the real implementation,
  // not just apply the patch. The substrate is the "before"; this is the "after".
  if (!dryRun) {
    const changed = git(['diff', '--name-only', `${substrateSha}..${resultSha}`])
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('experiments/'));
    for (const f of changed) {
      let content;
      try {
        content = gitRaw(['show', `${resultSha}:${f}`]);
      } catch {
        continue;
      }
      const dest = join(outDir, 'impl', f);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, content);
    }
  }

  if (dryRun) git(['branch', '-D', branch]);

  process.stdout.write(
    `\n[run-trial] part ${part} ${runId}  ${agentOk ? 'OK' : 'VOID'}\n` +
      `  branch:  ${dryRun ? '(deleted, dry run)' : branch}\n` +
      `  seal:    ${JSON.stringify(tallyResult.totals)}\n` +
      `  layout:  ${JSON.stringify(layoutResult.totals)}\n` +
      `  shape:   ${JSON.stringify(shapeResult.totals)}\n` +
      `  freeload:${JSON.stringify(freeloaderResult.totals)}\n` +
      (strictResult ? `  strict:  ${JSON.stringify(strictResult)}\n` : '') +
      (responsiveResult ? `  respons: ${JSON.stringify(responsiveResult.totals)}\n` : '') +
      `  output:  ${outRel.replaceAll('\\', '/')}/\n`,
  );

  if (!agentOk) {
    process.stderr.write(
      `[run-trial] VOID: the agent did not produce a valid build ` +
        `(exit ${agent.exitCode}, isError ${agent.isError}, subtype ${agent.subtype}, ` +
        `diffEmpty ${diff.trim() === ''}). This is not a zero-drift result.\n`,
    );
    process.exitCode = 1;
  }
}

main();
