#!/usr/bin/env node
// One-off maintenance: for every recorded experiment run, save the actual built
// files under <runDir>/impl/, reconstructed from the run's commit (meta.resultSha)
// against its substrate. Runs the driver added this later, so older experiments
// were stored as diff.patch only; this backfills the real implementation so a
// reader can open the before/after code, not apply a patch. Idempotent: skips a
// run that already has an impl/ folder.

import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

function findMetas(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...findMetas(full));
    else if (entry === 'meta.json') out.push(full);
  }
  return out;
}

const expRoot = join(ROOT, 'experiments');
let done = 0;
let skipped = 0;
let missing = 0;

for (const metaPath of findMetas(expRoot)) {
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  const runDir = dirname(metaPath);
  if (meta.dryRun) continue;
  if (existsSync(join(runDir, 'impl'))) {
    skipped += 1;
    continue;
  }
  const substrate = meta.substrate?.sha;
  const result = meta.resultSha;
  if (!substrate || !result) continue;

  let changed;
  try {
    changed = git(['diff', '--name-only', `${substrate}..${result}`]);
  } catch {
    process.stderr.write(`unreachable commit for ${meta.runId} (${result})\n`);
    missing += 1;
    continue;
  }
  const files = changed
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('experiments/'));
  for (const f of files) {
    let content;
    try {
      content = git(['show', `${result}:${f}`]);
    } catch {
      continue;
    }
    const dest = join(runDir, 'impl', f);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, content);
  }
  done += 1;
  process.stdout.write(`backfilled ${meta.runId} (${files.length} files)\n`);
}

process.stdout.write(`\ndone: ${done}, already had impl: ${skipped}, unreachable: ${missing}\n`);
