// Every "Good example" a spec makes, checked instead of asserted.
//
// The specs' Bad examples have always been machine-checked: gate.test.mjs lints
// dirty fixtures and the counters tally them. The Good examples were prose, and
// prose is where the constitution rotted - `harness/component-shape-spec.md` rule
// 14 recommended a submit pattern that produces a dead button, and five other
// files inherited it verbatim from that one sentence.
//
// A claim is checked at the weakest level that can actually see it:
//
//   anchored   the exemplar file exists and still contains the shape it is cited
//              for, so a pointer cannot rot into a lie while the suite stays green
//   lint-clean the exemplar passes all 26 gate rules - a Good example that trips
//              the gate is a contradiction in the spec
//   compiles   the app builds with the exemplar in it
//   behaves    the claim is driven in a browser, because compiling and linting
//              cannot see a dead button, a blank icon, a select that never opens,
//              or a NullInjectorError - which is the entire list of defects this
//              repo has actually shipped
//
// A `construction` entry with no exemplar is reported UNEXERCISED and fails the
// run. That is the point: an unverifiable claim should be a number the harness
// prints, not a sentence nobody re-reads.
//
// Usage:
//   node harness/fixtures/check-good-fixtures.mjs             # everything (~90s)
//   node harness/fixtures/check-good-fixtures.mjs --static    # no browser (~8s)
//   node harness/fixtures/check-good-fixtures.mjs --anchors   # anchors only (~10ms)
//
// --anchors is the per-edit tier. It catches the failure that killed rule 14 in
// slow motion: an exemplar drifts away from the shape it is cited for while the
// suite stays green. Pure file reads, no eslint, no build, no browser.
//
// Exit 0 if every claim is verified, 1 otherwise.

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');
const ANCHORS_ONLY = process.argv.includes('--anchors');
const STATIC_ONLY = ANCHORS_ONLY || process.argv.includes('--static');

// `shell: true`, because npx is a .cmd shim on Windows and execFileSync cannot
// spawn one directly (EINVAL). Arguments here are repo-relative paths from the
// manifest, never user input.
const run = (command) =>
  execSync(command, { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

const results = [];
const record = (id, check, ok, detail = '') => results.push({ id, check, ok, detail });

const manifest = JSON.parse(await readFile(join(HERE, 'manifest.json'), 'utf8'));
const fixtures = manifest.fixtures;

// ---------------------------------------------------------------- anchored --

const exemplars = new Set();

for (const f of fixtures) {
  if (f.form === 'negation') {
    if (f.exemplar) record(f.id, 'anchored', false, 'a negation entry must not carry an exemplar');
    continue;
  }
  if (!f.exemplar) {
    record(f.id, 'anchored', false, 'UNEXERCISED: a construction claim with no exemplar is unverified prose');
    continue;
  }
  const path = join(REPO, f.exemplar);
  if (!existsSync(path)) {
    record(f.id, 'anchored', false, `exemplar missing: ${f.exemplar}`);
    continue;
  }
  const source = await readFile(path, 'utf8');
  const lost = f.anchors.filter((a) => !source.includes(a));
  record(
    f.id,
    'anchored',
    lost.length === 0,
    lost.length ? `${f.exemplar} no longer contains: ${lost.join(' | ')}` : f.exemplar,
  );
  if (lost.length === 0) exemplars.add(f.exemplar);
}

// -------------------------------------------------------------- lint-clean --

const lintTargets = ANCHORS_ONLY ? [] : [...exemplars];
let lintByFile = new Map();
if (lintTargets.length) {
  let raw = '';
  try {
    raw = run(`npx eslint ${lintTargets.map((t) => `"${t}"`).join(' ')} -f json`);
  } catch (e) {
    raw = e.stdout || '';
  }
  try {
    for (const file of JSON.parse(raw)) {
      lintByFile.set(resolve(file.filePath), file.messages.length);
    }
  } catch {
    record('*', 'lint-clean', false, 'eslint produced no parseable JSON');
  }
}

if (!ANCHORS_ONLY) {
  for (const f of fixtures) {
    if (!f.exemplar || !exemplars.has(f.exemplar)) continue;
    const count = lintByFile.get(resolve(REPO, f.exemplar));
    // An exemplar eslint never reported on is a hole in the check, not a pass.
    if (count === undefined) {
      record(f.id, 'lint-clean', false, `eslint returned no result for ${f.exemplar}`);
      continue;
    }
    record(f.id, 'lint-clean', count === 0, count ? `${count} gate violation(s)` : '');
  }
}

// ---------------------------------------------------------------- compiles --

let built = false;
if (ANCHORS_ONLY) {
  record('*', 'compiles', true, 'skipped (--anchors)');
} else {
  try {
    run('npx ng build');
    built = true;
    record('*', 'compiles', true, 'ng build');
  } catch (e) {
    record('*', 'compiles', false, (e.stdout || e.message || '').split('\n').slice(-6).join(' '));
  }
}

// ---------------------------------------------------------------- behaves ---

const behavioral = fixtures.filter((f) => f.behavior);

if (STATIC_ONLY) {
  for (const f of behavioral) {
    record(f.id, 'behaves', true, ANCHORS_ONLY ? 'skipped (--anchors)' : 'skipped (--static)');
  }
} else if (!built) {
  for (const f of behavioral) record(f.id, 'behaves', false, 'not run: the build failed');
} else {
  const { serveStatic, launchChromium } = await import(
    pathToFileURL(join(REPO, 'harness/playwright/serve-and-visit.mjs')).href
  );
  const server = await serveStatic(join(REPO, 'dist/angular-jig/browser'));
  const browser = await launchChromium();
  try {
    for (const f of behavioral) {
      const context = await browser.newContext({ viewport: { width: 1000, height: 1000 } });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', (e) => pageErrors.push(e.message));
      page.on('console', (m) => m.type() === 'error' && pageErrors.push(m.text()));
      try {
        const mod = await import(pathToFileURL(join(HERE, f.behavior)).href);
        await mod.check({ page, origin: server.origin, pageErrors });
        record(f.id, 'behaves', true, f.claim.split('.')[0]);
      } catch (e) {
        record(f.id, 'behaves', false, e.message.split('\n')[0]);
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
    await server.close();
  }
}

// ----------------------------------------------------------------- report ---

const byId = new Map();
for (const r of results) {
  if (!byId.has(r.id)) byId.set(r.id, []);
  byId.get(r.id).push(r);
}

let failed = 0;
for (const [id, checks] of byId) {
  for (const c of checks) {
    if (!c.ok) failed++;
    const mark = c.ok ? 'ok  ' : 'FAIL';
    console.log(`${mark} ${id.padEnd(34)} ${c.check.padEnd(11)} ${c.detail}`);
  }
}

const negations = fixtures.filter((f) => f.form === 'negation').length;
const constructions = fixtures.length - negations;
const behaviorals = behavioral.length;
const unexercised = results.filter((r) => r.detail.startsWith('UNEXERCISED')).length;

console.log('');
console.log(`Good examples in the specs:        ${fixtures.length}`);
console.log(`  stated as a prohibition only:    ${negations}`);
console.log(`  asserting a positive shape:      ${constructions}`);
console.log(`    of those, driven in a browser: ${behaviorals}`);
console.log(`    of those, still unexercised:   ${unexercised}`);
console.log(`Checks run: ${results.length}, failed: ${failed}`);

process.exit(failed ? 1 : 0);
