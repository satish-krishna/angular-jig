#!/usr/bin/env node

// PostToolUse. The per-edit tier of the fixture constitution.
//
// The fixtures are what enforce the house methodology, so an exemplar drifting
// away from the shape it is cited for is a constitutional event, not a stale
// comment. This hook catches that drift at the moment it happens, while the edit
// is still in the agent's head, instead of a week later when someone finally runs
// the suite.
//
// Anchors only: pure file reads, no eslint, no build, no browser, so it costs
// milliseconds and can run on every edit. The expensive tiers (lint, compile,
// browser) run at Stop, once, and only when src/ actually moved.
//
// A red anchor is a HUMAN checkpoint. The agent must not "fix" it by editing the
// manifest - harness/ is protected, so it cannot - and must not fix it by
// reverting the exemplar either. It reports, and a person decides whether the
// code moved or the claim did.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { logFiring } from './_hook-log.mjs';

const CHECKER = 'harness/fixtures/check-good-fixtures.mjs';

// Nothing to do if the fixture tree is not installed yet.
if (!existsSync(CHECKER)) process.exit(0);

// Drain stdin so the harness does not see a broken pipe.
for await (const _ of process.stdin) void _;

let out = '';
let failed = false;
try {
  out = execFileSync(process.execPath, [CHECKER, '--anchors'], { encoding: 'utf8' });
} catch (e) {
  out = e.stdout || e.message || '';
  failed = true;
}

if (!failed) process.exit(0);

const rotted = out
  .split('\n')
  .filter((l) => l.startsWith('FAIL'))
  .map((l) => `  ${l.slice(5).trim()}`);

logFiring('check-fixture-anchors', 'fixture-anchor', rotted);

process.stderr.write(
  'Fixture anchors broke.\n\n' +
    rotted.join('\n') +
    '\n\n' +
    'Each line names a claim in a spec whose exemplar no longer contains the shape it is\n' +
    'cited for. The fixtures are the executable half of this repo\'s constitution, so this\n' +
    'is one of two things and only a person can say which:\n\n' +
    '  1. The code moved and the claim still holds -> the manifest anchor needs updating.\n' +
    '  2. The claim stopped being true -> the code needs reverting, or the rule needs to go.\n\n' +
    'Do NOT edit harness/fixtures/manifest.json to make this pass; it is protected, and\n' +
    'silencing the anchor is how a spec starts describing code that no longer exists.\n' +
    'Report the break in your response and let a human choose.\n',
);
process.exit(2);
