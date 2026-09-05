#!/usr/bin/env node
// Reads every capstone run under experiments/capstone/ and prints the two
// tables the report needs: the drift comparison and the per-subagent cost
// ledger. Reads only what the driver wrote; it computes nothing the runs did
// not measure, so a number here can always be traced to a run's own JSON.
//
// Usage: node harness/driver/summarize-capstone.mjs [--md]

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..');
const BASE = join(ROOT, 'experiments', 'capstone');

const CONDITIONS = ['gate-off', 'gate-on'];

function loadRuns(condition) {
  const dir = join(BASE, condition);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((d) => statSync(join(dir, d)).isDirectory() && !d.endsWith('-dry'))
    .map((d) => {
      const at = (f) => {
        const p = join(dir, d, f);
        return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
      };
      return { runId: d, meta: at('meta.json'), cost: at('cost.json'), responsive: at('responsive-tally.json') };
    })
    .filter((r) => r.meta)
    // A partial run (the stage-1 probe) is not a trial and must never be
    // averaged in with complete ones: it would drag the cost mean down by
    // five sixths of a build. Full six-stage runs only.
    .filter((r) => (r.cost?.totals?.stages ?? 0) === 6)
    .sort((a, b) => a.runId.localeCompare(b.runId));
}

const num = (v) => (typeof v === 'number' ? v : 0);

// Sum a counter's per-kind totals across a condition's runs.
function driftRows(runs) {
  const acc = {};
  for (const r of runs) {
    for (const [engine, totals] of Object.entries(r.meta.counterTotals ?? {})) {
      for (const [kind, n] of Object.entries(totals)) {
        if (kind === 'all') continue;
        acc[`${engine}/${kind}`] ??= [];
        acc[`${engine}/${kind}`].push(n);
      }
    }
    // Responsive is per-route; fold to one number per run. An errored audit is
    // NOT zero: the build did not render, so nothing was measured. Reporting it
    // as 0 would claim a dead app is responsive-perfect, which is precisely the
    // lie the auditor's render assertion exists to prevent. Carry it as null.
    const routes = Object.values(r.meta.responsive ?? {});
    const measured = routes.filter((t) => t && typeof t.all === 'number');
    acc['responsive/all'] ??= [];
    acc['responsive/all'].push(
      routes.length === 0 || measured.length === 0
        ? null
        : measured.reduce((a, t) => a + t.all, 0),
    );
  }
  return acc;
}

// Trials are printed as "total (per-trial)". A null trial is unmeasured, shown
// as n/a, and excluded from the total, which is then marked with a caret so a
// reader can never mistake a partial total for a complete one.
function fmtTrials(xs) {
  if (!xs || !xs.length) return '-';
  const known = xs.filter((x) => x !== null);
  const total = known.reduce((a, b) => a + b, 0);
  const partial = known.length !== xs.length ? '^' : '';
  return `${total}${partial} (${xs.map((x) => (x === null ? 'n/a' : x)).join(', ')})`;
}

function main() {
  const md = process.argv.includes('--md');
  const byCondition = Object.fromEntries(CONDITIONS.map((c) => [c, loadRuns(c)]));
  const counts = CONDITIONS.map((c) => `${c}: ${byCondition[c].length} trial(s)`).join(', ');
  const out = [];
  const line = (s = '') => out.push(s);

  line(md ? '## Capstone results' : 'CAPSTONE RESULTS');
  line();
  line(`Runs found: ${counts}`);
  line();

  if (CONDITIONS.every((c) => byCondition[c].length === 0)) {
    line('No completed runs yet.');
    process.stdout.write(out.join('\n') + '\n');
    return;
  }

  // --- Drift ---------------------------------------------------------------
  const drift = Object.fromEntries(CONDITIONS.map((c) => [c, driftRows(byCondition[c])]));
  const kinds = [...new Set(CONDITIONS.flatMap((c) => Object.keys(drift[c])))].sort();

  line(md ? '### Drift, by kind (sum across trials, per-trial in brackets)' : 'DRIFT BY KIND');
  line();
  if (md) {
    line('| kind | gate-off | gate-on |');
    line('| --- | --- | --- |');
  }
  for (const k of kinds) {
    const off = fmtTrials(drift['gate-off'][k]);
    const on = fmtTrials(drift['gate-on'][k]);
    // A kind that is zero in every trial of both conditions is a null result
    // and still gets printed: the series reports its zeros.
    line(md ? `| \`${k}\` | ${off} | ${on} |` : `  ${k.padEnd(44)} off=${off.padEnd(18)} on=${on}`);
  }
  line();

  // --- Cost ----------------------------------------------------------------
  line(md ? '### Cost, per Haiku subagent' : 'COST PER HAIKU SUBAGENT');
  line();
  if (md) {
    line('| condition | trial | stage | cost USD | turns | wall s | ok |');
    line('| --- | --- | --- | --- | --- | --- | --- |');
  }
  for (const c of CONDITIONS) {
    for (const r of byCondition[c]) {
      for (const s of r.cost?.stages ?? []) {
        const row = [c, r.cost.trial, `${s.stage} ${s.name}`, num(s.costUsd).toFixed(4), s.numTurns ?? '-', Math.round(num(s.wallMs) / 1000), s.ok ? 'y' : 'N'];
        line(md ? `| ${row.join(' | ')} |` : `  ${row.join('  ')}`);
      }
    }
  }
  line();

  line(md ? '### Cost totals' : 'COST TOTALS');
  line();
  if (md) {
    line('| condition | trials | total USD | mean USD/trial | total turns | mean turns/trial |');
    line('| --- | --- | --- | --- | --- | --- |');
  }
  for (const c of CONDITIONS) {
    const runs = byCondition[c];
    if (!runs.length) continue;
    const totalUsd = runs.reduce((a, r) => a + num(r.cost?.totals?.costUsd), 0);
    const totalTurns = runs.reduce((a, r) => a + num(r.cost?.totals?.numTurns), 0);
    const row = [c, runs.length, totalUsd.toFixed(4), (totalUsd / runs.length).toFixed(4), totalTurns, Math.round(totalTurns / runs.length)];
    line(md ? `| ${row.join(' | ')} |` : `  ${row.join('  ')}`);
  }
  line();

  // --- Gate activity -------------------------------------------------------
  line(md ? '### Gate firings and build outcome' : 'GATE FIRINGS');
  line();
  if (md) {
    line('| condition | trial | hook firings | stages ok | build | tampered | run ok |');
    line('| --- | --- | --- | --- | --- | --- | --- |');
  }
  for (const c of CONDITIONS) {
    for (const r of byCondition[c]) {
      // `tampered` is absent on runs that predate the enforcement check, and
      // absent is NOT false: those runs were simply never examined. Two of them
      // DID edit stylelint.config.mjs, which is why the check now exists, so
      // printing "no" for them would assert the opposite of the truth.
      const tamper =
        r.meta.tampered === undefined
          ? 'unchecked'
          : r.meta.tampered
            ? `YES: ${(r.meta.tamperedFiles ?? []).join(' ')}`
            : 'no';
      const row = [c, r.meta.trial, r.meta.hookFirings ?? 0, `${r.cost?.totals?.stagesOk ?? '?'}/${r.cost?.totals?.stages ?? '?'}`, r.meta.buildOk ? 'ok' : 'FAILED', tamper, r.meta.ok ? 'ok' : 'VOID'];
      line(md ? `| ${row.join(' | ')} |` : `  ${row.join('  ')}`);
    }
  }

  process.stdout.write(out.join('\n') + '\n');
}

main();
