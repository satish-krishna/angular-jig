#!/usr/bin/env node
// Does `count` step down one at a time across a rejection streak?
//
// A streak ("episode") is a maximal run of consecutive hook firings, in
// timestamp order within one trial, on the same (hook, file) pair. The
// batching theory this script tests predicts that when an agent is corrected
// on N violations at once, it walks them one at a time and `count` decreases
// by roughly 1 per rejection ("the queue-walk signature"). This script counts
// how often that actually happens across every `hook-firings.jsonl` this
// repo has recorded, and reports the alternative: count staying flat or
// rising, which is not queue-walking at all.
//
// Run with --json to get the same numbers as a single machine-readable
// object instead of the human-readable report, so a claim about these
// figures can be checked by re-running this script rather than trusted.
//
// Logs are found by walking the filesystem from this script's own location
// rather than shelling out to POSIX `find` against the current working
// directory: `find` is not on a Windows-primary machine's PATH by default,
// and even where it is, a script run from the wrong directory used to find
// nothing and print a fully-formed report of NaN% and -Infinity at exit 0 -
// a silent zero. Resolving relative to import.meta.url makes the answer the
// same regardless of cwd, and the empty-result guard below makes "no data"
// loud instead of decorated with fake numbers.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const asJson = process.argv.includes('--json');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EXPERIMENTS_DIR = join(ROOT, 'experiments');

function findHookFiringsLogs(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findHookFiringsLogs(full));
    } else if (entry.isFile() && entry.name === 'hook-firings.jsonl') {
      out.push(full);
    }
  }
  return out;
}

function fail(message) {
  process.stderr.write(`analyze-streaks: ${message}\n`);
  process.exit(1);
}

const logs = findHookFiringsLogs(EXPERIMENTS_DIR);
if (logs.length === 0) {
  fail(
    `no hook-firings.jsonl files found under ${EXPERIMENTS_DIR}. There is no data to ` +
      `analyze - not printing a report.`,
  );
}

// Strip the leading "path:line:col  " and the trailing "(rule-id)" so two
// firings that report the SAME violation at a shifted line still compare equal
// on identity, but a different violation does not. Without stripping the line
// number, an edit that shifts a still-unfixed violation down by one line would
// register as a "different" violation clearing and a new one appearing, which
// would overcount progress that never happened.
const identity = (m) => {
  const s = String(m).replace(/^.*?:\d+(:\d+)?\s+/, '');
  return s.slice(0, 140);
};

const allStreaks = [];

for (const path of logs) {
  const run = path.split(/[\\/]/).slice(-2)[0];
  const rows = readFileSync(path, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .sort((a, b) => a.ts.localeCompare(b.ts));

  let cur = null;
  const flush = () => { if (cur) allStreaks.push(cur); cur = null; };
  for (const r of rows) {
    const key = `${r.hook}|${r.file}`;
    if (!cur || cur.key !== key) { flush(); cur = { run, key, hook: r.hook, file: r.file.split(/[\\/]/).pop(), firings: [] }; }
    cur.firings.push({ count: r.count, ids: new Set((r.messages ?? []).map(identity)), ts: r.ts });
  }
  flush();
}

if (allStreaks.length === 0) {
  fail(
    `found ${logs.length} hook-firings.jsonl file(s) but parsed zero episodes out of them. ` +
      `There is no data to analyze - not printing a report.`,
  );
}

const fmtDelta = (s) => {
  const out = [];
  for (let i = 1; i < s.firings.length; i++) {
    const prev = s.firings[i - 1], cur = s.firings[i];
    const cleared = [...prev.ids].filter((x) => !cur.ids.has(x)).length;
    const added = [...cur.ids].filter((x) => !prev.ids.has(x)).length;
    out.push(`${cleared>0?'-':''}${cleared}/+${added}`);
  }
  return out.join(' ');
};

const deep = allStreaks.filter((s) => s.firings.length >= 2).sort((a, b) => b.firings.length - a.firings.length);

// Depth histogram over ALL streaks = the correction-episode distribution.
const hist = {};
for (const s of allStreaks) hist[s.firings.length] = (hist[s.firings.length] ?? 0) + 1;
const total = allStreaks.length;

// The core test: across multi-violation streaks, how does count move?
let stepDown = 0, flatOrUp = 0, jumpDown = 0, steps = 0;
for (const s of deep) {
  for (let i = 1; i < s.firings.length; i++) {
    const d = s.firings[i - 1].count - s.firings[i].count;
    steps++;
    if (d === 1) stepDown++;
    else if (d <= 0) flatOrUp++;
    else jumpDown++;
  }
}

// Does a rejection carry more than one violation at all? If most firings
// report count==1 there is nothing to batch and the theory is inapplicable.
const counts = allStreaks.flatMap((s) => s.firings.map((f) => f.count));
const one = counts.filter((c) => c === 1).length;

if (asJson) {
  const depthDistribution = Object.keys(hist)
    .map(Number)
    .sort((a, b) => a - b)
    .map((depth) => ({ depth, episodes: hist[depth], share: hist[depth] / total }));

  console.log(JSON.stringify({
    episodeCount: total,
    depthDistribution,
    clearedOnFirstRejectionShare: (hist[1] ?? 0) / total,
    batchingTest: {
      transitions: steps,
      stepDown1: stepDown,
      stepDown1Share: stepDown / steps,
      jumpDownGt1: jumpDown,
      jumpDownGt1Share: jumpDown / steps,
      flatOrUp,
      flatOrUpShare: flatOrUp / steps,
    },
    firings: {
      total: counts.length,
      exactlyOneViolation: one,
      exactlyOneViolationShare: one / counts.length,
      max: Math.max(...counts),
      mean: counts.reduce((a, b) => a + b, 0) / counts.length,
    },
    deepestStreaks: deep.map((s) => ({
      run: s.run,
      hook: s.hook,
      file: s.file,
      depth: s.firings.length,
      counts: s.firings.map((f) => f.count),
      clearedAddedPerStep: fmtDelta(s),
    })),
  }, null, 2));
} else {
  console.log('=== ALL STREAKS OF DEPTH >= 2, count trajectory ===\n');
  for (const s of deep) {
    console.log(
      `depth ${String(s.firings.length).padStart(2)}  ${s.hook.padEnd(22)} ${s.file.padEnd(26)} ` +
      `counts: [${s.firings.map((f) => f.count).join(', ')}]`
    );
    console.log(`${' '.repeat(10)}cleared/added per step: ${fmtDelta(s)}   (${s.run})`);
  }

  console.log(`\n=== EPISODE DEPTH DISTRIBUTION (n=${total} episodes) ===`);
  for (const d of Object.keys(hist).map(Number).sort((a, b) => a - b)) {
    console.log(`  depth ${String(d).padStart(2)}: ${String(hist[d]).padStart(3)}  (${((hist[d]/total)*100).toFixed(0)}%)`);
  }
  console.log(`  cleared on first rejection (depth 1): ${((hist[1]??0)/total*100).toFixed(0)}%`);

  console.log('\n=== THE BATCHING TEST ===');
  console.log(`  transitions within streaks: ${steps}`);
  console.log(`  count fell by exactly 1 (queue-walk signature): ${stepDown} (${(stepDown/steps*100).toFixed(0)}%)`);
  console.log(`  count fell by >1 (batch fix):                   ${jumpDown} (${(jumpDown/steps*100).toFixed(0)}%)`);
  console.log(`  count flat or ROSE (no progress / regression):  ${flatOrUp} (${(flatOrUp/steps*100).toFixed(0)}%)`);

  console.log(`\n=== IS THERE ANYTHING TO BATCH? (n=${counts.length} firings) ===`);
  console.log(`  firings reporting exactly 1 violation: ${one} (${(one/counts.length*100).toFixed(0)}%)`);
  console.log(`  max violations in one firing: ${Math.max(...counts)}`);
  console.log(`  mean violations per firing: ${(counts.reduce((a,b)=>a+b,0)/counts.length).toFixed(2)}`);
}
