import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Strips `//` line comments before scanning for quoted entries. Without this,
// an odd single-quote character (an apostrophe) in a comment inside the array
// silently corrupts every entry parsed after it - this already happened once
// during this branch's development. Comments in these arrays carry an
// in-array warning against writing an apostrophe there too; that warning is
// belt-and-braces, kept for a human skimming the source, but this parser must
// not depend on anyone reading it.
const stripLineComments = (block) => block.replace(/\/\/[^\n]*/g, '');

// Pulled out from listFrom so the comment-stripping behavior can be pinned
// against a synthetic array body, not only against whatever PROTECTED and
// ENFORCEMENT_PATHS happen to contain today.
const parseQuotedEntries = (block) => [...stripLineComments(block).matchAll(/'([^']+)'/g)].map((m) => m[1]).sort();

const listFrom = (file, name) => {
  const src = readFileSync(join(root, file), 'utf8');
  const block = src.match(new RegExp(`${name} = \\[([\\s\\S]*?)\\];`))[1];
  return parseQuotedEntries(block);
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

describe('the array-body parser is not fooled by an apostrophe in a comment', () => {
  it('parses entries correctly even when a comment line contains a single quote', () => {
    // This is the sixth silent zero the review flagged: without comment
    // stripping, the lone apostrophe in "editor's" below pairs up with the
    // next real quote character and swallows 'real-entry-one' entirely.
    const body = `
  'zero-entry',
  // a comment mentioning the editor's own habits, with an apostrophe
  'real-entry-one',
  'real-entry-two',
`;
    expect(parseQuotedEntries(body)).toEqual(['real-entry-one', 'real-entry-two', 'zero-entry'].sort());
  });

  it('would have swallowed an entry if comments were not stripped first (proves the bug this guards against)', () => {
    const body = `
  'zero-entry',
  // a comment mentioning the editor's own habits, with an apostrophe
  'real-entry-one',
  'real-entry-two',
`;
    const withoutStripping = [...body.matchAll(/'([^']+)'/g)].map((m) => m[1]).sort();
    expect(withoutStripping).not.toEqual(['real-entry-one', 'real-entry-two', 'zero-entry'].sort());
  });
});
