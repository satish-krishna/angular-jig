import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tally, countFile } from './counter.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fx = (name) => join(here, 'fixtures', name);

describe('structural counter: external templates', () => {
  it('tallies the dirty fixture by exact kind', () => {
    const result = tally([fx('dirty.html')]);
    // Hand-counted from fixtures/dirty.html:
    //   raw-control:             <button>Save, <input />                    = 2
    //   appearance-on-primitive: bg- on hlmBtn, p- on hlmInput             = 2
    //   style-attribute:         static style="" on <div>                  = 1
    // NOT flagged: layout class on a primitive (justify-between, w-full),
    // a [style.width] binding, a bare <a>.
    expect(result.totals).toEqual({
      'raw-control': 2,
      'appearance-on-primitive': 2,
      'style-attribute': 1,
      all: 5,
    });
  });

  it('finds zero violations in the clean fixture (all docs-good patterns)', () => {
    const result = tally([fx('clean.html')]);
    expect(result.totals).toEqual({
      'raw-control': 0,
      'appearance-on-primitive': 0,
      'style-attribute': 0,
      all: 0,
    });
  });

  it('does not flag layout classes on a primitive, or a token-styled div', () => {
    const violations = countFile(fx('clean.html'));
    expect(violations).toEqual([]);
  });
});

describe('structural counter: inline templates in .ts components', () => {
  it('extracts and tallies an inline @Component template', () => {
    const result = tally([fx('dirty.component.ts')]);
    // <button>Inline (raw-control) + static style on <input hlmInput> (style-attribute)
    expect(result.totals).toEqual({
      'raw-control': 1,
      'appearance-on-primitive': 0,
      'style-attribute': 1,
      all: 2,
    });
  });

  it('reports line numbers offset into the real .ts file, not the template', () => {
    const violations = countFile(fx('dirty.component.ts'));
    // The inline template starts at line 7 (`template: \``); the <button> is on
    // the following line, so it must report a line well past line 1.
    const button = violations.find((v) => v.kind === 'raw-control');
    expect(button.line).toBeGreaterThan(5);
  });
});

describe('structural counter: output contract', () => {
  it('orders violations by file, then line, then kind', () => {
    const { violations } = tally([fx('dirty.html')]);
    const keys = violations.map((v) => `${v.file}::${String(v.line).padStart(4, '0')}::${v.kind}`);
    const sorted = [...keys].sort();
    expect(keys).toEqual(sorted);
  });

  it('is deterministic: same input twice serializes byte-identical', () => {
    const a = JSON.stringify(tally([fx('dirty.html'), fx('dirty.component.ts')]));
    const b = JSON.stringify(tally([fx('dirty.html'), fx('dirty.component.ts')]));
    expect(a).toBe(b);
  });
});
