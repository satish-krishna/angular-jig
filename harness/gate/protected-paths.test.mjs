import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const listFrom = (file, name) => {
  const src = readFileSync(join(root, file), 'utf8');
  const block = src.match(new RegExp(`${name} = \\[([\\s\\S]*?)\\];`))[1];
  return [...block.matchAll(/'([^']+)'/g)].map((m) => m[1]).sort();
};

// The two lists are deliberately NOT identical. PROTECTED (a live PreToolUse
// guard) also exists to stop an agent READING a prior trial's answers out of
// experiments/ - the capstone found this happening four times. ENFORCEMENT_PATHS
// (a post-hoc diff of what a trial actually committed) has no reason to police
// that: every trial's own commit already excludes experiments/ from what gets
// diffed (see the `git add -A -- :(exclude)experiments` in run-capstone.mjs),
// so adding it there would be inert today and a landmine tomorrow - if that
// exclusion is ever relaxed, every run would void itself as tampered by its
// own recorded output. See the comments above both PROTECTED and
// ENFORCEMENT_PATHS for the full reasoning.
//
// So the invariant worth enforcing is not "these two arrays are equal" - it is
// "no divergence exists beyond this one, named, deliberate exception." Any
// OTHER difference, in either direction, is a live gap and must fail loudly.
const KNOWN_GUARD_ONLY_EXCEPTIONS = ['experiments/'];

describe('the two enforcement-path lists stay in sync (modulo one named exception)', () => {
  it('PROTECTED and ENFORCEMENT_PATHS share the same enforcement core', () => {
    const guard = listFrom('.claude/hooks/protect-enforcement.mjs', 'PROTECTED');
    const driver = listFrom('harness/driver/run-capstone.mjs', 'ENFORCEMENT_PATHS');

    const guardCore = guard.filter((p) => !KNOWN_GUARD_ONLY_EXCEPTIONS.includes(p));
    expect(guardCore).toEqual(driver);

    // The exception itself must actually be present only where documented -
    // otherwise this test would be vacuously trivial rather than pinning
    // anything.
    for (const exception of KNOWN_GUARD_ONLY_EXCEPTIONS) {
      expect(guard).toContain(exception);
      expect(driver).not.toContain(exception);
    }
  });

  it('both cover the harness typecheck config', () => {
    expect(listFrom('.claude/hooks/protect-enforcement.mjs', 'PROTECTED')).toContain('tsconfig.harness.json');
    expect(listFrom('harness/driver/run-capstone.mjs', 'ENFORCEMENT_PATHS')).toContain('tsconfig.harness.json');
  });
});
