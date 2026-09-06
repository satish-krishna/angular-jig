#!/usr/bin/env node

// Stop. The full tier: anchors, lint, compile, and every behavioral claim driven
// in a real browser.
//
// This is the only place the browser half can honestly live. A PostToolUse hook
// cannot afford a build plus a browser on every edit, and "run it yourself before
// calling the work done" - which is what .claude/settings.json currently says
// about check:boot and check:responsive - is an honor system, and an honor system
// is not a gate. The whole finding of this repo is that a check nobody runs is a
// check that does not exist.
//
// Cost is paid only when it is owed. The hook hashes every file the outcome can
// depend on (src/, the manifest, the behavior scripts) and skips instantly when
// that hash matches the last passing run. So: ~90s once after a batch of edits,
// and 0s on every turn that changed nothing.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { logFiring } from './_hook-log.mjs';

const CHECKER = 'harness/fixtures/check-good-fixtures.mjs';
const STAMP_DIR = '.angular';
const STAMP = join(STAMP_DIR, 'fixture-check.stamp');

if (!existsSync(CHECKER)) process.exit(0);

for await (const _ of process.stdin) void _;

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const inputs = [
  ...walk('src'),
  ...walk('harness/fixtures'),
].sort();

const hash = createHash('sha256');
for (const file of inputs) {
  hash.update(file.replaceAll('\\', '/'));
  hash.update(readFileSync(file));
}
const digest = hash.digest('hex');

let previous = '';
try {
  previous = readFileSync(STAMP, 'utf8').trim();
} catch {
  previous = '';
}

// Nothing the outcome depends on has moved since the last passing run.
if (previous === digest) process.exit(0);

let out = '';
let failed = false;
try {
  out = execFileSync(process.execPath, [CHECKER], { encoding: 'utf8' });
} catch (e) {
  out = e.stdout || e.message || '';
  failed = true;
}

if (!failed) {
  try {
    mkdirSync(STAMP_DIR, { recursive: true });
    writeFileSync(STAMP, digest, 'utf8');
  } catch {
    // A stamp we cannot write costs time on the next Stop, nothing more.
  }
  process.exit(0);
}

const broken = out
  .split('\n')
  .filter((l) => l.startsWith('FAIL'))
  .map((l) => `  ${l.slice(5).trim()}`);

logFiring('check-fixtures-on-stop', 'fixture-claim', broken);

process.stderr.write(
  'A claim in the constitution stopped being true.\n\n' +
    broken.join('\n') +
    '\n\n' +
    'These are the spec claims no static check can see: a submit button that runs nothing,\n' +
    'an icon that paints nothing, a select that never opens, a dialog with no accessible\n' +
    'name, a ViewModel that throws on render. Every one of them compiles and lints clean,\n' +
    'which is exactly why they are checked here and not by a rule.\n\n' +
    'A behavioral failure is a HUMAN checkpoint. Do not weaken the fixture to get past it;\n' +
    'harness/ is protected. Report which claim broke and what you changed, and let a person\n' +
    'decide whether the code is wrong or the claim is.\n',
);
process.exit(2);
