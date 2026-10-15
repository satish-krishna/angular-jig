import { test, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildDigest } from '../driver/build-house-digest.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIGEST = join(ROOT, 'harness', 'rules', 'HOUSE-RULES.md');
const RULES_DIR = join(ROOT, 'harness', 'rules');

// A generated file that nothing checks is a copy, and a copy of a rule is a
// rule that will eventually disagree with itself. This is the check.
test('the checked-in digest matches what the rule docs currently say', () => {
  expect(existsSync(DIGEST), 'HOUSE-RULES.md is missing; run npm run build:digest').toBe(true);
  expect(readFileSync(DIGEST, 'utf8').replace(/\r\n/g, '\n')).toBe(buildDigest());
});

// The two failure modes that go green on their own. A digest missing a rule
// loads cleanly and reads as a complete set; CLAUDE.md without the include line
// loads cleanly and reads as a project with no house rules at all. Neither
// reports anything wrong, which is exactly why each needs an assertion.
test('every rule document with guidance appears in the digest', () => {
  const digest = readFileSync(DIGEST, 'utf8');
  const expected = readdirSync(RULES_DIR)
    .filter((n) => n.endsWith('.md') && n !== 'HOUSE-RULES.md')
    .filter((n) => /\n## Agent guidance\n/.test(readFileSync(join(RULES_DIR, n), 'utf8').replace(/\r\n/g, '\n')))
    .map((n) => n.replace(/\.md$/, ''));
  expect(expected.length).toBeGreaterThan(0);
  for (const rule of expected) expect(digest).toContain(`### ${rule}\n`);
});

test('CLAUDE.md still includes the digest', () => {
  const claudeMd = readFileSync(join(ROOT, 'CLAUDE.md'), 'utf8');
  expect(claudeMd).toContain('@harness/rules/HOUSE-RULES.md');
});
