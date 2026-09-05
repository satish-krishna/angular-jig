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
    // Responsive is per-route; fold to one number per run.
    let resp = 0;
    for (const t of Object.values(r.meta.responsive ?? {})) resp += num(t?.all);
    acc['responsive/all'] ??= [];
    acc['responsive/all'].push(resp);
  }
  return acc;
}

function fmtTrials(xs) {
  if (!xs || !xs.length) return '-';
  const total = xs.reduce((a, b) => a + b, 0);
  return `${total} (${xs.join(', ')})`;
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
    line('| condition | trial | hook firings | stages ok | build | run ok |');
    line('| --- | --- | --- | --- | --- | --- |');
  }
  for (const c of CONDITIONS) {
    for (const r of byCondition[c]) {
      const row = [c, r.meta.trial, r.meta.hookFirings ?? 0, `${r.cost?.totals?.stagesOk ?? '?'}/${r.cost?.totals?.stages ?? '?'}`, r.meta.buildOk ? 'ok' : 'FAILED', r.meta.ok ? 'ok' : 'VOID'];
      line(md ? `| ${row.join(' | ')} |` : `  ${row.join('  ')}`);
    }
  }

  process.stdout.write(out.join('\n') + '\n');
}

main();
