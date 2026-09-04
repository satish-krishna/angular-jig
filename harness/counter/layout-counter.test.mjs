import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { layoutTally, layoutCountFile } from './layout-counter.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fx = (name) => join(here, 'fixtures', name);

describe('layout counter: templates', () => {
  it('tallies literal values and presentation on raw elements', () => {
    const result = layoutTally([fx('layout-dirty.html')]);
    // literal-value: w-[327px], p-[7px], text-[#0af]  = 3 (per arbitrary-bracket token)
    // presentation-on-raw: the <div class="bg-blue-50 border rounded-lg shadow"> = 1 (per element)
    // the <button hlmBtn> is a primitive: Part 1 owns it, Part 2 skips it.
    expect(result.totals).toEqual({
      'literal-value': 3,
      'presentation-on-raw': 1,
      'nested-flex-grid': 0,
      all: 4,
    });
  });

  it('fires the nested-flex heuristic on a flex-of-flex', () => {
    const result = layoutTally([fx('layout-nested.html')]);
    expect(result.totals['nested-flex-grid']).toBe(1);
    expect(result.totals['literal-value']).toBe(0);
    expect(result.totals['presentation-on-raw']).toBe(0);
  });

  it('passes a clean grammar template with zero violations', () => {
    expect(layoutCountFile(fx('layout-clean.html'))).toEqual([]);
  });
});

describe('layout counter: stylesheet pass', () => {
  it('flags literal hex and px in a component styles block, not tokens', () => {
    const result = layoutTally([fx('layout-dirty.component.ts')]);
    // CSS: #3b82f6 (hex) + 16px (raw length) = 2 literal-value; var(--radius) is a token.
    // The semantic class "card" on the div is NOT presentation-on-raw (Part 3's boundary).
    expect(result.totals).toEqual({
      'literal-value': 2,
      'presentation-on-raw': 0,
      'nested-flex-grid': 0,
      all: 2,
    });
  });
});

describe('layout counter: no double count, comments ignored', () => {
  it('counts a styleUrl stylesheet once and skips a px in a comment', () => {
    // The .ts references the .css via styleUrl; tallying both must count the
    // one real literal (8px) once, not twice, and must ignore the 16px that
    // lives in a CSS comment.
    const result = layoutTally([fx('layout-styleurl.component.ts'), fx('layout-styleurl.css')]);
    expect(result.totals['literal-value']).toBe(1);
    expect(result.totals.all).toBe(1);
  });
});

describe('layout counter: output contract', () => {
  it('is deterministic across repeated runs', () => {
    const a = JSON.stringify(layoutTally([fx('layout-dirty.html'), fx('layout-dirty.component.ts')]));
    const b = JSON.stringify(layoutTally([fx('layout-dirty.html'), fx('layout-dirty.component.ts')]));
    expect(a).toBe(b);
  });
});
