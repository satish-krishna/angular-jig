// Strips every prose "Good" example out of the four specs and replaces it with a
// pointer to the fixture that checks the same claim. The Bad half is preserved
// verbatim: a prohibition is decidable and already machine-checked, so it stays
// as prose. A recommendation is not, which is why it moves to a fixture.
//
// The rewrite is derived, not retyped: the script finds the Good markers itself
// and looks the fixture up by (spec, rule number) from fixtures/manifest.json, so
// no spec sentence passes through a model's fingers.
//
// Run it yourself; the protect-enforcement hook stops the agent from touching
// harness/.
//
//   node <this file>            # dry run, prints every rewrite
//   node <this file> --write    # apply
//
// Refuses to write unless every Good marker it finds maps to a manifest entry and
// every construction entry for that spec is accounted for.

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
// JIG_REPO lets the dry run target a worktree of another branch, since the specs
// live on main and this branch is the stripped substrate.
const REPO = process.env.JIG_REPO ? resolve(process.env.JIG_REPO) : resolve(HERE, '..');
const WRITE = process.argv.includes('--write');

const manifest = JSON.parse(await readFile(join(HERE, 'fixtures/manifest.json'), 'utf8'));

const bySpec = new Map();
for (const f of manifest.fixtures) {
  if (!bySpec.has(f.spec)) bySpec.set(f.spec, new Map());
  bySpec.get(f.spec).set(f.rule, f);
}

const HEADING = /^#{2,4}\s+(\d+)\.\s/;
// The window has to clear the longest parenthetical in the specs,
// "Good (passes, straight from the docs):", at 32 characters.
const GOOD = /\bGood\b[^:]{0,40}:/;
const BAD = /\bBad\b[^:]{0,24}:/;

const RUNNER = 'harness/fixtures/check-good-fixtures.mjs';

let problems = 0;

for (const [spec, rules] of bySpec) {
  const path = join(REPO, spec);
  let text;
  try {
    text = await readFile(path, 'utf8');
  } catch {
    console.error(`SKIP ${spec}: not present on this branch (it lives on main)`);
    problems++;
    continue;
  }

  const lines = text.split(/\r?\n/);
  const out = [];
  const covered = new Set();
  let rule = null;

  for (const line of lines) {
    const heading = line.match(HEADING);
    if (heading) rule = Number(heading[1]);

    if (!GOOD.test(line) || rule === null) {
      out.push(line);
      continue;
    }

    const fixture = rules.get(rule);
    if (!fixture) {
      console.error(`STOP ${spec}: a Good example under rule ${rule} has no manifest entry`);
      problems++;
      out.push(line);
      continue;
    }

    const goodAt = line.search(GOOD);
    const prefix = line.slice(0, goodAt).trimEnd();
    const rest = line.slice(goodAt);

    const badAt = rest.search(BAD);
    const bad = badAt >= 0 ? rest.slice(badAt).trim() : '';

    const pointer =
      fixture.form === 'negation'
        ? 'The Good case is the absence of the Bad; there is nothing further to state.'
        : `The Good case is fixture \`${fixture.id}\`, checked by \`${RUNNER}\`` +
          (fixture.behavior ? ' in a browser, because no static check can see this claim.' : '.');

    const rebuilt = [prefix, bad, pointer].filter(Boolean).join(' ');
    out.push(rebuilt);
    covered.add(rule);

    console.log(`${spec} rule ${rule}`);
    console.log(`  -  ${line.trim().slice(0, 150)}`);
    console.log(`  +  ${rebuilt.trim().slice(0, 150)}`);
  }

  const missed = [...rules.keys()].filter((r) => !covered.has(r));
  if (missed.length) {
    console.error(`STOP ${spec}: manifest rules with no Good example found in the file: ${missed.join(', ')}`);
    problems++;
    continue;
  }

  if (WRITE) {
    await writeFile(path, out.join('\n'), 'utf8');
    console.log(`WROTE ${spec} (${covered.size} rewrites)`);
  } else {
    console.log(`dry run: ${spec} would take ${covered.size} rewrites`);
  }
}

if (problems) {
  console.error(`\n${problems} spec(s) not rewritten. Nothing was written for those.`);
  process.exit(1);
}
console.log(WRITE ? '\napplied' : '\ndry run only; pass --write to apply');
