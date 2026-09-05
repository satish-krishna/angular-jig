#!/usr/bin/env node
// The capstone run driver.
//
// Runs ONE capstone trial: check out the substrate on a fresh branch, drive the
// Hero Ops Console build through a fixed SEQUENCE of headless Haiku subagents
// under one condition (gate-off or gate-on), commit the result, count the drift
// with every independent counter, render and audit the result, and write the
// per-subagent cost ledger and the tallies into experiments/capstone/.
//
// Why a sequence of subagents rather than the single call Parts 1 through 5
// used: those measured one screen. The capstone is four routed screens, a
// persistent shell, twelve primitives, ViewModels, a schema form and a theme
// switcher. One headless run at that size does not produce a conformance
// target. So the build is decomposed into stages (see capstone-stages.mjs),
// each its own `claude --model haiku` process, and each stage's cost, turn
// count and duration is read from its own result JSON. The run total is a sum
// of measured numbers, never an estimate.
//
// The decomposition is IDENTICAL across conditions: same stage list, same
// prompt files, same order, all read from capstone-stages.mjs. The only things
// that move between gate-off and gate-on are the settings file (which hooks are
// registered) and the fixed responsive suffix appended to the final stage, per
// the soft-gate asymmetry Part 5 disclosed.
//
// Usage:
//   node harness/driver/run-capstone.mjs --condition gate-off --trial 1
//   node harness/driver/run-capstone.mjs --condition gate-on  --trial 1
//   node harness/driver/run-capstone.mjs --condition gate-off --trial 0 --dry-run
//   node harness/driver/run-capstone.mjs --condition gate-off --trial 1 --stages 1,2

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, unlinkSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { tally } from '../counter/counter.mjs';
import { layoutTally } from '../counter/layout-counter.mjs';
import { tally as shapeTally } from '../counter/component-shape-counter.mjs';
import { tally as freeloaderTally } from '../counter/freeloader-counter.mjs';
import { setStrictTemplatesOption } from '../counter/strict-template-check.mjs';
import { STAGES, RESPONSIVE_SUFFIX, AUDIT_ROUTES, AUDIT_ANCHOR } from './capstone-stages.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..');
// The ref each trial branches from. Overridable with --substrate, which exists
// because the capstone found four stages reading a previous trial's impl out of
// experiments/ - including a gate-on trial seeded from a gate-off one. A hook
// can police that; a substrate that simply does not contain experiments/ removes
// it. Structural beats policed, so runs now branch from a clean ref.
const DEFAULT_SUBSTRATE = 'main';

// The agent under test is Haiku, always. The capstone measures Haiku's drift;
// changing this invalidates every number the run produces. Everything that
// BUILDS or GRADES the harness runs on a capable model instead, and none of
// that happens in here. Do not change this constant.
const MODEL = 'haiku';

const SETTINGS = {
  'gate-off': 'harness/gate/capstone-gate-off.settings.json',
  'gate-on': 'harness/gate/capstone-gate-on.settings.json',
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
    else if (a === '--stages') out.stages = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--substrate') out.substrate = argv[++i];
    // Overrides the settings file for this condition. A clean substrate carries
    // a neutrally-named gate settings file rather than one called 'capstone',
    // because a file name is part of what the agent can see.
    else if (a === '--settings') out.settingsOverride = argv[++i];
    else throw new Error(`unknown arg: ${a}`);
  }
  if (!SETTINGS[out.condition]) throw new Error("--condition must be 'gate-off' or 'gate-on'");
  if (out.trial === undefined) throw new Error('--trial <n> is required');
  if (out.stages) {
    const want = new Set(out.stages.split(',').map((s) => Number(s.trim())));
    out.stageList = STAGES.filter((s) => want.has(s.n));
    if (out.stageList.length !== want.size) throw new Error(`--stages names an unknown stage: ${out.stages}`);
  } else {
    out.stageList = STAGES;
  }
  out.substrate = out.substrate ?? DEFAULT_SUBSTRATE;
  return out;
}

function stamp() {
  return new Date().toISOString().replaceAll(/[:.]/g, '-').replace('T', '_').slice(0, 19);
}

// Run ONE stage as its own headless Haiku process, and return everything its
// result JSON knows about what it cost. This is the unit of cost accounting:
// every subagent in the build gets a row, and the run total is their sum.
function runStage(stage, { settingsPath, condition, logPath }) {
  let prompt = readFileSync(join(here, 'capstone', stage.promptFile), 'utf8');
  // The Part 5 soft responsive gate: gate-on appends a fixed instruction to the
  // final stage. This is the ONLY prompt difference between the conditions, and
  // it is applied here rather than in a second set of prompt files so the two
  // conditions provably read the same bytes everywhere else.
  if (stage.responsiveGate && condition === 'gate-on') prompt += RESPONSIVE_SUFFIX;

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

  const startedAt = Date.now();
  let stdout = '';
  let exitCode = 0;
  try {
    // The prompt goes on stdin, NOT as a trailing positional: --mcp-config is a
    // variadic flag and would otherwise swallow it as another config path.
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
  const wallMs = Date.now() - startedAt;

  const record = {
    stage: stage.n,
    name: stage.name,
    promptFile: `capstone/${stage.promptFile}`,
    promptBytes: Buffer.byteLength(prompt, 'utf8'),
    responsiveGateApplied: Boolean(stage.responsiveGate && condition === 'gate-on'),
    model: { alias: MODEL, resolved: null },
    exitCode,
    isError: null,
    subtype: null,
    numTurns: null,
    costUsd: null,
    durationMs: null,
    durationApiMs: null,
    sessionId: null,
    usage: null,
    parseError: false,
    wallMs,
  };

  try {
    const parsed = JSON.parse(stdout);
    record.model.resolved = parsed.model ?? (parsed.modelUsage ? Object.keys(parsed.modelUsage)[0] : null);
    record.isError = parsed.is_error ?? null;
    record.subtype = parsed.subtype ?? null;
    record.numTurns = parsed.num_turns ?? null;
    record.costUsd = parsed.total_cost_usd ?? null;
    record.durationMs = parsed.duration_ms ?? null;
    record.durationApiMs = parsed.duration_api_ms ?? null;
    record.sessionId = parsed.session_id ?? null;
    record.usage = parsed.usage ?? null;
  } catch {
    record.parseError = true;
  }

  record.ok =
    record.exitCode === 0 && record.isError !== true && record.subtype === 'success' && !record.parseError;
  return { record, stdout };
}

// Best-effort: a stage that runs `ng serve` instead of `ng build` leaves a
// detached dev server that survives the trial, because a branch checkout does
// not reap child processes. Scoped to an `ng.js ... serve` command line that
// references ROOT, so it never touches unrelated node processes.
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

const sumOf = (rows, key) => rows.reduce((acc, r) => (typeof r[key] === 'number' ? acc + r[key] : acc), 0);

// Files that define or enforce the constitution. The agent under test must
// never modify any of them, and until the capstone nothing checked.
//
// Two of three gate-on trials edited stylelint.config.mjs to widen a rule that
// was blocking them (adding 'light'/'dark' to ignoreValues so `color-scheme:
// light` would pass). It was not malice: the rule had a genuine false positive,
// since `color-scheme` is not a color, and that has now been fixed at the
// source. But the tally still reported raw-css-literal as 0 for those trials,
// and part of that zero was the agent widening the rule rather than obeying it.
//
// A gate the subject can edit is not a gate, and a measurement that cannot
// detect its own instrument being adjusted is not a measurement. Any run that
// touches these paths is tampered and its enforcement counts are void.
// Kept in sync with PROTECTED in .claude/hooks/protect-enforcement.mjs. That
// hook is the cheap first line; THIS is the authority, because it reads the git
// tree after the fact rather than scanning the agent's command text, and no
// shell trick talks its way past a diff.
const ENFORCEMENT_PATHS = [
  'stylelint.config.mjs',
  'eslint.config.mjs',
  'harness/',
  '.claude/hooks/',
  '.claude/skills/',
  '.claude/settings.json',
  '.claude/settings.local.json',
  '.agents/skills/',
  'components.json',
  'package.json',
  'tsconfig.json',
  'tsconfig.app.json',
  '.mcp.json',
];

function findTamperedFiles(changedFiles) {
  return changedFiles.filter((f) => ENFORCEMENT_PATHS.some((p) => f === p || f.startsWith(p)));
}

// tsconfig.json is protected AND the driver edits it itself: setStrictTemplates
// writes strictTemplates as an experimental control, and does it by round-tripping
// the file through JSON.stringify, which reformats every line. The first re-run
// duly flagged the harness for tampering with itself and voided a perfectly good
// trial.
//
// So the comparison is against the file as the DRIVER left it, not against the
// substrate. Byte-identical to the post-control snapshot means the agent never
// touched it; anything else is real and stays flagged. The alternative was to
// drop tsconfig.json from the protected set, which would have traded a false
// positive for a false negative on a file that controls strictTemplates.
function tsconfigUntouchedSinceControl(snapshot) {
  if (snapshot === null) return false;
  try {
    return readFileSync(join(ROOT, 'tsconfig.json'), 'utf8') === snapshot;
  } catch {
    return false;
  }
}

function main() {
  const { condition, trial, dryRun, stageList, substrate, settingsOverride } = parseArgs(process.argv.slice(2));
  const settingsPath = settingsOverride ?? SETTINGS[condition];

  const startBranch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const dirty = git(['status', '--porcelain'])
    .split('\n')
    .filter((l) => l.trim() && !l.slice(3).startsWith('experiments/'))
    .join('\n');
  if (dirty) {
    throw new Error(`working tree is not clean outside experiments/; commit or stash before a trial.\n${dirty}`);
  }

  const substrateSha = git(['rev-parse', substrate]);
  const runId = `capstone-${condition}-t${trial}-${stamp()}${dryRun ? '-dry' : ''}`;
  const branch = `run/capstone-${runId}`;
  const outRel = join('experiments', 'capstone', condition, runId);
  const outDir = join(ROOT, outRel);
  const logPath = join(tmpdir(), `hook-firings-${runId}.jsonl`);

  const stageRecords = [];
  const stageOutputs = {};
  let hookFirings = '';
  let tallyResult;
  let layoutResult;
  let shapeResult;
  let freeloaderResult;
  let responsiveByRoute = null;
  let responsiveOutTmp = null;
  let buildOk = null;
  let bootResult = null;
  let tsconfigAfterControl = null;
  let changedFiles = [];
  let tampered = [];
  let diff = '';
  let resultSha = substrateSha;

  try {
    git(['checkout', '-b', branch, substrateSha]);
    // strictTemplates is on in BOTH conditions: it is a tsconfig property of the
    // substrate the agent inherits, not a hook we register. See the settings
    // files and capstone-spec.md.
    if (!dryRun) {
      setStrictTemplatesOption(true);
      // Snapshot the file as the control left it, so the tamper check can tell
      // the driver's own edit apart from the agent's.
      try {
        tsconfigAfterControl = readFileSync(join(ROOT, 'tsconfig.json'), 'utf8');
      } catch {
        tsconfigAfterControl = null;
      }
    }

    if (!dryRun) {
      writeFileSync(logPath, '');
      for (const stage of stageList) {
        process.stdout.write(`\n[run-capstone] stage ${stage.n} (${stage.name}) on ${MODEL}...\n`);
        const { record, stdout } = runStage(stage, { settingsPath, condition, logPath });
        // Hook firings accumulate across stages in one log; snapshot the running
        // count after each stage so a per-stage figure stays recoverable.
        record.hookFiringsAfter = existsSync(logPath)
          ? readFileSync(logPath, 'utf8').trim().split('\n').filter(Boolean).length
          : 0;
        stageRecords.push(record);
        stageOutputs[`stage-${stage.n}`] = stdout || '{}';
        process.stdout.write(
          `[run-capstone] stage ${stage.n}: ${record.ok ? 'ok' : 'FAILED'}  ` +
            `cost $${(record.costUsd ?? 0).toFixed(4)}  turns ${record.numTurns}  ` +
            `${Math.round(record.wallMs / 1000)}s\n`,
        );
      }
      if (existsSync(logPath)) hookFirings = readFileSync(logPath, 'utf8');
    }

    git(['add', '-A', '--', ':(exclude)experiments']);
    git(['commit', '--allow-empty', '-m', `run(capstone/${condition}): ${runId}`]);
    resultSha = git(['rev-parse', 'HEAD']);

    tallyResult = tally([join(ROOT, 'src')], { root: ROOT });
    layoutResult = layoutTally([join(ROOT, 'src')], { root: ROOT });
    shapeResult = shapeTally([join(ROOT, 'src')], { root: ROOT });
    freeloaderResult = freeloaderTally([join(ROOT, 'src')], { root: ROOT });
    diff = git(['diff', `${substrateSha}..HEAD`]);

    // Did the subject touch the instrument? Recorded, never silently tolerated.
    changedFiles = git(['diff', '--name-only', `${substrateSha}..HEAD`])
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('experiments/'));
    tampered = findTamperedFiles(changedFiles).filter(
      (f) => !(f === 'tsconfig.json' && tsconfigUntouchedSinceControl(tsconfigAfterControl)),
    );

    if (!dryRun) {
      // Plane 2. The capstone audits every screen, not one slice, and anchors on
      // body: the navigation drawer the hidden-element exemption exists for is a
      // sibling of the routed component, not a descendant of it.
      try {
        execFileSync('npm run build', { cwd: ROOT, stdio: 'inherit', shell: true });
        buildOk = true;
      } catch {
        buildOk = false;
      }
      if (buildOk) {
        // Plane 3: does the thing actually run? Measured here independently of
        // whether the agent bothered to run the gate it was told to run, exactly
        // as the responsive auditor is. This plane exists because three of the
        // four fatal defects the first capstone produced were DI failures that
        // every static gate passed and every browser catches instantly.
        try {
          execFileSync('npm run check:boot', {
            cwd: ROOT,
            stdio: ['ignore', 'inherit', 'pipe'],
            encoding: 'utf8',
            shell: true,
          });
          bootResult = { ok: true, failures: 0, detail: null };
        } catch (e) {
          const stderr = String(e.stderr ?? '').trim();
          const m = stderr.match(/Boot gate failed: (\d+) runtime error/);
          bootResult = {
            ok: false,
            failures: m ? Number(m[1]) : null,
            detail: stderr.split('\n').slice(0, 12).join('\n') || null,
          };
        }

        // The measurement code is not required to be on the substrate. A clean
        // substrate strips harness/counter, harness/driver and the specs, so the
        // agent under test never sees that it is being measured; but the
        // responsive auditor is invoked as a subprocess and therefore does need
        // to exist on disk when it runs.
        //
        // Restoring it HERE is safe and is the whole trick: this is after the
        // stages finished and after the run commit, so the file is an
        // uncommitted extra in the working tree, invisible to the agent (which
        // is gone) and absent from the recorded diff. The finally block's forced
        // checkout discards it. If the substrate already carries it, this is a
        // no-op.
        // Restored from startBranch, the ref the driver was LAUNCHED from, which
        // always carries the full harness. Restoring from the substrate would be
        // circular: the whole point is that the substrate does not have it.
        try {
          git(['checkout', startBranch, '--', 'harness/counter/responsive-auditor.mjs']);
        } catch {
          // Let the audit report its own failure rather than guessing at one.
        }

        responsiveOutTmp = join(tmpdir(), `responsive-${runId}`);
        responsiveByRoute = {};
        for (const route of AUDIT_ROUTES) {
          const slug = route.replaceAll('/', '_');
          const routeOut = join(responsiveOutTmp, slug);
          try {
            execFileSync(
              'node',
              [
                'harness/counter/responsive-auditor.mjs',
                '--dist',
                'dist/angular-jig/browser',
                '--route',
                route,
                '--anchor',
                AUDIT_ANCHOR,
                '--out',
                routeOut,
              ],
              // stderr is PIPED, not inherited, so the auditor's own message
              // lands in the run record. Inheriting it sent the render
              // assertion's text to the console and left meta.json saying only
              // "Command failed", which made "the build does not render" an
              // inference rather than a recorded fact. A published claim should
              // not rest on evidence the run threw away.
              { cwd: ROOT, stdio: ['ignore', 'inherit', 'pipe'], encoding: 'utf8' },
            );
            responsiveByRoute[route] = JSON.parse(readFileSync(join(routeOut, 'responsive-tally.json'), 'utf8'));
          } catch (e) {
            const stderr = String(e.stderr ?? '').trim();
            responsiveByRoute[route] = {
              error: String(e.message ?? e),
              // The auditor's real reason, e.g. the render assertion's
              // "page rendered no substantive content at ...".
              stderr: stderr || null,
              reason: /no substantive content/.test(stderr) ? 'build-does-not-render' : 'auditor-failed',
            };
          }
        }
      }
    }
  } finally {
    killStrayDevServers();
    try {
      git(['checkout', '--force', startBranch]);
    } catch (e) {
      process.stderr.write(`[run-capstone] WARNING: could not restore branch ${startBranch}: ${e.message}\n`);
    }
  }

  if (!tallyResult) return;
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'tally.json'), JSON.stringify(tallyResult, null, 2) + '\n');
  writeFileSync(join(outDir, 'layout-tally.json'), JSON.stringify(layoutResult, null, 2) + '\n');
  writeFileSync(join(outDir, 'shape-tally.json'), JSON.stringify(shapeResult, null, 2) + '\n');
  writeFileSync(join(outDir, 'freeloader-tally.json'), JSON.stringify(freeloaderResult, null, 2) + '\n');
  writeFileSync(join(outDir, 'diff.patch'), diff + '\n');
  if (responsiveByRoute) {
    writeFileSync(join(outDir, 'responsive-tally.json'), JSON.stringify(responsiveByRoute, null, 2) + '\n');
    if (responsiveOutTmp && existsSync(responsiveOutTmp)) {
      cpSync(responsiveOutTmp, join(outDir, 'responsive'), { recursive: true });
    }
  }
  if (!dryRun) {
    mkdirSync(join(outDir, 'agent-output'), { recursive: true });
    for (const [k, v] of Object.entries(stageOutputs)) {
      writeFileSync(join(outDir, 'agent-output', `${k}.json`), v);
    }
  }
  if (!dryRun && hookFirings.trim()) writeFileSync(join(outDir, 'hook-firings.jsonl'), hookFirings);
  try {
    if (existsSync(logPath)) unlinkSync(logPath);
  } catch {
    // temp log cleanup is best-effort
  }

  // THE COST LEDGER. One row per Haiku subagent, plus the run total. This is a
  // primary artifact of the capstone, not a footnote: the series' uniformity
  // claim is about what a uniform substrate costs to build on, and this is the
  // measurement that turns that claim from a gut feeling into a number.
  const cost = {
    model: MODEL,
    condition,
    trial: Number(trial),
    stages: stageRecords.map((r) => ({
      stage: r.stage,
      name: r.name,
      costUsd: r.costUsd,
      numTurns: r.numTurns,
      durationMs: r.durationMs,
      wallMs: r.wallMs,
      ok: r.ok,
      sessionId: r.sessionId,
    })),
    totals: {
      stages: stageRecords.length,
      costUsd: Number(sumOf(stageRecords, 'costUsd').toFixed(6)),
      numTurns: sumOf(stageRecords, 'numTurns'),
      durationMs: sumOf(stageRecords, 'durationMs'),
      wallMs: sumOf(stageRecords, 'wallMs'),
      stagesOk: stageRecords.filter((r) => r.ok).length,
    },
  };
  writeFileSync(join(outDir, 'cost.json'), JSON.stringify(cost, null, 2) + '\n');

  // A trial is void unless every stage succeeded, the tree actually changed, and
  // the result builds. A run that produced nothing is not a zero-drift result.
  // A dry run makes no edits, so an empty diff is the expected outcome there and
  // proves the plumbing rather than voiding it. Matches run-trial.mjs.
  // Tampering voids a run outright. Its enforcement counts cannot be trusted,
  // because the enforcement itself was edited by the thing being enforced.
  // A build that does not RUN is not a passing build. Plane 3 is part of the OK
  // condition rather than a side note: the first capstone shipped three builds
  // that compiled clean, rendered a blank page, and were recorded as OK.
  const runOk =
    dryRun ||
    (stageRecords.every((r) => r.ok) &&
      diff.trim() !== '' &&
      buildOk === true &&
      bootResult?.ok === true &&
      tampered.length === 0);

  const meta = {
    runId,
    part: 'capstone',
    condition,
    trial: Number(trial),
    dryRun,
    ok: runOk,
    substrate: { ref: substrate, sha: substrateSha },
    branch: dryRun ? null : branch,
    resultSha,
    model: { alias: MODEL, resolved: stageRecords.find((r) => r.model.resolved)?.model.resolved ?? null },
    gateSettings: settingsPath,
    stages: stageRecords,
    cost: cost.totals,
    buildOk,
    boot: bootResult,
    diffEmpty: diff.trim() === '',
    tampered: tampered.length > 0,
    tamperedFiles: tampered,
    changedFiles,
    // Times the PreToolUse guard blocked the agent. Note this is the ONLY way a
    // contamination attempt is visible: `experiments/` is protected against
    // READS (the capstone found four stages copying a previous trial's impl,
    // one of them across conditions), and a read changes no files, so the
    // tamper diff above is structurally blind to it. A non-zero count here
    // means the agent reached for something it should not have and was stopped.
    guardBlocks: hookFirings
      .split('\n')
      .filter((l) => l.includes('protect-enforcement')).length,
    hookFirings: hookFirings.trim() ? hookFirings.trim().split('\n').length : 0,
    counterTotals: {
      seal: tallyResult.totals,
      layout: layoutResult.totals,
      shape: shapeResult.totals,
      freeloader: freeloaderResult.totals,
    },
    responsive: responsiveByRoute
      ? Object.fromEntries(Object.entries(responsiveByRoute).map(([r, t]) => [r, t.totals ?? t]))
      : null,
    auditAnchor: AUDIT_ANCHOR,
    auditRoutes: AUDIT_ROUTES,
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
    `\n[run-capstone] ${runId}  ${runOk ? 'OK' : 'VOID'}\n` +
      `  branch:  ${dryRun ? '(deleted, dry run)' : branch}\n` +
      `  stages:  ${cost.totals.stagesOk}/${cost.totals.stages} ok\n` +
      `  cost:    $${cost.totals.costUsd.toFixed(4)} across ${cost.totals.stages} haiku subagents, ` +
      `${cost.totals.numTurns} turns, ${Math.round(cost.totals.wallMs / 1000)}s wall\n` +
      `  build:   ${buildOk === null ? '(skipped)' : buildOk ? 'ok' : 'FAILED'}\n` +
      `  boot:    ${
        bootResult === null
          ? '(skipped)'
          : bootResult.ok
            ? 'ok'
            : `FAILED (${bootResult.failures ?? '?'} runtime error(s))`
      }\n` +
      (tampered.length ? `  TAMPER:  run edited enforcement config: ${tampered.join(', ')}\n` : '') +
      `  seal:    ${JSON.stringify(tallyResult.totals)}\n` +
      `  layout:  ${JSON.stringify(layoutResult.totals)}\n` +
      `  shape:   ${JSON.stringify(shapeResult.totals)}\n` +
      `  freeload:${JSON.stringify(freeloaderResult.totals)}\n` +
      (responsiveByRoute
        ? `  respons: ${JSON.stringify(
            Object.fromEntries(Object.entries(responsiveByRoute).map(([r, t]) => [r, t.totals?.all ?? 'err'])),
          )}\n`
        : '') +
      `  output:  ${outRel.replaceAll('\\', '/')}/\n`,
  );

  if (!runOk) {
    process.stderr.write(
      `[run-capstone] VOID: stages ok ${cost.totals.stagesOk}/${cost.totals.stages}, ` +
        `diffEmpty ${diff.trim() === ''}, buildOk ${buildOk}. This is not a zero-drift result.\n`,
    );
    process.exitCode = 1;
  }
}

main();
